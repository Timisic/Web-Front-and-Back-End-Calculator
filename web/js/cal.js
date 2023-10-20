const originValue = document.querySelector('.origin-value');
const buttons = document.querySelectorAll('.cal-items li');
const historyList = document.querySelector('.history-list');

let currentExpression = '';
let isCalculated = false;
let lastResult = null;
let isSciMode = false;

buttons.forEach(button => {
    button.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const value = this.textContent;

        // Handle number button clicks
        if (action === 'num') {
            if (isCalculated) {
                currentExpression = value;
                isCalculated = false;
            } else {
                currentExpression += value;
            }
            originValue.textContent = currentExpression;

        // Handle operator button clicks and send the expression to back end
        } else if (action === 'operator') {
            if (value === '=') {
                const convertedExpression = convertExpression(currentExpression);
                $.ajax({
                    url: 'http://localhost:8080/WebFrontBackCalculator/calculator',
                    type: 'POST',
                    data: {
                        action: 'calculate',
                        expression: convertedExpression
                    },
                    success: function(data) {
                        let result = parseFloat(data).toFixed(6);  // Format to 6 decimal places
                        if (isSciMode) {
                            originValue.textContent = parseFloat(result).toExponential();
                        } else {
                            originValue.textContent = result;
                        }
                        addHistory(currentExpression, result);
                        currentExpression = result;
                        lastResult = result;
                        isCalculated = true;
                    },
                    error: function() {
                        alert('Failed to calculate');
                    }
                });
            } else if (value === 'AC') {
                currentExpression = '';
                originValue.textContent = '0';
            } else if (value === 'Back' && currentExpression) {
                currentExpression = currentExpression.slice(0, -1);
                originValue.textContent = currentExpression || '0';
            } else if (value === 'ANS' && lastResult !== null) {
                currentExpression += lastResult;
                originValue.textContent = currentExpression;
            } else if (value === 'SCI') {
                isSciMode = !isSciMode;
            } else if (['e^(x)', 'log(x)', 'cos(x)', 'sin(x)', 'sqrt(x)'].includes(value)) {
                if (['cos(x)', 'sin(x)'].includes(value)){
                    currentExpression = convertDegreesToRadians(currentExpression);
                }
                currentExpression += value.replace('(x)', '(');
                originValue.textContent = currentExpression;
            } else {
                currentExpression += convertOperator(value);
                originValue.textContent = currentExpression;
            }
        }
    });
});

function convertOperator(op) {
    switch(op) {
        case '/': return '/';
        case 'x': return '*';
        case '+': return '+';
        case '-': return '-';
        case '%': return '%';
        default: return op;
    }
}

function convertExpression(expression) {
    let convertedExpression = expression;
    convertedExpression = convertedExpression.replace(/x/g, '*');
    return convertedExpression;
}

function convertDegreesToRadians(expression) {
    return expression.replace(/(sin|cos)\((\d+|\d+\.\d+)\)/g, function(match, func, value) {
        const radianValue = `${value} * pi / 180`;
        return `${func}(${radianValue})`;
    });
}

// ========================================================================================================
// Function to fetch history from the backend
function fetchHistoryFromBackend() {
    $.ajax({
        url: 'http://localhost:8080/WebFrontBackCalculator/calculator',
        type: 'GET',
        success: function(data) {
            const historyData = JSON.parse(data);
            historyList.innerHTML = ''; // Clear existing history
            historyData.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.expression} = ${item.result}`;
                historyList.appendChild(listItem);
            });
        },
        error: function() {
            alert('Failed to fetch history from backend');
        }
    });
}

// Function to add history to database
function addHistory(expression, result) {
    // Store to backend
    $.ajax({
        url: 'http://localhost:8080/WebFrontBackCalculator/calculator',
        type: 'POST',
        data: {
            expression: expression,
            result: result
        },
        success: function() {
            fetchHistoryFromBackend();
        },
        error: function() {
            alert('Failed to store history to backend');
        }
    });
}

// When the page loads, fetch history from the backend
$(document).ready(function() {
    fetchHistoryFromBackend();
});