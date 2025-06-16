import React, { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase"; // Import the auth object from firebase.js
import { setDoc, doc } from "firebase/firestore"; // Firestore functions for saving user data
import { firestore } from "../firebase"; // Assuming you've initialized Firestore
import "./SignUp.css"; // Import CSS file for styling

const SignUp = () => {
    const [accountType, setAccountType] = useState("normal"); // "ngo" or "normal"
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        ngoName: "",
        theme: "",
        address: "",
        registrationNumber: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const { email, password } = formData;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Saving user info to Firestore
            await setDoc(doc(firestore , "users", user.uid), {
                accountType,
                name: formData.name,
                email,
                phone: formData.phone,
                ngoName: formData.ngoName,
                theme: formData.theme,
                address: formData.address,
                registrationNumber: formData.registrationNumber,
            });

            alert("Sign-up successful!");
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleGoogleSignUp = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            // Saving user info to Firestore
            await setDoc(doc(firestore , "users", user.uid), {
                accountType,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            });

            alert("Google sign-up successful!");
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
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
            <form onSubmit={handleSignUp} className="signup-form">
                {accountType === "ngo" && (
                    <>
                        <input
                            type="text"
                            name="ngoName"
                            placeholder="NGO Name"
                            value={formData.ngoName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="theme"
                            placeholder="Theme"
                            value={formData.theme}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="registrationNumber"
                            placeholder="Registration Number"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                        />
                    </>
                )}
                {accountType === "normal" && (
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                )}
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
                {accountType === "normal" && (
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone (optional)"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                )}
                <button type="submit">Sign Up</button>
            </form>
            <button className="google-signup-btn" onClick={handleGoogleSignUp}>
                Sign Up with Google
            </button>
        </div>
    );
};

export default SignUp;
