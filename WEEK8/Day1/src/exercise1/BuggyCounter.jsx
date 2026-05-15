import React from 'react';

class BuggyCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(({ counter }) => ({
      counter: counter + 1
    }));
  }

  render() {
    if (this.state.counter === 5) {
      throw new Error('I crashed!');
    }
    return (
      <div className="buggy-counter-card">
        <h3 className="counter-title">Buggy Counter</h3>
        <p className="counter-value">{this.state.counter}</p>
        <button className="btn primary-btn" onClick={this.handleClick}>
          Add +1
        </button>
      </div>
    );
  }
}

export default BuggyCounter;
