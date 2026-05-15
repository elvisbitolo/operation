import React, { useState } from 'react';

const Events = () => {
    const [isToggleOn, setIsToggleOn] = useState(true);

    const clickMe = () => {
        alert('I was clicked');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            alert(`The Enter key was pressed, your input is: ${event.target.value}`);
        }
    };

    const toggleState = () => {
        setIsToggleOn(!isToggleOn);
    };

    return (
        <div className="exercise-card">
            <h2>Exercise 2: Events</h2>
            <div className="event-controls">
                <button onClick={clickMe} className="btn-primary">Click Me</button>
                
                <input 
                    type="text" 
                    placeholder="Press Enter to alert..." 
                    onKeyDown={handleKeyDown}
                    className="input-field"
                />

                <button onClick={toggleState} className="btn-secondary">
                    {isToggleOn ? 'ON' : 'OFF'}
                </button>
            </div>
        </div>
    );
};

export default Events;
