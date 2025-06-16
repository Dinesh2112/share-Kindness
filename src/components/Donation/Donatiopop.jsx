import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Donationpop = ({ campaignName, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // State to manage loading during payment process
  const navigate = useNavigate();

  const handleDonate = async () => {
    if (!name || !phone || !amount) {
      alert("Please fill in all fields");
      return;
    }

    // Open Razorpay payment gateway
    const options = {
      key: "YOUR_RAZORPAY_KEY", // Replace with your Razorpay API key
      amount: amount * 100, // Amount in smallest currency unit (paise, for INR)
      currency: "INR", // Currency type
      name: campaignName, // Campaign name or your organization name
      description: "Donation for " + campaignName,
      image: "YOUR_LOGO_URL", // Optional: your logo URL
      handler: function (response) {
        // On successful payment, handle the response here (e.g., save transaction data)
        alert("Payment successful!");
        console.log(response);
        // You can make API call to store donation details in your DB here
      },
      prefill: {
        name: name,
        email: "", // Optional
        phone: phone,
      },
      notes: {
        donation_for: campaignName,
      },
      theme: {
        color: "#F37254", // Customize the color of the Razorpay popup
      },
    };

    // Trigger Razorpay payment gateway
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="donation-popup">
      <div className="popup-content">
        <h3>Donate to {campaignName}</h3>
        <form>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            onClick={handleDonate}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Donate Now"}
          </button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Donationpop;
