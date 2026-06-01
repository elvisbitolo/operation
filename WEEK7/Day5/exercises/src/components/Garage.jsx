import React from 'react';

const Garage = ({ size }) => {
    return (
        <div className="garage-info">
            <p>Who lives in my <strong>{size}</strong> Garage?</p>
        </div>
    );
};

export default Garage;
