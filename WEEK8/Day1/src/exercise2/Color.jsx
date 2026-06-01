import React from 'react';

class Child extends React.Component {
  componentWillUnmount() {
    alert('The component named Header is about to be unmounted.');
  }
  render() {
    return <h1 className="header-message">Hello World!</h1>;
  }
}

class Color extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favoriteColor: 'red',
      show: true
    };
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({ favoriteColor: 'yellow' });
    }, 2000);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true; // If false, the color won't change on button click
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log("in getSnapshotBeforeUpdate");
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("after update");
  }

  changeColor = () => {
    this.setState({ favoriteColor: 'blue' });
  };

  deleteChild = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <div className="lifecycle-card">
        <h2 className="section-title">Lifecycle Exercise</h2>
        <div className="color-display">
          My Favorite Color is <span className="color-text" style={{ color: this.state.favoriteColor }}>{this.state.favoriteColor}</span>
        </div>
        <button className="btn primary-btn mb-10" onClick={this.changeColor}>Change color to Blue</button>
        
        <div className="child-container">
          {this.state.show && <Child />}
          {this.state.show && (
            <button className="btn danger-btn" onClick={this.deleteChild}>Delete Child</button>
          )}
        </div>
      </div>
    );
  }
}

export default Color;
