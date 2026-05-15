import React, { useState } from 'react';

const Phone = () => {
    const [phone, setPhone] = useState({
        brand: "Samsung",
        model: "Galaxy S20",
        color: "black",
        year: 2020
    });

    const changeColor = () => {
        setPhone(prevPhone => ({
            ...prevPhone,
            color: "blue"
        }));
    };

    return (
        <div className="exercise-card">
            <h2>Exercise 3: Phone</h2>
            <div className="phone-info">
                <h1>My phone is a {phone.brand}</h1>
                <p>It is a {phone.color} {phone.model} from {phone.year}</p>
                <button onClick={changeColor} className="btn-accent">Change Color</button>
            </div>
        </div>
    );
};

export default Phone;
