import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "../Navbar/navbar.css";
import logo from "./logo1.png";
import app from "../firebase";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInitials, setUserInitials] = useState("U");
  const [userRole, setUserRole] = useState(null);
  const [accountType, setAccountType] = useState("normal");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    if (isLoggedIn) {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUserData(userData);
              setUserInitials(
                userData.name
                  ? userData.name.split(" ").map((part) => part.charAt(0).toUpperCase()).join("")
                  : user.email.charAt(0).toUpperCase()
              );
              setUserRole(userData.role);
              setAccountType(userData.role === "ngo" ? "ngo" : "normal");
            }
          })
          .catch((error) => {
            console.error("Error getting user document: ", error);
          });
      }
    }
  }, [isLoggedIn, auth, db]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleCampaignClick = () => {
    navigate("/campaigns");
  };

  const handleDashboardClick = () => {
    if (userData) {
      if (userData.accountType === "ngo") {
        navigate("/dashboard", { state: { accountType: "ngo", userData: userData } });
      } else {
        navigate("/dashboard", { state: { accountType: "normal", userData: userData } });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      
      <div className="navbar-links">
        <button className="navbar-link" onClick={handleHomeClick}>
          Home
        </button>
        <button className="navbar-link">About Us</button>
        {/* Add Campaigns Button */}
        <button className="navbar-link" onClick={handleCampaignClick}>
          Campaigns
        </button>
      </div>
      <div className="navbar-buttons">
        {!isLoggedIn ? (
          <>
            <Link to="/login">
              <button className="login-button">Login</button>
            </Link>
            <Link to="/signup">
              <button className="signup-button">Sign Up</button>
            </Link>
          </>
        ) : (
          <div className="profile-container">
            <div className="profile-button" onClick={toggleDropdown}>
              {userInitials}
            </div>
            {showDropdown && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleDashboardClick}>
                  Dashboard
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
