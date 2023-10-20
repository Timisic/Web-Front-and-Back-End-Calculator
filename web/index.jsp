<%@ page import="java.sql.Connection" %>
<%@ page import="java.sql.DriverManager" %>
<%@ page import="java.sql.SQLException" %>
<%@ page import="java.sql.Statement" %>
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="css/cal.css">
</head>
<body>
<%
  try {
    Class.forName("com.mysql.cj.jdbc.Driver");
  } catch (ClassNotFoundException e) {
    throw new RuntimeException(e);
  }
  Connection con;
  try {
    con = DriverManager.getConnection("jdbc:mysql://1.12.68.118:3306/test2", "YanServer", "123test");
  } catch (SQLException e) {
    throw new RuntimeException(e);
  }
  try {
    Statement sta = con.createStatement();
  } catch (SQLException e) {
    throw new RuntimeException(e);
  }
%>
<div class="calculator">
  <header class="cal-header">Calculator by Tim</header>
  <main class="cal-main">
    <div class="origin-value">0</div>
    <div class="cal-keyboard">
      <ul class="cal-items">
        <li data-action="num">7</li>
        <li data-action="num">8</li>
        <li data-action="num">9</li>
        <li data-action="operator">+</li>
        <li data-action="operator">-</li>
        <li data-action="operator">%</li>
        <li data-action="operator">Back</li>
        <li data-action="num">4</li>
        <li data-action="num">5</li>
        <li data-action="num">6</li>
        <li data-action="operator">x</li>
        <li data-action="operator">/</li>
        <li data-action="operator">sqrt(x)</li>
        <li data-action="operator">AC</li>
        <li data-action="num">1</li>
        <li data-action="num">2</li>
        <li data-action="num">3</li>
        <li data-action="operator">e^(x)</li>
        <li data-action="operator">log(x)</li>
        <li data-action="operator">(</li>
        <li data-action="operator">)</li>
        <li data-action="num">0</li>
        <li data-action="num">.</li>
        <li data-action="operator">ANS</li>
        <li data-action="operator">cos(x)</li>
        <li data-action="operator">sin(x)</li>
        <li data-action="operator">SCI</li>
        <li data-action="operator">=</li>
      </ul>
    </div>
  </main>
  <!-- History Box -->
  <div class="history-box">
    <header class="history-header">History</header>
    <ul class="history-list"></ul>
  </div>
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="js/math.js" type="text/javascript"></script>
<script src="js/cal.js"></script>
</body>
</html>