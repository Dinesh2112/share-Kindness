import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, firestore } from "../firebase"; // Import Firestore
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Dashboard from "../Dashboard/Dashboard"; // Import Dashboard Component

const Login = ({ setIsLoggedIn }) => {
  const [accountType, setAccountType] = useState("normal"); // Toggle state for account type
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { email, password } = formData;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Fetch user data from Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsLoggedIn(true);
  
        if (userData.hasVisited === false) {
          // If it's the first time login, redirect to the landing page
          navigate("/", { state: { accountType: userData.accountType } });
        } else {
          // Navigate to dashboard for subsequent logins
          navigate("/dashboard", {
            state: { accountType: userData.accountType, userData: userData },
          });
        }
      } else {
        console.log("User data not found in Firestore.");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };
  

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsLoggedIn(true);

        // Verify account type matches selected toggle
        if (userData.accountType === accountType) {
          navigate("/dashboard", { state: { accountType: userData.accountType } });
        } else {
          alert("Account type mismatch! Please select the correct account type.");
        }
      } else {
        console.log("User data not found in Firestore.");
      }
    } catch (error) {
      console.error("Google login failed:", error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* Toggle for account type */}
      <div className="account-type-selector">
        <label>
          <input
            type="radio"
            value="ngo"
            checked={accountType === "ngo"}
            onChange={() => setAccountType("ngo")}
          />
          NGO Account
        </label>
        <label>
          <input
            type="radio"
            value="normal"
            checked={accountType === "normal"}
            onChange={() => setAccountType("normal")}
          />
          Normal User Account
        </label>
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Google Login Button */}
      <div className="google-login-container">
        <button className="google-login-btn" onClick={handleGoogleLogin}>
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
