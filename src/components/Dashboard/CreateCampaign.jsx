import { firestore } from "../firebase"; // Import Firestore instance
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { getAuth } from "firebase/auth"; // Import Firebase Authentication
import "../Dashboard/CreateCampaign.css"; // Import CSS
import { useState, useEffect } from "react"; // Import React hooks
import { collection, addDoc } from "firebase/firestore"; // Firestore functions
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CreateCampaign = () => {
  const [thumbnail, setThumbnail] = useState(null); // For campaign thumbnail
  const [additionalPhotos, setAdditionalPhotos] = useState([]); // For additional photos
  const [campaignName, setCampaignName] = useState(""); // For campaign name
  const [theme, setTheme] = useState(""); // For campaign theme
  const [donationGoal, setDonationGoal] = useState(""); // For donation goal
  const [phoneNumber, setPhoneNumber] = useState(""); // For phone number
  const [description, setDescription] = useState(""); // For campaign description
  const [startDate, setStartDate] = useState(""); // For start date
  const [endDate, setEndDate] = useState(""); // For end date
  const [socialLinks, setSocialLinks] = useState(""); // For social media links

  const navigate = useNavigate(); // Initialize useNavigate hook
  const auth = getAuth(); // Get Firebase Auth instance

  // Handle campaign thumbnail selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setThumbnail({ file, url: objectUrl });
    }
  };

  // Handle additional photos selection
  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setAdditionalPhotos((prev) => [...prev, ...newPhotos]);
  };

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (thumbnail?.url) URL.revokeObjectURL(thumbnail.url);
      additionalPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [thumbnail, additionalPhotos]);

  // Handle form submission
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validate the donation goal
  //   if (isNaN(donationGoal) || donationGoal <= 0) {
  //     alert("Please enter a valid positive number for the donation goal.");
  //     return;
  //   }

  //   // Ensure required fields are filled
  //   if (!campaignName || !theme || !phoneNumber || !description) {
  //     alert("Please fill in all required fields.");
  //     return;
  //   }

  //   const currentUserUID = auth.currentUser?.uid; // Get the UID of the logged-in user

  //   // Prepare the campaign data
  //   const campaignData = {
  //     campaignName,
  //     thumbnail,
  //     additionalPhotos,
  //     theme,
  //     donationGoal: parseFloat(donationGoal),
  //     phoneNumber,
  //     description,
  //     startDate,
  //     endDate,
  //     socialLinks,
  //     createdAt: new Date().toISOString(),
  //     uid: currentUserUID,
  //   };

  //   try {
  //     // Add the campaign data to Firestore
  //     const docRef = await addDoc(collection(firestore, "campaigns"), campaignData);
  //     console.log("Campaign created with ID:", docRef.id);
  //     alert("Campaign successfully created!");
  //     navigate("/dashboard");
  //   } catch (error) {
  //     console.error("Error adding campaign:", error);
  //     alert("An error occurred while creating the campaign. Please try again.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the donation goal
    if (isNaN(donationGoal) || donationGoal <= 0) {
      alert("Please enter a valid positive number for the donation goal.");
      return;
    }

    // Ensure required fields are filled
    if (!campaignName || !theme || !phoneNumber || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate phone number to ensure it has at least 10 digits
    const phoneNumberDigits = phoneNumber.replace(/\D/g, ""); // Remove non-numeric characters
    if (phoneNumberDigits.length < 10) {
      alert("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    // Validate start and end dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDate && startDate && endDateObj < startDateObj) {
      alert("End date cannot be earlier than the start date.");
      return;
    }

    const storage = getStorage(); // Initialize Firebase Storage
    const currentUserUID = auth.currentUser?.uid; // Get the UID of the logged-in user

    try {
      // Upload campaign thumbnail to Firebase Storage
      let thumbnailURL = null;
      if (thumbnail?.file) {
        const thumbnailRef = ref(
          storage,
          `campaigns/${currentUserUID}/thumbnail/${thumbnail.file.name}`
        );
        await uploadBytes(thumbnailRef, thumbnail.file);
        thumbnailURL = await getDownloadURL(thumbnailRef);
      }

      // Upload additional photos to Firebase Storage
      const additionalPhotoURLs = [];
      for (const photo of additionalPhotos) {
        const photoRef = ref(
          storage,
          `campaigns/${currentUserUID}/photos/${photo.file.name}`
        );
        await uploadBytes(photoRef, photo.file);
        const photoURL = await getDownloadURL(photoRef);
        additionalPhotoURLs.push(photoURL);
      }

      // Prepare the campaign data
      const campaignData = {
        campaignName,
        thumbnail: thumbnailURL,
        additionalPhotos: additionalPhotoURLs,
        theme,
        donationGoal: parseFloat(donationGoal),
        phoneNumber,
        description,
        startDate,
        endDate,
        socialLinks,
        createdAt: new Date().toISOString(),
        uid: currentUserUID,
      };

      // Add the campaign data to Firestore
      const docRef = await addDoc(
        collection(firestore, "campaigns"),
        campaignData
      );
      console.log("Campaign created with ID:", docRef.id);
      alert("Campaign successfully created!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding campaign:", error);
      alert("An error occurred while creating the campaign. Please try again.");
    }
  };

  return (
    <div className="create-campaign-form">
      <h2>Create New Campaign</h2>
      <form onSubmit={handleSubmit}>
        {/* Campaign Thumbnail */}
        <div className="form-group">
          <label htmlFor="thumbnail">Campaign Thumbnail</label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleThumbnailChange}
            required
          />
          {thumbnail && (
            <img
              src={thumbnail.url}
              alt="Thumbnail Preview"
              width="300" // Changed from 100 to 300
              style={{ display: "block", marginTop: "10px" }}
            />
          )}
        </div>

        {/* Additional Photos */}
        <div className="form-group">
          <label htmlFor="additionalPhotos">Additional Photos</label>
          <input
            type="file"
            id="additionalPhotos"
            accept="image/*"
            multiple
            onChange={handleAdditionalPhotosChange}
          />
          <div className="photos-preview">
            {additionalPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Additional Photo ${index + 1}`}
                width="300" // Changed from 100 to 300
                style={{ margin: "5px" }}
              />
            ))}
          </div>
        </div>

        {/* Campaign Name */}
        <div className="form-group">
          <label htmlFor="campaignName">Campaign Name</label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
          />
        </div>

        {/* Campaign Theme */}
        <div className="form-group">
          <label htmlFor="theme">Campaign Theme</label>
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          />
        </div>

        {/* Donation Goal */}
        <div className="form-group">
          <label htmlFor="donationGoal">Donation Goal Amount</label>
          <input
            type="number"
            id="donationGoal"
            value={donationGoal}
            onChange={(e) => setDonationGoal(e.target.value)}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text" // Use "text" instead of "number" for better control over validation
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only digits
              if (/^\d*$/.test(value)) {
                setPhoneNumber(value);
              }
            }}
            onBlur={() => {
              if (phoneNumber.length < 10) {
                alert("Phone number must be at least 10 digits long.");
              }
            }}
            required
          />
        </div>

        {/* Campaign Description */}
        <div className="form-group">
          <label htmlFor="description">Campaign Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Start Date */}
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Social Media Links */}
        <div className="form-group">
          <label htmlFor="socialLinks">Social Media Links</label>
          <input
            type="text"
            id="socialLinks"
            value={socialLinks}
            onChange={(e) => setSocialLinks(e.target.value)}
            placeholder="Facebook, Instagram, etc."
          />
        </div>

        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
};

export default CreateCampaign;
