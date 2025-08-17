// models/Payslip.js
import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employeeDetails: {
    name: String,
    id: String,
    designation: String,
    department: String,
    bankAccountName: String,
    bankAccountNumber: String,
    totalDays: Number,
    presentDays: Number,
    absentDays: Number,
  },
  incomes: { type: Map, of: Number },       // dynamic key:value
  deductions: { type: Map, of: Number },    // dynamic key:value
  totalIncome: Number,
  totalDeductions: Number,
  netPay: Number,
  month: String,   // e.g. "August"
  year: Number,    // e.g. 2025
  pdfUrl: String,  // (optional) if you want to store uploaded PDF path
}, { timestamps: true });

export default mongoose.model("Payslip", payslipSchema);
