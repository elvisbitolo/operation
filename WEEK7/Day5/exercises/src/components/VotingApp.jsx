import React, { useState } from 'react';

const VotingApp = () => {
    const [languages, setLanguages] = useState([
        { name: "Php", votes: 0 },
        { name: "Python", votes: 0 },
        { name: "JavaScript", votes: 0 },
        { name: "Java", votes: 0 }
    ]);

    const vote = (index) => {
        const newLanguages = [...languages];
        newLanguages[index].votes++;
        setLanguages(newLanguages);
    };

    return (
        <div className="exercise-card voting-card">
            <h2>Daily Challenge: Voting App</h2>
            <div className="languages-list">
                {languages.map((lang, index) => (
                    <div key={index} className="language-item" onClick={() => vote(index)}>
                        <span className="vote-count">{lang.votes}</span>
                        <span className="language-name">{lang.name}</span>
                        <span className="click-to-vote">Click to vote</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VotingApp;
