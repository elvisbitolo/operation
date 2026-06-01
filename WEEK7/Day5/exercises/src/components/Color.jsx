import React, { useState, useEffect } from 'react';

const Color = () => {
    const [favoriteColor, setFavoriteColor] = useState("red");

    useEffect(() => {
        alert("useEffect reached");
    }, []);

    const changeColor = () => {
        setFavoriteColor("blue");
    };

    return (
        <div className="exercise-card">
            <h2>Exercise 4: useEffect hook</h2>
            <header>
                <h1>My Favorite Color is <span style={{ color: favoriteColor }}>{favoriteColor}</span></h1>
            </header>
            <button onClick={changeColor} className="btn-primary">Change Color to Blue</button>
        </div>
    );
};

export default Color;
