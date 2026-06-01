import React, { Component } from 'react';

export default class BuggyCounter extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prev => {
      const newCount = prev.counter + 1;
      if (newCount === 5) {
        throw new Error('I crashed!');
      }
      return { counter: newCount };
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick} className="btn btn-primary">Counter: {this.state.counter}</button>
      </div>
    );
  }
}
