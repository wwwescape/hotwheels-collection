import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { REACT_APP_API_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import './CarForm.css';

const CarForm = ({ car }) => {
  const [formData, setFormData] = useState(
    car || {
      name: '',
      collectionNumber: '',
      year: '',
      color: '',
      series: '',
      number: '',
      quantity: 0,
      type: 'Car',
      subType: 'Car',
      owned: false,
      missing: false,
      brand: 'Hot Wheels', // Default brand
      image: null,
    }
  );
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(car?.image ? `${REACT_APP_API_URL}${car?.image}` : null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.quantity > 0) {
      setFormData((prev) => ({ ...prev, owned: true }));
    } else {
      setFormData((prev) => ({ ...prev, owned: false }));
    }
  }, [formData.quantity]);

  useEffect(() => {
    if (formData.owned && formData.quantity === 0) {
      setFormData((prev) => ({ ...prev, quantity: 1 }));
    } else if (!formData.owned && formData.quantity > 0) {
      setFormData((prev) => ({ ...prev, quantity: 0 }));
    }
  }, [formData.owned]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile)); // Set image preview
    setIsImageRemoved(false);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImagePreview(null);
    setIsImageRemoved(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (key !== 'image') {
        data.append(key, formData[key]);
      }
    }
    if (file) {
      data.append('image', file);
    }
    data.append('isImageRemoved', isImageRemoved);

    try {
      if (car) {
        await axios.put(`${REACT_APP_API_URL}/api/cars/${car._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${REACT_APP_API_URL}/api/cars`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="car-form">
      <label>
        Name:
        <input name="name" value={formData.name} onChange={handleChange} required />
      </label>
      <label>
        Year:
        <input name="year" value={formData.year} onChange={handleChange} required />
      </label>
      <label>
        Series:
        <input name="series" value={formData.series} onChange={handleChange} />
      </label>
      <label>
        Number:
        <input name="number" value={formData.number} onChange={handleChange} />
      </label>
      <label>
        Collection Number:
        <input name="collectionNumber" value={formData.collectionNumber} onChange={handleChange} />
      </label>
      <label>
        Color:
        <input name="color" value={formData.color} onChange={handleChange} />
      </label>
      <label>
        Quantity:
        <input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          required
        />
      </label>
      <label>
        Type:
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="Car">Car</option>
          <option value="Playset">Playset</option>
          <option value="Others">Others</option>
        </select>
      </label>
      {formData.type === 'Car' && (
        <label>
          Sub-Type:
          <select name="subType" value={formData.subType} onChange={handleChange} required>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Plane">Plane</option>
            <option value="Monster Trucks">Monster Trucks</option>
            <option value="Rigs">Rigs</option>
            <option value="Others">Others</option>
          </select>
        </label>
      )}
      <label>
        Brand:
        <select name="brand" value={formData.brand} onChange={handleChange} required>
          <option value="Hot Wheels">Hot Wheels</option>
          <option value="Matchbox">Matchbox</option>
          <option value="Majorite">Majorite</option>
          <option value="Detsky">Detsky</option>
        </select>
      </label>
      <label>
        Owned:
        <input
          name="owned"
          type="checkbox"
          checked={formData.owned}
          onChange={handleChange}
        />
      </label>
      <label>
        Missing:
        <input
          name="missing"
          type="checkbox"
          checked={formData.missing}
          onChange={handleChange}
        />
      </label>
      <label>
        Image:
        {imagePreview ? (
          <div className="image-preview">
            <img src={imagePreview} alt="Car" width="100" />
            <button type="button" onClick={handleRemoveImage} className="remove-image-button">
              Remove
            </button>
          </div>
        ) : (
          <input type="file" name="image" onChange={handleFileChange} />
        )}
      </label>
      <button type="submit">Save</button>
    </form>
  );
};

export default CarForm;