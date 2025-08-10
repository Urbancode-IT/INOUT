// -----------------------------
// 📁 controllers/leaveController.js
// -----------------------------
const LeaveRequest = require('../models/LeaveRequest');
const transporter = require('../config/emailConfig');
const User = require('../models/User');
const transporter = require('../config/emailConfig');

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
      ).populate('user', 'name email');

      if (!updated) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
        // Check if user has email
    if (!updated.user?.email) {
      return res.status(400).json({ error: 'No email found for this user' });
    }
   
      const mailOptions = {
              from: process.env.NOTIFY_EMAIL,
              to: updated.user.email,
              subject:  `Your Leave Request Has Been ${status}`,
              html: `
                <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 25px;
            background-color: #ffffff;
        }
        .header {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin: 10px 0;
        }
        .approved {
            background-color: #d4edda;
            color: #155724;
        }
        .rejected {
            background-color: #f8d7da;
            color: #721c24;
        }
        .pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .detail-row {
            margin-bottom: 8px;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
            display: inline-block;
            width: 100px;
        }
        .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">Leave Request Update</div>
        
        <p>Hi ${updated.user.name || 'Employee'},</p>
        
        <p>Your leave request has been reviewed:</p>
        
        <div class="status ${status.toLowerCase()}">
            ${status.toUpperCase()}
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Dates:</span>
                ${updated.fromDate.toDateString()} to ${updated.toDate.toDateString()}
            </div>
            <div class="detail-row">
                <span class="detail-label">Leave Type:</span>
                ${updated.leaveType}
            </div>
            <div class="detail-row">
                <span class="detail-label">Reason:</span>
                ${updated.reason}
            </div>
        </div>
        
        <p>If you have any questions about this decision, please contact HR.</p>
        
        <div class="footer">
            <p>Best regards,<br><strong>InOut Team</strong></p>
        </div>
    </div>
</body>
</html>
      `
            };
      
            await transporter.sendMail(mailOptions);

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
