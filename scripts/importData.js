const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Cutoff = require(path.join(__dirname, "../models/Cutoff"));



async function importCSV() {
  try {
    // Connect to local MongoDB
    await mongoose.connect("mongodb://localhost:27017/mhtcet_database");
    console.log("✅ Connected to local MongoDB");

    // Check if data already exists
    const existingCount = await Cutoff.countDocuments();
    if (existingCount > 0) {
      console.log("⚠️ Data already exists. No new data inserted.");
      mongoose.connection.close();
      return;
    }

    const results = [];
    const csvFilePath = path.join(__dirname, "../DATA/mhtcet_college_data_with_years_categories.csv");

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => {
        // Clean data
        for (let key in data) {
          if (data[key] === "-" || data[key] === "") {
            data[key] = null;
          } else if (!isNaN(data[key])) {
            data[key] = Number(data[key]);
          }
        }
        results.push(data);
      })
      .on("end", async () => {
        await Cutoff.insertMany(results);
        console.log("✅ Data inserted successfully!");
        mongoose.connection.close();
      });

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

importCSV();
