// -----------------------------
// 📁 controllers/holidayController.js
// -----------------------------
const Holiday = require('../models/Holiday');

const holidayController = {
  getAllHolidays: async (req, res) => {
    try {
      const holidays = await Holiday.find().sort({ date: 1 });
      res.json(holidays);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch holidays' });
    }
  },

  createHoliday: async (req, res) => {
    try {
      const { date, name } = req.body;

      if (!date || !name) {
        return res.status(400).json({ error: 'Date and name are required' });
      }

      const existing = await Holiday.findOne({ date: new Date(date) });
      if (existing) {
        return res.status(409).json({ error: 'Holiday already exists for this date' });
      }

      const holiday = new Holiday({ date, name });
      await holiday.save();
      res.status(201).json(holiday);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add holiday' });
    }
  }
};

module.exports = holidayController;
