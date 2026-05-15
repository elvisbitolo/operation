import React, { Component } from 'react';

class UserFavoriteAnimals extends Component {
    render() {
        const { favAnimals } = this.props;
        return (
            <div className="animals-container">
                <h3>Favorite Animals:</h3>
                <ul>
                    {favAnimals.map((animal, index) => (
                        <li key={index}>{animal}</li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default UserFavoriteAnimals;
