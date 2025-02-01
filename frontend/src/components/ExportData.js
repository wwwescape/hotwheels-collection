import React from "react";
import axios from "axios";
import { REACT_APP_API_URL } from "../constants";

const ExportPage = () => {
  const handleExport = async () => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/export`, {
        responseType: "blob",
      });

      // Create a download link for the zip file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "export.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data");
    }
  };

  return (
    <div>
      <h1>Export Data</h1>
      <button onClick={handleExport}>Export Data and Images</button>
    </div>
  );
};

export default ExportPage;