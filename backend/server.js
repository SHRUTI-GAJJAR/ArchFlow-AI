const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});