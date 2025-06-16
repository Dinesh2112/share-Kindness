import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useParams, useLocation } from "react-router-dom";
import { firestore } from "../firebase";
import "./DonorList.css";

const DonorList = () => {
  const { campaignId } = useParams(); // Get campaign ID from route
  const location = useLocation();
  const [donors, setDonors] = useState([]); // Store donor details
  const [loading, setLoading] = useState(true); // Loading state
  const campaignName = location.state?.campaignName || "Campaign"; // Get campaign name

  // Fetch donors for the given campaign
  useEffect(() => {
    const q = query(
      collection(firestore, "donations"),
      where("campaignId", "==", campaignId) // Match campaign ID
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const donorData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonors(donorData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [campaignId]);

  return (
    <div className="donor-list-container">
      <h2>Donors for {campaignName}</h2>
      {loading ? (
        <p>Loading donors...</p>
      ) : donors.length > 0 ? (
        <table className="donor-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Donation Date</th>
              <th>Donation Amount</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id}>
                <td>{donor.donorName}</td>
                <td>{new Date(donor.timestamp).toLocaleDateString()}</td>
                <td>{donor.donationAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No donors found for this campaign.</p>
      )}
    </div>
  );
};

export default DonorList;
