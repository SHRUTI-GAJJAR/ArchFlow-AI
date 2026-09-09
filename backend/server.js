const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5500;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ArchFlow AI backend is running",
  });
});

// User routes:
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/ai", aiRoutes);

connectDB();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});