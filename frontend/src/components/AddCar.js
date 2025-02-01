import React, { useState } from 'react';
import CarForm from './CarForm';
import './CarForm.css';

const AddCar = () => {
  return (
    <div className="form-container">
      <h2>Add</h2>
      <CarForm />
    </div>
  );
};

export default AddCar;