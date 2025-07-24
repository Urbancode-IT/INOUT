// -----------------------------
// 📁 controllers/leaveController.js
// -----------------------------
const LeaveRequest = require('../models/LeaveRequest');
const transporter = require('../config/emailConfig');
const User = require('../models/User');

const leaveController = {
  applyLeave: async (req, res) => {
    try {
      const { fromDate, toDate, reason, leaveType } = req.body;
      if (!fromDate || !toDate || !reason) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
      const leave = new LeaveRequest({
        user: user._id,
        fromDate,
        toDate,
        reason,
        leaveType
      });

      await leave.save();

      const mailOptions = {
        from: process.env.NOTIFY_EMAIL,
        to: [
          process.env.NOTIFY_EMAIL,
          'admin@urbancode.in',
          'krithika@urbancode.in',
          'wepenit2020@gmail.com',
          'jayaprathap.rajan27@gmail.com',
          'savitha.saviy@gmail.com'
        ],
        subject: 'New Leave Request Submitted 🌴– INOUT Portal',
        html: `
          <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background: #f0faff;">
            <h2 style="color: #1d4ed8;">📅 New Leave Request Submitted</h2>
            <p><strong>👤 Name:</strong> ${user.name}</p><br/>
            <p><strong>✉️ Email:</strong> ${user.email}</p><br/>
            <p><strong>🏢 Role:</strong> ${user.position} - ${user.company}</p><br/>
            <p><strong>🛫 Leave From:</strong> ${new Date(fromDate).toLocaleDateString()}</p><br/>
            <p><strong>🛬 Leave To:</strong> ${new Date(toDate).toLocaleDateString()}</p>
            <p><strong>📝 Type:</strong> ${leaveType || 'N/A'}</p><br/>
            <p><strong>📌 Reason:</strong> ${reason}</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 14px;">🔐 <strong>Action Required:</strong> Please log in to the <a href="https://inout.urbancode.tech/" style="color: #1d4ed8;">Admin Panel</a> to review and approve this leave.</p>
            <p style="font-size: 13px; color: #666;">🕒 Submitted on: ${new Date().toLocaleString()}</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.status(201).json({ message: 'Leave request submitted' });
    } catch (err) {
      console.error('Leave apply error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getAllLeaveRequests: async (req, res) => {
    try {
      const requests = await LeaveRequest.find().populate('user', 'name email');
      res.json(requests);
    } catch (err) {
      console.error('Fetch leave requests error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateLeaveStatus: async (req, res) => {
    try {
      const { status } = req.body;
      if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await LeaveRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      res.json({ message: `Leave ${status.toLowerCase()}`, request: updated });
    } catch (err) {
      console.error('Update leave error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getMyLeaves: async (req, res) => {
    try {
      const leaves = await LeaveRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(leaves);
    } catch (err) {
      console.error('Fetch my leaves error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = leaveController;
