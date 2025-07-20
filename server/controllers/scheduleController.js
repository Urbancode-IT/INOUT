
const Schedule = require('../models/Schedule');

const scheduleController = {
  getAllSchedules: async (req, res) => {
    try {
      const schedules = await Schedule.find().populate('user', 'name email');
      res.json(schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  },

  updateUserSchedule: async (req, res) => {
    try {
      const updatedSchedule = await Schedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  },
};

module.exports = scheduleController;
