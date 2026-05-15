import React, { useState } from 'react';
import Garage from './Garage';

const Car = ({ carInfo }) => {
    const [color, setColor] = useState("red");

    return (
        <div className="exercise-card">
            <h2>Exercise 1: Car</h2>
            <p>This car is a <strong>{color}</strong> <strong>{carInfo.model}</strong></p>
            <Garage size="small" />
        </div>
    );
};

export default Car;
