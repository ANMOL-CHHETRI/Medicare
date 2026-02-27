import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  findings: { type: String },
  dateIssued: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
