// ==================== DOCTORS ROUTES ====================
// File: backend/routes/doctors.js
// Purpose: Handle all doctor-related endpoints for Modification 3
// Features: Get doctors, update doctor profile, fetch doctor details

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get User model from mongoose (defined in index.js)
const User = mongoose.model('User');



// ==================== SPECIFIC ROUTES FIRST ====================
// 🔴 CRITICAL: These must come BEFORE the :id routes
// Otherwise /api/doctors/profile will be treated as /api/doctors/:id with id="profile"



// ==================== UPDATE DOCTOR PROFILE ====================
// Route: PUT /api/doctors/profile
// Access: Doctor only (can only update own profile)
// Purpose: Update doctor's professional information
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`✏️ Updating doctor profile - User ID: ${userId}`);
    
    // Verify user exists and is a doctor
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    if (user.role !== 'doctor') {
      return res.status(403).json({ 
        message: 'Only doctors can update doctor profiles' 
      });
    }
    
    // Extract and validate update fields
    const {
      specialization,
      experience,
      qualifications,
      languages,
      consultationFee,
      contactPhone,
      whatsappNumber,
      availability,
      bio,
      profileImage
    } = req.body;
    
    // Validate experience if provided
    if (experience !== undefined && (typeof experience !== 'number' || experience < 0)) {
      return res.status(400).json({ 
        message: 'Experience must be a non-negative number' 
      });
    }
    
    // Validate consultation fee if provided
    if (consultationFee !== undefined && (typeof consultationFee !== 'number' || consultationFee < 0)) {
      return res.status(400).json({ 
        message: 'Consultation fee must be a non-negative number' 
      });
    }
    
    // Validate phone format if provided
    if (contactPhone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(contactPhone)) {
      return res.status(400).json({ 
        message: 'Invalid phone number format' 
      });
    }
    
    // Build updates object with only provided fields
    const updates = {};
    
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience !== undefined) updates.experience = experience;
    if (qualifications !== undefined) updates.qualifications = qualifications;
    if (languages !== undefined) {
      // Convert comma-separated string to array if needed
      updates.languages = Array.isArray(languages) ? languages : 
                         (typeof languages === 'string' ? languages.split(',').map(l => l.trim()) : []);
    }
    if (consultationFee !== undefined) updates.consultationFee = consultationFee;
    if (contactPhone !== undefined) updates.contactPhone = contactPhone;
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;
    if (availability !== undefined) updates.availability = availability;
    if (bio !== undefined) updates.bio = bio;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    
    updates.updatedAt = new Date();
    
    // Update and return updated doctor profile
    const updatedDoctor = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log(`✅ Doctor profile updated successfully`);
    
    res.status(200).json({
      message: 'Doctor profile updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('❌ Error updating doctor profile:', error);
    res.status(500).json({ 
      message: 'Error updating doctor profile', 
      error: error.message 
    });
  }
});



