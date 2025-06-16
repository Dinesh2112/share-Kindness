import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, getFirestore } from "firebase/firestore"; // Updated import
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Authentication
import "./LandingPage.css";  // Import the styles

const LandingPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(null); // Track the user authentication state
  const navigate = useNavigate();
  const auth = getAuth();

  // Set up the authentication listener to check the user's login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the logged-in user if exists, else null
    });

    // Cleanup the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Fetch active campaigns data from Firestore
  useEffect(() => {
    const fetchCampaigns = async () => {
        try {
            const db = getFirestore();

            // Query to fetch only active campaigns
            const campaignsCollection = collection(db, "campaigns");
            const q = query(campaignsCollection, where("active", "==", true));
            const campaignSnapshot = await getDocs(q);
            const campaignList = campaignSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Only show the first 3 campaigns
            setCampaigns(campaignList.slice(0, 3));
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    fetchCampaigns();
  }, []); // Fetch campaigns on component mount

  const handleDonate = (campaignId) => {
    if (user) {
      if (user.displayName !== "NGO") {
        navigate(`/campigndetail/${campaignId}`);
      } else {
        alert("Donations are only available for normal users.");
      }
    } else {
      alert("You must be logged in to donate.");
      navigate("/login");
    }
  };

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-text">
            <h1>Empower Change, Start Helping Today!</h1>
            <p>
              Join hands with NGOs and donors worldwide. Your actions can
              create a ripple effect of positivity and change. Every small step
              counts.
            </p>
            
            <button className="cta-button">Start Helping</button>
          </div>
        </div>
      </div>

      <div className="cards-section">
        <h2>Our Featured Campaigns</h2>
        <div className="cards-carousel">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <div className="card" key={campaign.id}>
                <img
                  src={campaign.thumbnail}
                  alt={campaign.campaignName}
                  className="campaign-thumbnail"
                />
                <h3>{campaign.campaignName}</h3>
                <p>Goal: ${campaign.donationGoal}</p>
                <button
                  className="donate-button"
                  onClick={() => handleDonate(campaign.id)}
                >
                  Donate
                </button>
              </div>
            ))
          ) : (
            <p>No active campaigns available</p>
          )}
        </div>
      </div>

      <div className="about-section">
        <h2>About Us</h2>
        <p>
          ShareKindness is a platform that connects NGOs and individuals who are
          passionate about making a positive impact. Our mission is to provide a
          seamless way for donors and NGOs to collaborate, ensuring that help
          reaches the people who need it most.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
