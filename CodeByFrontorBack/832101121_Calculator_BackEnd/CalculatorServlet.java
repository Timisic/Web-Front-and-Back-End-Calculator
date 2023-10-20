package com.mycalc.servlet;
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.*;
import javax.sql.DataSource;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import net.objecthunter.exp4j.Expression;
import net.objecthunter.exp4j.ExpressionBuilder;

public class CalculatorServlet extends HttpServlet {

    private DataSource dataSource;

    // Initialize MySQL database connection
    public void init() throws ServletException {
        try {
            Context initContext = new InitialContext();
            Context envContext  = (Context)initContext.lookup("java:/comp/env");
            dataSource = (DataSource)envContext.lookup("jdbc/calculatorDB");
        } catch (NamingException ne) {
            throw new ServletException("Can't get database connection", ne);
        }
    }

    // Handle POST request to store calculations and send data to front end
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set response header support CORS
        response.setHeader("Access-Control-Allow-Origin", "*");
        String action = request.getParameter("action");
        String contentType = request.getContentType();

        // Calculate
        if ("calculate".equals(action)) {
            String expression = request.getParameter("expression");
            double result = evaluateExpression(expression);
            response.getWriter().write(Double.toString(result));
        } else { // Store the calculation
            if (contentType != null && !contentType.equals("application/x-www-form-urlencoded")) {
                // Send error response
                response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
                return;
            }
            String expression = request.getParameter("expression");
            String result = request.getParameter("result");
            CalculationDAO calculationDAO = new CalculationDAO(dataSource);
            try {
                calculationDAO.storeCalculation(expression, result);
                response.getWriter().write("Stored Successfully");
            } catch (SQLException e) {
                log("Error while inserting data", e);
                response.getWriter().write("Failed to store data");
            }
        }
    }

    // Handle GET request to fetch history
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        CalculationDAO calculationDAO = new CalculationDAO(dataSource);
        try {
            String historyJson = calculationDAO.fetchHistory();
            response.getWriter().write(historyJson);
        } catch (SQLException e) {
            log("Error while fetching data", e); // Better logging
            response.getWriter().write("Failed to fetch data");
        }
    }
    private double evaluateExpression(String expression) {
        try {
            Expression e = new ExpressionBuilder(expression).build();
            return e.evaluate();
        } catch (Exception e) {
            return Double.NaN;
        }
    }
}

class CalculationDAO {
    private DataSource dataSource;

    public CalculationDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Store calculations into the database
    public void storeCalculation(String expression, String result) throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            String sql = "INSERT INTO calculations (expression, result) VALUES (?, ?)";
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, expression);
                statement.setString(2, result);
                statement.executeUpdate();
            }
        }
    }

    // Fetch the last 10 calculations from the database
    public String fetchHistory() throws SQLException {
        StringBuilder json = new StringBuilder("[");
        try (Connection connection = dataSource.getConnection()) {
            String sql = "SELECT expression, result FROM calculations ORDER BY id DESC LIMIT 10";
            try (PreparedStatement statement = connection.prepareStatement(sql);
                 ResultSet resultSet = statement.executeQuery()) {

                while (resultSet.next()) {
                    String expression = resultSet.getString("expression");
                    String result = resultSet.getString("result");
                    json.append("{\"expression\":\"").append(expression).append("\", \"result\":\"").append(result).append("\"},");
                }
            }
        }
        if (json.length() > 1) {
            json.deleteCharAt(json.length() - 1);
        }
        json.append("]");
        return json.toString();
    }
}