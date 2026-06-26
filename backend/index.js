require('dotenv').config();

// ==================== DEPENDENCIES ====================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ==================== INITIALIZE EXPRESS APP ====================
const app = express(); // ✅ Create app FIRST
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables. Please configure it.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ==================== INITIALIZE BASIC ROUTES & SERVICES ====================
// 🟢 Import routes and services BEFORE models are used
const chatbotRouter = require('./chatbot');
const dietPlansRouter = require('./routes/dietPlans');
const knowledgeCenterRouter = require('./routes/knowledgeCenter');
const doshaAssessmentRouter = require('./routes/doshaAssessment');
const progressRoutes = require('./routes/progress');

const Food = require('./Food');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const PDFGenerator = require('./services/pdfGenerator');

// ==================== MONGOOSE SCHEMAS & MODELS ====================
// 🟢 DEFINE ALL SCHEMAS AND MODELS HERE - BEFORE IMPORTING DEPENDENT ROUTES

// Patient Schema
const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, required: true },
    diagnosis: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Patient = mongoose.model('Patient', patientSchema);

// User Schema - ENHANCED WITH DOCTOR FIELDS (Modification 3)
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'patient', enum: ['patient', 'doctor', 'admin'] },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },

    // Doctor-specific fields - Modification 3
    specialization: { type: String, default: '' },
    experience: { type: Number, default: 0 }, // years of experience
    qualifications: { type: String, default: '' },
    languages: { type: [String], default: [] },
    consultationFee: { type: Number, default: 0 },
    contactPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    availability: { type: String, default: '' }, // e.g., "Mon-Fri 9AM-5PM"
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// Appointment Schema - Modification 3
const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: { type: String, required: true },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorName: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: { type: String, default: '' },
    contactMethod: {
      type: String,
      enum: ['chat', 'whatsapp', 'call', 'in-person'],
      default: 'chat'
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

// ==================== NOW IMPORT ROUTES AFTER MODELS ARE DEFINED ====================
// 🟢 CRITICAL: Import routes AFTER models are registered
const doctorRoutes = require('./routes/doctors'); // Import AFTER User model
const appointmentRoutes = require('./routes/appointments'); // Import AFTER Appointment model

// ==================== REGISTER ALL ROUTES ====================
app.use('/chatbot', chatbotRouter);
app.use('/api/dietplans', dietPlansRouter);
app.use('/api/knowledge', knowledgeCenterRouter);
app.use('/api/dosha', doshaAssessmentRouter);
app.use('/api/progress', progressRoutes);
app.use('/api/doctors', doctorRoutes); // Doctor routes - Modification 3
app.use('/api/appointments', appointmentRoutes); // Appointment routes - Modification 3

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.json({
    message: 'Swasthya Sutra Backend is running!',
    version: '1.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: [
      'Patient Management',
      'Food Database',
      'Diet Plans',
      'Knowledge Center',
      'Dosha Assessment Quiz',
      'AI Chatbot',
      'Progress Tracking',
      'Doctor Directory - Modification 3',
      'Appointment Booking - Modification 3'
    ]
  });
});

// ==================== FOOD ROUTES ====================

// Get all foods (Public - no auth required for viewing)
app.get('/foods', async (req, res) => {
  try {
    const foods = await Food.find({}).sort({ name: 1 });
    res.json(foods);
  } catch (err) {
    console.error('Error fetching foods:', err);
    res.status(500).json({ message: 'Error fetching foods', error: err.message });
  }
});

// Add new food (Doctor/Admin only)
app.post('/add-food', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const { name, category, benefits, properties, taste, potency } = req.body;

    if (!name || !category || !benefits) {
      return res.status(400).json({ message: 'Name, category, and benefits are required' });
    }

    // Check for duplicate
    const existing = await Food.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: 'Food item already exists' });
    }

    const food = new Food({ name, category, benefits, properties, taste, potency });
    await food.save();
    res.status(201).json({ message: 'Food added successfully', food });
  } catch (err) {
    console.error('Error adding food:', err);
    res.status(500).json({ message: 'Error adding food', error: err.message });
  }
});

// Update food (Doctor/Admin only)
app.put('/foods/:id', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const { name, category, benefits, properties, taste, potency } = req.body;

    if (!name || !category || !benefits) {
      return res.status(400).json({ message: 'Name, category, and benefits are required' });
    }

    const updated = await Food.findByIdAndUpdate(
      req.params.id,
      { name, category, benefits, properties, taste, potency },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ message: 'Food updated successfully', food: updated });
  } catch (err) {
    console.error('Error updating food:', err);
    res.status(500).json({ message: 'Error updating food', error: err.message });
  }
});

