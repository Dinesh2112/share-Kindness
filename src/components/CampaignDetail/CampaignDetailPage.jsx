import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./CampaignDetailPage.css";

const CampaignDetailPage = () => {
  const [campaign, setCampaign] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userAccountType, setUserAccountType] = useState(null);
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonationFormVisible, setIsDonationFormVisible] = useState(false);

  const [totalDonations, setTotalDonations] = useState(0); // Track total donations

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const docRef = doc(firestore, "campaigns", campaignId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const campaignData = docSnap.data();
          setCampaign(campaignData);
          setTotalDonations(campaignData.totalDonations || 0); // Set initial total donations
        } else {
          console.log("No such campaign!");
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user data to determine account type
        const fetchUserAccountType = async () => {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAccountType(userData.accountType); // Set account type (normal or ngo)
          }
        };
        fetchUserAccountType();
      } else {
        setUserAccountType(null);
      }
    });

    fetchCampaignDetails();

    // Cleanup listener
    return () => unsubscribe();
  }, [campaignId, auth]);

  const handleDonate = () => {
    if (!user) {
      alert("Please log in to donate.");
      navigate("/login"); // Ensure navigation happens
      return;
    } else if (userAccountType === "ngo") {
      alert("Only normal users can donate.");
      return;
    } else {
      setIsDonationFormVisible(true);
    }
  };

  const handleDonationSubmit = async () => {
    if (!user) {
      alert("Please log in to donate.");
      navigate("/login");
      return;
    }

    if (!donorName || !donorPhone || !donationAmount) {
      alert("Please fill in all fields.");
      return;
    }

    if (userAccountType === "ngo") {
      alert("Only normal users can donate.");
      return;
    }

    try {
      // Store the donation details in Firestore
      const donationData = {
        userId: user.uid,
        campaignId: campaignId,
        campaignName: campaign.campaignName,
        donorName: donorName,
        donorPhone: donorPhone,
        donationAmount: parseFloat(donationAmount),
        timestamp: new Date().toISOString(),
      };

      const donationRef = doc(firestore, "donations", user.uid + "_" + new Date().getTime());
      await setDoc(donationRef, donationData);

      // Update total donations in the campaign
      const updatedTotalDonations = totalDonations + parseFloat(donationAmount);
      const campaignRef = doc(firestore, "campaigns", campaignId);
      await updateDoc(campaignRef, { totalDonations: updatedTotalDonations });

      // Update the local state for total donations
      setTotalDonations(updatedTotalDonations);

      // Proceed to Razorpay payment
      initiateRazorpay(donationData);
    } catch (error) {
      console.error("Error saving donation data:", error);
      alert("Error processing donation.");
    }
  };

  const initiateRazorpay = (donationData) => {
    const options = {
      key: "rzp_test_lR33O1W4NgBsoR", // Replace with your live key
      amount: donationData.donationAmount * 100, // amount in paise
      currency: "INR",
      name: campaign.campaignName,
      description: campaign.description,
      image: campaign.thumbnail,
      handler: async (response) => {
        try {
          if (response.razorpay_payment_id) {
            console.log("Payment successful:", response);
            alert("Thank you for your donation!");
            setIsDonationFormVisible(false);
          }
        } catch (error) {
          console.error("Error in payment handler:", error);
          alert("Payment processing failed.");
        }
      },
      prefill: {
        name: donorName,
        email: user.email,
        contact: donorPhone,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      alert("Payment failed: " + response.error.description);
      setIsDonationFormVisible(false); // Hide form in case of failure
    });

    rzp.open();
  };

  const handleNextPhoto = () => {
    if (campaign?.additionalPhotos?.length > 0) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % campaign.additionalPhotos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (campaign?.additionalPhotos?.length > 0) {
      setCurrentPhotoIndex(
        (prevIndex) =>
          (prevIndex - 1 + campaign.additionalPhotos.length) % campaign.additionalPhotos.length
      );
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setDonorPhone(value);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!campaign) {
    return <div className="error">Campaign not found.</div>;
  }

  return (
    <div className="campaign-detail-page">
      <div className="campaign-container">
        <h1 className="campaign-title">{campaign.campaignName}</h1>
        <div className="campaign-details">
          <p className="campaign-description">{campaign.description}</p>
          <div className="campaign-info">
            <p><strong>Theme:</strong> {campaign.theme}</p>
            <p><strong>Phone:</strong> {campaign.phoneNumber}</p>
            <p><strong>Start Date:</strong> {campaign.startDate}</p>
            <p><strong>End Date:</strong> {campaign.endDate}</p>
            <p><strong>Donation Goal:</strong> ₹{campaign.donationGoal.toLocaleString()}</p>
            <p><strong>Total Donations:</strong> ₹{totalDonations.toLocaleString()}</p>
            <p><strong>Remaining to Goal:</strong> ₹{(campaign.donationGoal - totalDonations).toLocaleString()}</p>
          </div>
        </div>
        <div className="campaign-photo-section">
          <img
            src={currentPhotoIndex === 0 ? campaign.thumbnail : campaign.additionalPhotos[currentPhotoIndex - 1]}
            alt="Campaign"
            className="campaign-photo"
          />
          <div className="photo-navigation">
            <button onClick={handlePrevPhoto} className="arrow-button">
              <FaArrowLeft />
            </button>
            <button onClick={handleNextPhoto} className="arrow-button">
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="donation-section">
          {isDonationFormVisible ? (
            <div className="donation-form">
              <h3>Donate Now</h3>
              <input
                type="text"
                placeholder="Your Name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Your Phone Number"
                value={donorPhone}
                onChange={handlePhoneChange}
              />
              <input
                type="number"
                placeholder="Donation Amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
              <button onClick={handleDonationSubmit}>Submit Donation</button>
            </div>
          ) : (
            <button onClick={handleDonate} className="donate-button">
              Donate Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
