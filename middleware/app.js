// Middleware for Zendesk App, fetches latest order of a client(id, date, status)
import express from "express"; // Import express module
import cors from "cors"; // Import cors module to handle Cross-Origin Resource Sharing
import orders from "./functions.js";// Import custom functions from functions.js
import dotenv from "dotenv";// Import dotenv module to load environment variables
dotenv.config(); // Load environment variables from .env file
const app = express(); // Create an express application
app.use(cors()); // Enable CORS
app.use(express.json({verify:(req, res, buf) => {req.rawBody = buf;}})); // Used to parse JSON request bodies

// GET endpoint to fetch latest order of a client, expects email as query parameter
app.get("/order", async (req, res) => {
    if(!orders.verifyRequest(req)){// Verify the request using custom function, if fails return 401
        return res.status(401).json({success: false, message: "Unauthorized request to this endpoint."});
    }
    const email = req.query.email; // Get email from query parameters
    if(!email){// If email not provided, return 400 error
        return res.status(400).json({success: false, message: "Email query parameter is required."});
    }
    const order = await orders.lastOrder(email); // Call function to get last order
    return res.json(order); // Return order details
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});