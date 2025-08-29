// *******
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Import your Mongoose models
const Driver = require("./models/driverModel");
const Bus = require("./models/busModel");

// Import the routeRoutes router
const routeRoutes = require("./routes/routeRoutes");

// Load environment variables FIRST
dotenv.config();

// Use MONGO_URI after dotenv loads it
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create Express app instance
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Middleware
app.use(cors());
app.use(express.json());

// Tell Express to use the routeRoutes for all requests to /api/routes
app.use("/api/routes", routeRoutes);

// Socket.IO Connection Logic
io.on("connection", (socket) => {
  console.log("Driver connected");

  socket.on('locationUpdate', async ({ latitude, busId, longitude, driverId }) => {
  console.log(`Received location from driver ${driverId}:`, latitude, longitude);

  try {
    // Update driver's location
    await Driver.findByIdAndUpdate(driverId, {
      currentLocation: { latitude, longitude },
    });

    await Bus.findByIdAndUpdate(busId, {
      currentLocation: { latitude, longitude, updatedAt: new Date() },
    });

    // Find bus assigned to this driver
    const bus = await Bus.findOneAndUpdate(
      { driver: driverId },
      { currentLocation: { latitude, longitude } },
      { new: true }
    );

    // Emit with busId if bus exists
    io.emit('busLocationUpdate', {
      driverId,
      // busId: bus?._id || null,
      busId,
      latitude,
      longitude,
      // data,
    });
  } catch (error) {
    console.error('Error updating location:', error);
  }
});

  socket.on("disconnect", () => {
    console.log("Driver disconnected");
  });
});

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
