// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://inout.urbancode.tech', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Static uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    const mime = require('mime');
    res.setHeader('Content-Type', mime.getType(filePath));
  }
}));

// Ping Route
app.get('/ping', (req, res) => res.send('pong'));

// Route Mounts (✅ Modularized)
app.use('/attendance', require('./routes/attendanceRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/holidays', require('./routes/holidayRoutes'));

// Default Admin Setup
const User = require('./models/User');
const bcrypt = require('bcryptjs');
async function setupAdmin() {
  const existing = await User.findOne({ email: 'admin@urbancode.in' });
  if (!existing) {
    const hashed = await bcrypt.hash('12345678', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@urbancode.in',
      password: hashed,
      role: 'admin',
      phone: '9876543210',
      position: 'Admin',
      company: 'Urbancode'
    });
    console.log('Admin created: admin@urbancode.in / 12345678');
  }
}
setupAdmin();

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, position, company, schedule } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !position || !company) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if already exists in either collection
    const existingUser = await User.findOne({ email });
    const existingPending = await PendingUser.findOne({ email });


    if (existingUser || existingPending) {
      return res.status(400).json({ error: 'Email already in use or pending approval' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pending = new PendingUser({
      name,
      email,
      password: hashedPassword,
      phone,
      position,
      company,
      schedule
    });

    await pending.save();

    const mailOptions = {
  from: process.env.NOTIFY_EMAIL,
  to: [process.env.NOTIFY_EMAIL, 'admin@urbancode.in','krithika@urbancode.in','savitha.saviy@gmail.com'],// your email
  subject: '🚀 New User Registration Alert for INOUT!',
  html: `
    <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background: #f9f9ff;">
      <h2 style="color: #6366f1;">👤 New Registration Received for InOut</h2>
      <p><strong>👨‍💼 Name:</strong> ${pending.name}</p>
      <p><strong>📧 Email:</strong> ${pending.email}</p>
      <p><strong>📱 Phone:</strong> ${pending.phone || 'N/A'}</p>
      <p><strong>🎓 Role:</strong> ${pending.position} - ${pending.company}</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 14px;">🔐 <strong>Action Needed:</strong> Please login to the <a href="https://inout.urbancode.tech/" style="color: #4f46e5;">Admin Panel</a> to approve this user.</p>
      <p style="font-size: 13px; color: #999;">📅 ${new Date().toLocaleString()}</p>
    </div>
  `
};
await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: 'Registration submitted and pending admin approval'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        name: user.name 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ 
      token,
      userId: user._id,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    app.listen(process.env.PORT ||5000, () => console.log('Server running on port 5000'));
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
startServer();
