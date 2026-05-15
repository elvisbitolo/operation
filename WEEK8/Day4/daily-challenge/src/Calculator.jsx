import React, { useState } from 'react';

export function Calculator() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState(null);

  const calculateResult = () => {
    const number1 = parseFloat(num1);
    const number2 = parseFloat(num2);

    if (isNaN(number1) || isNaN(number2)) {
      setResult('Please enter valid numbers');
      return;
    }

    let calcResult;
    switch (operation) {
      case 'add':
        calcResult = number1 + number2;
        break;
      case 'subtract':
        calcResult = number1 - number2;
        break;
      case 'multiply':
        calcResult = number1 * number2;
        break;
      case 'divide':
        if (number2 === 0) {
          calcResult = 'Cannot divide by zero';
        } else {
          calcResult = number1 / number2;
        }
        break;
      default:
        calcResult = 0;
    }

    setResult(calcResult);
  };

  return (
    <div className="calculator-container">
      <h2>React Calculator</h2>
      
      <div className="input-group">
        <input 
          type="number" 
          value={num1} 
          onChange={(e) => setNum1(e.target.value)} 
          placeholder="Enter first number"
        />
      </div>

      <div className="input-group">
        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="add">Addition (+)</option>
          <option value="subtract">Subtraction (-)</option>
          <option value="multiply">Multiplication (*)</option>
          <option value="divide">Division (/)</option>
        </select>
      </div>

      <div className="input-group">
        <input 
          type="number" 
          value={num2} 
          onChange={(e) => setNum2(e.target.value)} 
          placeholder="Enter second number"
        />
      </div>

      <button onClick={calculateResult}>Calculate</button>

      {result !== null && (
        <div className="result-display">
          <h3>Result: {result}</h3>
        </div>
      )}
    </div>
  );
}
