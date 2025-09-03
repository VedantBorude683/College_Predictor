const mongoose = require("mongoose");

const cutoffSchema = new mongoose.Schema({
  COLLEGES: { type: String, required: true },
  Civil: { type: Number, default: null },
  CSE: { type: Number, default: null },
  "R&AI": { type: Number, default: null },
  EE: { type: Number, default: null },
  ENTC: { type: Number, default: null },
  Instrumentation: { type: Number, default: null },
  Mechanical: { type: Number, default: null },
  Manufacturing: { type: Number, default: null },
  Metallurgyy: { type: Number, default: null },
  IT: { type: Number, default: null },
  AIDS: { type: Number, default: null },
  ECE: { type: Number, default: null },
  Year: { type: Number, required: true },
  Category: { type: String, required: true }
}, { collection: "college_cutoffs" });

module.exports = mongoose.model("Cutoff", cutoffSchema);
