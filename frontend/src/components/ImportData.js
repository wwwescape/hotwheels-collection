import React, { useState } from "react";
import axios from "axios";
import { REACT_APP_API_URL } from "../constants";

const ImportPage = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file to import");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${REACT_APP_API_URL}/api/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          maxBodyLength: 50 * 1024 * 1024, // 50MB payload size limit
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data");
    }
  };

  return (
    <div>
      <h1>Import Data</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleImport}>Import Data and Images</button>
    </div>
  );
};

export default ImportPage;
