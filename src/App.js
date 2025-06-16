import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LandingPage from "./components/Landingpage/LandingPage";
import Signup from "./components/SingnUp/SignUp";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import CreateCampaign from "./components/Dashboard/CreateCampaign"; // Import the Create Campaign page
import CampaignDetailPage from "./components/CampaignDetail/CampaignDetailPage";
import DonorList from "./components/Donor/DonorList";
import CampaignPage from "./components/CampaignPage/CampaignPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null); // Store user data here

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userData={userData} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />} />
        <Route path="/dashboard" element={<Dashboard userData={userData} />} />
        <Route path="/campigndetail/:campaignId" element={<CampaignDetailPage />} />
        <Route path="/create-campaign" element={<CreateCampaign />} /> {/* Add route for Create Campaign */}
        <Route path="/campaign/donors/:campaignId" element={<DonorList />} />
        <Route path="/campaigns" element={<CampaignPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
