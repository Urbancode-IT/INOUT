// controllers/payslipController.js
const Payslip = require("../models/Payslip");

// @desc Create new payslip
const createPayslip = async (req, res) => {
  try {
    const payslip = new Payslip(req.body);
    await payslip.save();
    res.status(201).json(payslip);
  } catch (error) {
    res.status(500).json({ message: "Error saving payslip", error });
  }
};

// @desc Get all payslips
const getPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find().sort({ createdAt: -1 });
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payslips", error });
  }
};

module.exports = {
  createPayslip,
  getPayslips,
};
