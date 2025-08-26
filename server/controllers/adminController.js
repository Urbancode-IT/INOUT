// -----------------------------
// 📁 controllers/adminController.js
// -----------------------------
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Schedule = require('../models/Schedule');
const Attendance = require('../models/Attendance');

const adminController = {
  getAdminSummary: async (req, res) => {
    try {
      const totalEmployees = await User.countDocuments({ role: 'employee' });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayAttendance = await Attendance.find({
        timestamp: { $gte: todayStart, $lte: todayEnd },
        type: 'check-in'
      }).distinct('user');

      const presentToday = todayAttendance.length;
      const absentToday = totalEmployees - presentToday;

      res.json({ totalEmployees, presentToday, absentToday });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getRecentAttendance: async (req, res) => {
    try {
      const logs = await Attendance.find()
        .sort({ timestamp: -1 })
        .populate({
          path: 'user',
          match: { role: 'employee' },
          select: '_id name email role company position department bankDetails dateOfJoining'
        });

      const filteredLogs = logs.filter(log => log.user !== null);

      const formatted = filteredLogs.map(log => ({
      employeeName: log.user.name,
      userId: log.user._id,
      role: log.user.role,
      position: log.user.position,
      department: log.user.department,
      company: log.user.company,
      dateOfJoining: log.user.dateOfJoining,
      bankDetails: {
        bankingName: log.user.bankDetails?.bankingName || '',
        accountNumber: log.user.bankDetails?.bankAccountNumber || ''
      },
      type: log.type,
      timestamp: log.timestamp,
      officeName: log.officeName || 'Outside Office',
      image: log.image || ''
    }));

      res.json(formatted);
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getPendingUsers: async (req, res) => {
    try {
      const pendingUsers = await PendingUser.find();
      res.json(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ error: 'Failed to fetch pending users' });
    }
  },

  approveUser: async (req, res) => {
    try {
      const pending = await PendingUser.findById(req.params.id);
      if (!pending) return res.status(404).json({ error: 'Pending user not found' });

      const user = new User({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        phone: pending.phone,
        position: pending.position,
        company: pending.company,
        role: 'employee'
      });
      await user.save();

      if (pending.schedule) {
        const userSchedule = new Schedule({
          user: user._id,
          weeklySchedule: pending.schedule
        });
        await userSchedule.save();
      }

      await PendingUser.findByIdAndDelete(pending._id);

      res.json({ message: 'User approved and created successfully.' });
    } catch (error) {
      console.error('Approval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  rejectUser: async (req, res) => {
    try {
      const deletedUser = await PendingUser.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ error: 'User not found' });

      res.status(200).json({ message: 'Pending user rejected and removed' });
    } catch (err) {
      console.error('Error rejecting user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = adminController;