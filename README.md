# Hot Wheels Collection

![Hot Wheels Logo](./frontend/src/assets/hotwheels-logo.svg)

A web application to track your Hot Wheels car collection. Built with **React** for the frontend, **Node.js** for the backend, and **MongoDB** for the database. The application allows you to add, edit, delete, and search for cars in your collection. It also supports uploading photos of your cars.

---

## Features

- **Add Cars:** Add new Hot Wheels cars to your collection with details like name, model, year, and color.
- **Edit Cars:** Update details of existing cars in your collection.
- **Delete Cars:** Remove cars from your collection.
- **Search Cars:** Search for cars by name, model, or year.
- **Photo Upload:** Upload photos of your Hot Wheels cars.
- **Responsive Design:** The app is fully responsive and works on all devices.

---

## Technologies Used

- **Frontend:** React, Axios
- **Backend:** Node.js, Express, MongoDB
- **Database:** MongoDB
- **Containerization:** Docker
- **Deployment:** Docker Hub

---

## Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for development only)

---

### For Development

1. **Clone the Repository:**

```bash
git clone https://github.com/your-username/hotwheels-collection.git
cd hotwheels-collection
```

2. **Set Up Environment Variables:**

    Create a .env file in the root directory with the following content:

```env
MONGO_URI=mongodb://mongo:27017/hotwheels
```