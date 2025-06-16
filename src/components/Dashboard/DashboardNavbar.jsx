import React from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css"; // You can create a separate CSS file for styling

const DashboardNavbar = () => {
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    navigate("/create-campaign"); // Navigate to the "Create Campaign" form page
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-left">
        <span className="dashboard-text">Dashboard</span>
      </div>
      <div className="navbar-right">
        <button className="create-campaign-button" onClick={handleCreateCampaign}>
          Create New Campaign
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