// Delete food (Doctor/Admin only)
app.delete('/foods/:id', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);
    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json({ message: 'Food deleted successfully', food: deletedFood });
  } catch (err) {
    console.error('Error deleting food:', err);
    res.status(500).json({ message: 'Error deleting food', error: err.message });
  }
});

// ==================== PATIENT ROUTES ====================

// Add patient (Doctor/Admin only)
app.post('/add-patient', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const { name, age, gender, phone, diagnosis } = req.body;

    if (!name || !age || !gender || !phone || !diagnosis) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const patient = new Patient({ name, age, gender, phone, diagnosis });
    await patient.save();
    res.status(201).json({ message: 'Patient added successfully', patient });
  } catch (err) {
    console.error('Error adding patient:', err);
    res.status(500).json({ message: 'Error saving patient', error: err.message });
  }
});

// Get all patients (Authenticated users)
app.get('/patients', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ message: 'Error fetching patients', error: err.message });
  }
});

// Get single patient (Authenticated users)
app.get('/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ message: 'Error fetching patient', error: err.message });
  }
});

// Update patient (Doctor/Admin only)
app.put('/patients/:id', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const { name, age, gender, phone, diagnosis } = req.body;

    if (!name || !age || !gender || !phone || !diagnosis) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, age, gender, phone, diagnosis },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient updated successfully', patient: updated });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ message: 'Error updating patient', error: err.message });
  }
});

// Delete patient (Doctor/Admin only)
app.delete('/patients/:id', authenticateToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully', patient: deleted });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ message: 'Error deleting patient', error: err.message });
  }
});

// ==================== AUTH ROUTES ====================

// Register user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'patient'
    });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username,
        email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'swasthyaSecretKey',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        specialization: user.specialization || '',
        experience: user.experience || 0,
        qualifications: user.qualifications || '',
        consultationFee: user.consultationFee || 0,
        contactPhone: user.contactPhone || '',
        whatsappNumber: user.whatsappNumber || '',
        availability: user.availability || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      },
      token
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Get current user info (for frontend use)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Get all users (Admin only)
app.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// ==================== PDF GENERATION ROUTES ====================

// Generate Diet Plan PDF
app.get('/api/dietplans/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const DietPlanModel = mongoose.model('DietPlan');
    const dietPlan = await DietPlanModel.findById(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    const patient = await Patient.findById(dietPlan.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const doctor = await User.findById(dietPlan.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get food details from database
    const foodNames = dietPlan.foods || [];
    const foods = await Food.find({
      name: { $in: foodNames.map(name => new RegExp(`^${name}$`, 'i')) }
    });

    const pdfBuffer = await PDFGenerator.generateDietPlanPDF(dietPlan, patient, doctor, foods);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=diet-plan-${patient.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'Error generating PDF', error: err.message });
  }
});

// Generate Patient Report PDF
app.get('/api/patients/:id/report/pdf', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const DietPlanModel = mongoose.model('DietPlan');
    const dietPlans = await DietPlanModel.find({ patientId: req.params.id });

    const pdfBuffer = await PDFGenerator.generatePatientReportPDF(patient, dietPlans, []);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=patient-report-${patient.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'Error generating PDF', error: err.message });
  }
});

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

// Get all users with last login info (Admin only)
app.get('/admin/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();

    const usersWithInfo = users.map(user => ({
      ...user,
      lastLogin: user.lastLoginAt || 'Never',
      status: user.isActive === false ? 'Inactive' : 'Active'
    }));

    res.json(usersWithInfo);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Delete user (Admin only)
app.delete('/admin/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user: deletedUser.username });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Deactivate/Activate user (Admin only)
app.patch('/admin/users/:id/toggle-status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle active status
    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { username: user.username, isActive: user.isActive }
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ message: 'Error updating user status', error: err.message });
  }
});

// ==================== ERROR HANDLERS ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
  console.log(`✨ Features enabled:`);
  console.log(`   ✅ Patient Management`);
  console.log(`   ✅ Food Database`);
  console.log(`   ✅ Diet Plans`);
  console.log(`   ✅ Knowledge Center`);
  console.log(`   ✅ Dosha Assessment Quiz`);
  console.log(`   ✅ AI Chatbot`);
  console.log(`   ✅ Progress Tracking`);
  console.log(`   ✅ Doctor Directory - Modification 3`);
  console.log(`   ✅ Appointment Booking - Modification 3`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});