import React, { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_API_URL } from "../constants";
import { ReactComponent as SortIcon } from "../assets/sort-icon.svg";
import { useNavigate } from "react-router-dom";
import "./CarList.css";

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage, setCarsPerPage] = useState(10);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: "All",
    subType: "All",
    brand: "All",
    owned: "All",
    missing: "All",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, [currentPage, carsPerPage, sortField, sortOrder, filters]);

  useEffect(() => {
    if (!searchTerm) {
      fetchCars();
    }
  }, [searchTerm]);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/cars`, {
        params: {
          page: currentPage,
          limit: carsPerPage,
          sort: sortField,
          order: sortOrder,
          query: searchTerm,
          ...filters,
        },
      });
      setCars(response.data.cars);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to the first page when searching
    fetchCars();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1); // Reset to the first page when clearing search
    fetchCars();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to the first page when changing filters
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${REACT_APP_API_URL}/api/cars/${id}`);
      fetchCars(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleCarsPerPageChange = (e) => {
    setCarsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  return (
    <div className="car-list-container">
      <div className="add-button-container">
        <button className="add-button" onClick={() => navigate("/add")}>
          Add
        </button>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, year, series, color, number, type, or sub type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        {searchTerm && (
          <button onClick={handleClearSearch} className="clear-button">
            ×
          </button>
        )}
      </div>
      <div className="filters">
        <label>
          Type:
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Car">Car</option>
            <option value="Playset">Playset</option>
            <option value="Others">Others</option>
          </select>
        </label>
        <label>
          Sub-Type:
          <select
            name="subType"
            value={filters.subType}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Plane">Plane</option>
            <option value="Monster Trucks">Monster Trucks</option>
            <option value="Rigs">Rigs</option>
            <option value="Others">Others</option>
          </select>
        </label>
        <label>
          Brand:
          <select
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Hot Wheels">Hot Wheels</option>
            <option value="Matchbox">Matchbox</option>
            <option value="Majorite">Majorite</option>
            <option value="Detsky">Detsky</option>
          </select>
        </label>
        <label>
          Owned:
          <select
            name="owned"
            value={filters.owned}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <label>
          Missing:
          <select
            name="missing"
            value={filters.missing}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
      </div>
      <div className="pagination-controls">
        <label>
          Show:
          <select value={carsPerPage} onChange={handleCarsPerPageChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="car-table">
            <thead>
              <tr>
                <th>Image</th>
                <th onClick={() => handleSort("name")}>
                  Name{" "}
                  {sortField === "name" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th>Collection Number</th>
                <th onClick={() => handleSort("year")}>
                  Year{" "}
                  {sortField === "year" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("color")}>
                  Color{" "}
                  {sortField === "color" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("series")}>
                  Series{" "}
                  {sortField === "series" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("number")}>
                  Number{" "}
                  {sortField === "number" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("quantity")}>
                  Quantity{" "}
                  {sortField === "quantity" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("type")}>
                  Type{" "}
                  {sortField === "type" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("subType")}>
                  Sub-Type{" "}
                  {sortField === "subType" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("brand")}>
                  Brand{" "}
                  {sortField === "brand" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("owned")}>
                  Owned{" "}
                  {sortField === "owned" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th onClick={() => handleSort("missing")}>
                  Missing{" "}
                  {sortField === "missing" && (
                    <SortIcon className={`sort-icon ${sortOrder}`} />
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id}>
                  <td>
                    {car.image ? (
                      <img
                        src={`${REACT_APP_API_URL}${car.image}`}
                        alt={car.name}
                        className="car-image"
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{car.name}</td>
                  <td>{car.collectionNumber}</td>
                  <td>{car.year}</td>
                  <td>{car.color}</td>
                  <td>{car.series}</td>
                  <td>{car.number}</td>
                  <td>{car.quantity}</td>
                  <td>{car.type}</td>
                  <td>{car.type === "Car" ? car.subType : ""}</td>
                  <td>{car.brand}</td>
                  <td>{car.owned ? "Yes" : "No"}</td>
                  <td>{car.missing ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/edit/${car._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(car._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-bar">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarList;
