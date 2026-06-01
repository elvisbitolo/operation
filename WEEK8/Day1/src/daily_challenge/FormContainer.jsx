import React, { Component } from 'react';
import FormComponent from './FormComponent';

class FormContainer extends Component {
  constructor() {
    super();
    this.state = {
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      destination: '',
      lactoseFree: false,
      vegan: false,
      kosher: false
    };
  }

  handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'checkbox') {
      this.setState({ [name]: checked });
    } else {
      this.setState({ [name]: value });
    }
  };

  render() {
    return (
      <FormComponent 
        handleChange={this.handleChange} 
        data={this.state} 
      />
    );
  }
}

export default FormContainer;
