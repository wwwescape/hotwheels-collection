import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CarForm from './CarForm';
import axios from 'axios';
import { REACT_APP_API_URL } from '../constants';
import './CarForm.css';

const EditCar = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/cars/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error('Error fetching car:', error);
      }
    };
    fetchCar();
  }, [id]);

  return (
    <div className="form-container">
      <h2>Edit</h2>
      {car ? <CarForm car={car} /> : <p>Loading...</p>}
    </div>
  );
};

export default EditCar;