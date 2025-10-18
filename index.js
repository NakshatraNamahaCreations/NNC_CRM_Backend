// // index.js
// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const serviceRoutes = require("./routes/serviceRoutes");
// const leadRoutes = require("./routes/leadRoutes");
// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// const app = express();
// app.use(express.json());

// // Routes
// app.use("/api/services", serviceRoutes);
// app.use("/api/leads", leadRoutes);

// app.get("/", (req, res) => {
//   res.send("Backend API is running...");
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

 // index.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const serviceRoutes = require("./routes/serviceRoutes");
const referenceRoutes = require("./routes/referenceRoutes");
const leadRoutes = require("./routes/leadRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Base route
app.get("/", (req, res) => {
  res.send("Backend API is running... ✅");
});

// API routes
app.use("/api/services", serviceRoutes);
app.use("/api/references", referenceRoutes);
app.use("/api/leads", leadRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
