import React from 'react';

const FormComponent = (props) => {
  return (
    <div className="form-challenge-container">
      <form className="beautiful-form" action="http://localhost:5173/" method="GET">
        <h2 className="form-title">Sample Form</h2>
        
        <input 
          type="text" 
          name="firstName" 
          value={props.data.firstName} 
          onChange={props.handleChange} 
          placeholder="First Name" 
          className="form-input" 
        />
        
        <input 
          type="text" 
          name="lastName" 
          value={props.data.lastName} 
          onChange={props.handleChange} 
          placeholder="Last Name" 
          className="form-input" 
        />
        
        <input 
          type="number" 
          name="age" 
          value={props.data.age} 
          onChange={props.handleChange} 
          placeholder="Age" 
          className="form-input" 
        />
        
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="male" 
              checked={props.data.gender === "male"} 
              onChange={props.handleChange} 
            /> Male
          </label>
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="female" 
              checked={props.data.gender === "female"} 
              onChange={props.handleChange} 
            /> Female
          </label>
        </div>
        
        <select 
          name="destination" 
          value={props.data.destination} 
          onChange={props.handleChange} 
          className="form-select"
        >
          <option value="">-- Please Choose a destination --</option>
          <option value="Japan">Japan</option>
          <option value="Brazil">Brazil</option>
          <option value="France">France</option>
        </select>
        
        <div className="checkbox-group">
          <h4 className="checkbox-title">Dietary restrictions:</h4>
          <label>
            <input 
              type="checkbox" 
              name="lactoseFree" 
              checked={props.data.lactoseFree} 
              onChange={props.handleChange} 
            /> Lactose Free
          </label>
          <label>
            <input 
              type="checkbox" 
              name="vegan" 
              checked={props.data.vegan} 
              onChange={props.handleChange} 
            /> Vegan
          </label>
          <label>
            <input 
              type="checkbox" 
              name="kosher" 
              checked={props.data.kosher} 
              onChange={props.handleChange} 
            /> Kosher
          </label>
        </div>
        
        <button className="btn submit-btn" type="submit">Submit</button>
      </form>
      
      <div className="entered-info">
        <h2 className="info-title">Entered information:</h2>
        <p>Your name: {props.data.firstName} {props.data.lastName}</p>
        <p>Your age: {props.data.age}</p>
        <p>Your gender: {props.data.gender}</p>
        <p>Your destination: {props.data.destination}</p>
        <p>Your dietary restrictions:</p>
        <div className="restrictions-list">
          <p>**Lactose free: {props.data.lactoseFree ? 'Yes' : 'No'}</p>
          <p>**Vegan: {props.data.vegan ? 'Yes' : 'No'}</p>
          <p>**Kosher: {props.data.kosher ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default FormComponent;
