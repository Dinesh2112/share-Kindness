import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // For user authentication
import { useNavigate } from "react-router-dom";
import app from "../firebase";
import "./CampaignPage.css";

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(null); // Track the user authentication state
  const [activeCampaigns, setActiveCampaigns] = useState([]); // Track active campaigns for display
  const navigate = useNavigate();
  const db = getFirestore(app);
  const auth = getAuth(); // Initialize Firebase Authentication

  // Set up the authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the logged-in user, or null if logged out
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Fetch campaigns from Firestore
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsCollection = collection(db, "campaigns");
        const campaignSnapshot = await getDocs(campaignsCollection);
        const campaignList = campaignSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(campaignList);
        setCampaigns(campaignList);
        // Filter campaigns to only show active ones
        setActiveCampaigns(campaignList.filter(campaign => campaign.active));
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, [db]);

  // Handle Donate button logic
  const handleDonate = (campaignId) => {
    if (user) {
      // If the user is logged in and not an NGO
      if (user.displayName !== "NGO") {
        navigate(`/campigndetail/${campaignId}`);
      } else {
        alert("Donations are only available for normal users.");
      }
    } else {
      // If the user is not logged in, show an alert and navigate to the login page
      alert("You must be logged in to donate.");
      navigate("/login"); // Ensure this path matches your login page
    }
  };

  // Handle Activate/Deactivate action from the Dashboard
  const updateCampaignVisibility = (isActive) => {
    // Filter campaigns based on active status
    const updatedCampaigns = campaigns.filter(campaign => campaign.active === isActive);
    setActiveCampaigns(updatedCampaigns);
  };

  return (
    <div className="campaign-page">
      <h2>Campaigns</h2>
      <div className="campaign-list">
        {activeCampaigns.map((campaign) => (
          <div className="campaign-card" key={campaign.id}>
            <img
              src={campaign.thumbnail} // Use thumbnail URL from Firebase
              alt={campaign.campaignName}
              className="campaign-thumbnail"
            />
            <div className="campaign-details">
              <h3>{campaign.campaignName}</h3>
              <p>{campaign.description}</p>
              <button
                className="donate-btn"
                onClick={() => handleDonate(campaign.id)}
              >
                Donate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignPage;
