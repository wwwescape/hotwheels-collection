import axios from 'axios';
import { REACT_APP_API_URL } from '../constants';

const CAR_SERVICE_API_URL = `${REACT_APP_API_URL}/cars`;

export const getCars = () => axios.get(CAR_SERVICE_API_URL);
export const addCar = (car) => axios.post(CAR_SERVICE_API_URL, car, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const updateCar = (id, car) => axios.put(`${CAR_SERVICE_API_URL}/${id}`, car, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteCar = (id) => axios.delete(`${CAR_SERVICE_API_URL}/${id}`);