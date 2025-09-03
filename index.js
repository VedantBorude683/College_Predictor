const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Cutoff = require(path.join(__dirname, "/models/Cutoff"));

const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, "public")));
// ✅ Connect to local MongoDB
mongoose.connect("mongodb://localhost:27017/mhtcet_database")
  .then(() => console.log("✅ Local MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Route to get all cutoffs

app.get("/api/cutoffs", async (req, res) => {
  try {
    const results = await Cutoff.find();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route to search cutoffs with filters
app.get("/api/cutoffs/search", async (req, res) => {
  const { year, category } = req.query;

  try {
    const query = {};
    if (year) query.Year = Number(year);
    if (category) query.Category = category;

    const results = await Cutoff.find(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname, "public", "home.html"));
})

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
