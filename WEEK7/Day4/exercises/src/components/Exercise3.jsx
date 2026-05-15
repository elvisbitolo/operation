import React, { Component } from 'react';
import './Exercise.css';

class Exercise extends Component {
    render() {
        const style_header = {
            color: "white",
            backgroundColor: "DodgerBlue",
            padding: "10px",
            fontFamily: "Arial"
        };

        return (
            <div className="exercise-3-container">
                <h1 style={style_header}>This is a Header</h1>
                <p className="para">This is a paragraph with a custom CSS class.</p>
                <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
                
                <form className="example-form">
                    <input type="text" placeholder="Type something..." />
                    <button type="submit">Submit</button>
                </form>

                <div className="image-container">
                    <h3>An Image:</h3>
                    <img src="https://logo.clearbit.com/reactjs.org" alt="React Logo" width="100" />
                </div>

                <div className="list-container">
                    <h3>A List:</h3>
                    <ul>
                        <li>Coffee</li>
                        <li>Tea</li>
                        <li>Milk</li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default Exercise;
