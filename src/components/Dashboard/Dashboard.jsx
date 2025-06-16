import React, { useState, useEffect } from "react";
import { firestore } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import DashboardNavbar from "./DashboardNavbar";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]); // Store campaigns data
  const [donations, setDonations] = useState([]); // Store donations data for normal users
  const [loading, setLoading] = useState(true); // Loading state for campaigns and donations
  const [userEmail, setUserEmail] = useState(""); // Store user email
  const location = useLocation();
  const navigate = useNavigate();
  const { accountType } = location.state || { accountType: "normal" };
  const auth = getAuth();
  const currentUserUID = auth.currentUser?.uid;

  // Fetch user's email on component mount
  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email); // Set the email of the logged-in user
    }
  }, [auth]);

  // Fetch campaigns for NGO users
  useEffect(() => {
    if (accountType === "ngo" && currentUserUID) {
      const q = query(
        collection(firestore, "campaigns"),
        where("uid", "==", currentUserUID)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const campaignsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCampaigns(campaignsData); // Set campaigns data
        setLoading(false); // Stop loading once data is fetched
      });

      return () => unsubscribe();
    }
  }, [accountType, currentUserUID]);

  // Fetch donations for Normal users
  useEffect(() => {
    if (accountType === "normal" && currentUserUID) {
      const q = query(
        collection(firestore, "donations"),
        where("userId", "==", currentUserUID) // Match Firestore's field name
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const donationsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            campaignName: data.campaignName,
            donationAmount: data.donationAmount,
            timestamp: new Date(data.timestamp), // Parse the string into a Date object
          };
        });
        console.log("Fetched Donations:", donationsData); // Debug log
        setDonations(donationsData); // Update state
        setLoading(false); // Stop loading
      });
  
      return () => unsubscribe();
    }
  }, [accountType, currentUserUID]);

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login"); // Redirect to login page
    } else {
      console.log("User authenticated:", auth.currentUser.uid); // Debug log
    }
  }, [auth.currentUser, navigate]);

  // Function to deactivate a campaign
  const handleDeactiveCampaign = async (campaignId) => {
    const campaignRef = doc(firestore, "campaigns", campaignId);
    await updateDoc(campaignRef, { active: false });
  };

  // Function to delete a campaign
  const handleDeleteCampaign = async (campaignId) => {
    const campaignRef = doc(firestore, "campaigns", campaignId);
    await deleteDoc(campaignRef);
  };

  // Function to activate a campaign
  const handleActiveCampaign = async (campaignId) => {
    const campaignRef = doc(firestore, "campaigns", campaignId);
    await updateDoc(campaignRef, { active: true });
  };

  return (
    <div className="dashboard-container">
      {accountType === "ngo" && <DashboardNavbar />}

      <h2>Welcome {userEmail ? userEmail : "to your Dashboard"}</h2>

      {accountType === "ngo" ? (
        <div>
          <h3>Your Campaigns</h3>
          {loading ? (
            <p>Loading campaigns...</p>
          ) : (
            <div className="campaigns-container">
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="campaign-card">
                    <img
                      src={campaign.thumbnail}
                      alt="Thumbnail"
                      className="campaign-thumbnail"
                    />
                    <div className="campaign-details">
                      <h4>{campaign.campaignName}</h4>
                      <p>{campaign.theme}</p>
                      <div className="campaign-buttons">
                      <button
                        className="active-button"
                        onClick={() => handleActiveCampaign(campaign.id)}
                      >
                        {campaign.active ? "Active" : "Activate"}
                      </button>
                      <button
                        className="deactive-button"
                        onClick={() => handleDeactiveCampaign(campaign.id)}
                      >
                        Deactivate
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="view-donors-button"
                        onClick={() => navigate(`/campaign/donors/${campaign.id}`, { state: { campaignName: campaign.campaignName } })}
                      >
                        View Donors
                      </button>
                    </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No campaigns found. Please create a new campaign.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Your Donations</h3>
          {loading ? (
            <p>Loading donations...</p>
          ) : (
            <div className="donations-table">
  {donations.length > 0 ? (
    <table>
      <thead>
        <tr>
          <th>Campaign Name</th>
          <th>Donation Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {donations.map((donation) => (
          <tr key={donation.id}>
            <td>{donation.campaignName}</td>
            <td>{donation.donationAmount}</td>
            <td>{donation.timestamp.toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No donations found.</p>
  )}
</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