// ==================== SEARCH DOCTORS BY SPECIALIZATION ====================
// Route: GET /api/doctors/search/specialization
// Access: Authenticated users
// Purpose: Search doctors by specialization (e.g., Panchakarma, Nutrition)
// 🔴 Must come before /:id route
router.get('/search/specialization', authenticateToken, async (req, res) => {
  try {
    const specialization = req.query.specialization;
    
    if (!specialization) {
      return res.status(400).json({ 
        message: 'Please provide specialization query parameter' 
      });
    }
    
    console.log(`🔍 Searching doctors with specialization: ${specialization}`);
    
    const doctors = await User.find({
      role: 'doctor',
      isActive: true,
      specialization: new RegExp(specialization, 'i') // Case-insensitive search
    }).select('-password').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${doctors.length} doctors with specialization: ${specialization}`);
    
    res.status(200).json({
      message: `Found ${doctors.length} doctors with specialization "${specialization}"`,
      count: doctors.length,
      doctors: doctors
    });
  } catch (error) {
    console.error('❌ Error searching doctors:', error);
    res.status(500).json({ 
      message: 'Error searching doctors', 
      error: error.message 
    });
  }
});



// ==================== GET DOCTOR STATS (ADMIN ONLY) ====================
// Route: GET /api/doctors/admin/stats
// Access: Admin only
// Purpose: Get doctor statistics for admin dashboard
// 🔴 Must come before /:id route
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    console.log('📊 Fetching doctor statistics');
    
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const activeDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const inactiveDoctors = await User.countDocuments({ role: 'doctor', isActive: false });
    
    const specializations = await User.distinct('specialization', { role: 'doctor', isActive: true });
    
    console.log(`✅ Doctor stats fetched`);
    
    res.status(200).json({
      message: 'Doctor statistics fetched successfully',
      stats: {
        totalDoctors: totalDoctors,
        activeDoctors: activeDoctors,
        inactiveDoctors: inactiveDoctors,
        specializations: specializations
      }
    });
  } catch (error) {
    console.error('❌ Error fetching doctor stats:', error);
    res.status(500).json({ 
      message: 'Error fetching doctor statistics', 
      error: error.message 
    });
  }
});



// ==================== NOW THE GENERIC :ID ROUTES ====================
// 🟢 These come AFTER specific routes so they don't interfere



// ==================== GET ALL DOCTORS ====================
// Route: GET /api/doctors
// Access: Authenticated users (patients, doctors, admins)
// Purpose: Fetch all active doctors with their profiles
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`📋 Fetching all doctors - Requested by: ${req.user.username}`);
    
    // Find all active doctors and exclude password field
    const doctors = await User.find({ 
      role: 'doctor', 
      isActive: true 
    }).select('-password').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${doctors.length} active doctors`);
    
    res.status(200).json({
      message: 'Doctors fetched successfully',
      count: doctors.length,
      doctors: doctors
    });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({ 
      message: 'Error fetching doctors', 
      error: error.message 
    });
  }
});



// ==================== GET SINGLE DOCTOR BY ID ====================
// Route: GET /api/doctors/:id
// Access: Authenticated users
// Purpose: Fetch single doctor profile by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log(`👨‍⚕️ Fetching doctor profile - Doctor ID: ${doctorId}`);
    
    // Validate if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        message: 'Invalid doctor ID format' 
      });
    }
    
    // Find doctor by ID
    const doctor = await User.findOne({ 
      _id: doctorId, 
      role: 'doctor' 
    }).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ 
        message: 'Doctor not found' 
      });
    }
    
    if (doctor.isActive === false) {
      return res.status(403).json({ 
        message: 'This doctor is currently inactive' 
      });
    }
    
    console.log(`✅ Doctor profile fetched: ${doctor.username}`);
    
    res.status(200).json({
      message: 'Doctor profile fetched successfully',
      doctor: doctor
    });
  } catch (error) {
    console.error('❌ Error fetching doctor:', error);
    res.status(500).json({ 
      message: 'Error fetching doctor', 
      error: error.message 
    });
  }
});



// ==================== GET DOCTOR'S APPOINTMENT COUNT ====================
// Route: GET /api/doctors/:id/appointment-count
// Access: Authenticated users
// Purpose: Get number of appointments for a specific doctor
router.get('/:id/appointment-count', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log(`📅 Fetching appointment count for doctor: ${doctorId}`);
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        message: 'Invalid doctor ID format' 
      });
    }
    
    const Appointment = mongoose.model('Appointment');
    
    const totalAppointments = await Appointment.countDocuments({ doctorId: doctorId });
    const pendingAppointments = await Appointment.countDocuments({ doctorId: doctorId, status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ doctorId: doctorId, status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ doctorId: doctorId, status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ doctorId: doctorId, status: 'cancelled' });
    
    console.log(`✅ Appointment counts fetched for doctor`);
    
    res.status(200).json({
      message: 'Appointment counts fetched successfully',
      counts: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      }
    });
  } catch (error) {
    console.error('❌ Error fetching appointment count:', error);
    res.status(500).json({ 
      message: 'Error fetching appointment count', 
      error: error.message 
    });
  }
});



// ==================== ERROR HANDLING ====================
// 404 handler for this router
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Doctor route not found', 
    path: req.originalUrl 
  });
});

module.exports = router;
