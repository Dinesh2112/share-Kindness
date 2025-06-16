// const express = require("express");
// const Razorpay = require("razorpay");
// const bodyParser = require("body-parser");
// const cors = require("cors");

// const app = express();
// const port = 5000;

// const razorpay = new Razorpay({
//   key_id: "rzp_test_lR33O1W4NgBsoR", // Replace with your Razorpay Key ID
//   key_secret: "9q4n4zRnXmW9TmgW4E9ZJXYa", // Replace with your Razorpay Key Secret
// });

// app.use(cors());
// app.use(bodyParser.json());

// // Endpoint to create a Razorpay order
// app.post("/create-order", async (req, res) => {
//   try {
//     const { amount } = req.body; // Amount should be in paise (1 INR = 100 paise)

//     const order = await razorpay.orders.create({
//       amount: amount * 100, // Convert to paise
//       currency: "INR",
//       payment_capture: 1,
//     });

//     res.json({
//       id: order.id,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating Razorpay order");
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
