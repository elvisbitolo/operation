import React, { Component } from 'react';

/**
 * LifecycleDemo showcases updating lifecycle methods:
 * - shouldComponentUpdate always returns true.
 * - componentDidUpdate logs after updates.
 * - getSnapshotBeforeUpdate logs before DOM updates.
 * It also changes a color state after 2 seconds to demonstrate updates.
 */
class LifecycleDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favoriteColor: 'red',
      timerId: null,
    };
    console.log('LifecycleDemo: constructor');
  }

  // Always allow updates
  shouldComponentUpdate(nextProps, nextState) {
    console.log('LifecycleDemo: shouldComponentUpdate');
    return true;
  }

  // Called after the component updates in the DOM
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('LifecycleDemo: componentDidUpdate');
    console.log('Previous color:', prevState.favoriteColor, 'Current color:', this.state.favoriteColor);
    console.log('Snapshot from getSnapshotBeforeUpdate:', snapshot);
  }

  // Called right before the DOM is updated
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('LifecycleDemo: getSnapshotBeforeUpdate');
    // Return a simple snapshot value (could be anything useful)
    return { previousColor: prevState.favoriteColor };
  }

  componentDidMount() {
    console.log('LifecycleDemo: componentDidMount');
    // After 2 seconds, change the color to 'yellow' to trigger update
    const timerId = setTimeout(() => {
      this.setState({ favoriteColor: 'yellow' });
    }, 2000);
    this.setState({ timerId });
  }

  componentWillUnmount() {
    console.log('LifecycleDemo: componentWillUnmount');
    if (this.state.timerId) {
      clearTimeout(this.state.timerId);
    }
  }

  render() {
    const { favoriteColor } = this.state;
    const style = {
      padding: '1rem',
      border: '2px solid #ccc',
      borderRadius: '8px',
      backgroundColor: favoriteColor,
      color: favoriteColor === 'yellow' ? '#000' : '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    };
    return (
      <div style={style}>
        {favoriteColor}
      </div>
    );
  }
}

export default LifecycleDemo;
