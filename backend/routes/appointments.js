// ==================== APPOINTMENTS ROUTES ====================
// File: backend/routes/appointments.js
// Purpose: Handle all appointment-related endpoints for Modification 3
// Features: Create, read, update, delete appointments with role-based access

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get models from mongoose (defined in index.js)
const Appointment = mongoose.model('Appointment');
const User = mongoose.model('User');



// ==================== SPECIFIC ROUTES FIRST ====================
// 🔴 CRITICAL: These must come BEFORE the /:id routes
// Otherwise /api/appointments/admin/statistics will be treated as /:id with id="admin/statistics"



// ==================== GET APPOINTMENT STATISTICS ====================
// Route: GET /api/appointments/admin/statistics
// Access: Admin only
// Purpose: Get appointment statistics for dashboard
// 🔴 Must come BEFORE /:id route
router.get('/admin/statistics', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    console.log('📊 Fetching appointment statistics');
    
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    
    // Get additional statistics
    const appointmentsByContactMethod = await Appointment.aggregate([
      { $group: { _id: '$contactMethod', count: { $sum: 1 } } }
    ]);
    
    console.log(`✅ Appointment statistics fetched`);
    
    res.status(200).json({
      message: 'Appointment statistics fetched successfully',
      statistics: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        byContactMethod: appointmentsByContactMethod
      }
    });
  } catch (error) {
    console.error('❌ Error fetching appointment statistics:', error);
    res.status(500).json({ 
      message: 'Error fetching appointment statistics', 
      error: error.message 
    });
  }
});



// ==================== NOW THE GENERIC ROUTES ====================
// 🟢 These come AFTER specific routes so they don't interfere



// ==================== GET ALL APPOINTMENTS ====================
// Route: GET /api/appointments
// Access: Authenticated users (role-based filtering)
// Purpose: Fetch appointments based on user role
// - Admin: sees all appointments
// - Doctor: sees only their appointments
// - Patient: sees only their appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`📋 Fetching appointments - User: ${req.user.username} (Role: ${req.user.role})`);
    
    let appointments;
    let query = {};
    
    // Build query based on user role
    if (req.user.role === 'admin') {
      console.log('👨‍💼 Admin view: Fetching all appointments');
      query = {}; // Admin sees all
    } else if (req.user.role === 'doctor') {
      console.log('👨‍⚕️ Doctor view: Fetching own appointments');
      query = { doctorId: req.user.id };
    } else if (req.user.role === 'patient') {
      console.log('👤 Patient view: Fetching own appointments');
      query = { patientId: req.user.id };
    } else {
      return res.status(403).json({ 
        message: 'Invalid user role' 
      });
    }
    
    // Fetch appointments with populated references
    appointments = await Appointment.find(query)
      .populate('patientId', 'username email phone')
      .populate('doctorId', 'username email specialization consultationFee')
      .sort({ appointmentDate: -1 })
      .lean();
    
    console.log(`✅ Fetched ${appointments.length} appointments`);
    
    res.status(200).json({
      message: 'Appointments fetched successfully',
      count: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
});



// ==================== CREATE NEW APPOINTMENT ====================
// Route: POST /api/appointments
// Access: Authenticated patients
// Purpose: Patient books an appointment with a doctor
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, contactMethod } = req.body;
    
    console.log(`📝 Creating new appointment - Patient: ${req.user.username}, Doctor ID: ${doctorId}`);
    
    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        message: 'Missing required fields: doctorId, appointmentDate, appointmentTime' 
      });
    }
    
    // Validate appointment date is in future
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ 
        message: 'Appointment date and time must be in the future' 
      });
    }
    
    // Validate doctor exists and is active
    const doctor = await User.findOne({ 
      _id: doctorId, 
      role: 'doctor',
      isActive: true 
    });
    
    if (!doctor) {
      return res.status(404).json({ 
        message: 'Doctor not found or is inactive' 
      });
    }
    
    // Check for existing pending/confirmed appointments at same time with same doctor
    const existingAppointment = await Appointment.findOne({
      doctorId: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'Doctor is not available at this time. Please choose another slot.' 
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      patientName: req.user.username,
      doctorId: doctorId,
      doctorName: doctor.username,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime,
      reason: reason || '',
      contactMethod: contactMethod || 'chat',
      status: 'pending',
      notes: ''
    });
    
    await appointment.save();
    
    console.log(`✅ Appointment created successfully - ID: ${appointment._id}`);
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    res.status(500).json({ 
      message: 'Error creating appointment', 
      error: error.message 
    });
  }
});



// ==================== GET SINGLE APPOINTMENT BY ID ====================
// Route: GET /api/appointments/:id
// Access: Authenticated users (with authorization check)
// Purpose: Fetch single appointment details by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log(`📅 Fetching appointment - ID: ${appointmentId}, User: ${req.user.username}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ 
        message: 'Invalid appointment ID format' 
      });
    }
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'username email phone age gender')
      .populate('doctorId', 'username email specialization consultationFee bio');
    
    if (!appointment) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }
    
    // Check authorization
    const isAuthorized = 
      req.user.role === 'admin' ||
      appointment.patientId._id.toString() === req.user.id ||
      appointment.doctorId._id.toString() === req.user.id;
    
    if (!isAuthorized) {
      console.warn(`⚠️ Unauthorized access attempt to appointment ${appointmentId}`);
      return res.status(403).json({ 
        message: 'You are not authorized to view this appointment' 
      });
    }
    
    console.log(`✅ Appointment fetched successfully`);
    
    res.status(200).json({
      message: 'Appointment fetched successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    res.status(500).json({ 
      message: 'Error fetching appointment', 
      error: error.message 
    });
  }
});



// ==================== UPDATE APPOINTMENT ====================
// Route: PUT /api/appointments/:id
// Access: Doctor/Admin (can update), Patient (can cancel)
// Purpose: Update appointment status, notes, date/time
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log(`✏️ Updating appointment - ID: ${appointmentId}, User: ${req.user.username}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ 
        message: 'Invalid appointment ID format' 
      });
    }
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }
    
    // Check authorization
    const isAuthorized = 
      req.user.role === 'admin' ||
      appointment.doctorId.toString() === req.user.id ||
      appointment.patientId.toString() === req.user.id;
    
    if (!isAuthorized) {
      console.warn(`⚠️ Unauthorized update attempt on appointment ${appointmentId}`);
      return res.status(403).json({ 
        message: 'You are not authorized to update this appointment' 
      });
    }
    
    // Build updates object
    const updates = {};
    
    // Only certain roles can update status
    if (req.body.status) {
      if (req.user.role === 'patient') {
        // Patients can only cancel appointments
        if (req.body.status !== 'cancelled') {
          return res.status(403).json({ 
            message: 'Patients can only cancel appointments' 
          });
        }
      }
      // Doctors and admins can change status
      if (['pending', 'confirmed', 'completed', 'cancelled'].includes(req.body.status)) {
        updates.status = req.body.status;
      }
    }
    
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    
    // Only doctors and admins can update date/time
    if (req.user.role !== 'patient') {
      if (req.body.appointmentDate !== undefined) {
        const newDateTime = new Date(`${req.body.appointmentDate}T${req.body.appointmentTime || appointment.appointmentTime}`);
        if (newDateTime < new Date()) {
          return res.status(400).json({ 
            message: 'Appointment date and time must be in the future' 
          });
        }
        updates.appointmentDate = req.body.appointmentDate;
      }
      if (req.body.appointmentTime !== undefined) updates.appointmentTime = req.body.appointmentTime;
    }
    
    updates.updatedAt = new Date();
    
    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('patientId', 'username email phone')
     .populate('doctorId', 'username email specialization');
    
    console.log(`✅ Appointment updated - New status: ${updatedAppointment.status}`);
    
    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    res.status(500).json({ 
      message: 'Error updating appointment', 
      error: error.message 
    });
  }
});



// ==================== DELETE APPOINTMENT ====================
// Route: DELETE /api/appointments/:id
// Access: Admin, Doctor, Patient (own appointments only)
// Purpose: Delete an appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log(`🗑️ Deleting appointment - ID: ${appointmentId}, User: ${req.user.username}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ 
        message: 'Invalid appointment ID format' 
      });
    }
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }
    
    // Check authorization
    const isAuthorized = 
      req.user.role === 'admin' ||
      appointment.patientId.toString() === req.user.id ||
      appointment.doctorId.toString() === req.user.id;
    
    if (!isAuthorized) {
      console.warn(`⚠️ Unauthorized delete attempt on appointment ${appointmentId}`);
      return res.status(403).json({ 
        message: 'You are not authorized to delete this appointment' 
      });
    }
    
    // Prevent deletion of completed appointments (unless admin)
    if (appointment.status === 'completed' && req.user.role !== 'admin') {
      return res.status(400).json({ 
        message: 'Cannot delete completed appointments' 
      });
    }
    
    await Appointment.findByIdAndDelete(appointmentId);
    
    console.log(`✅ Appointment deleted successfully`);
    
    res.status(200).json({ 
      message: 'Appointment deleted successfully',
      appointmentId: appointmentId 
    });
  } catch (error) {
    console.error('❌ Error deleting appointment:', error);
    res.status(500).json({ 
      message: 'Error deleting appointment', 
      error: error.message 
    });
  }
});



// ==================== ERROR HANDLING ====================
// 404 handler for this router
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Appointment route not found', 
    path: req.originalUrl 
  });
});

module.exports = router;
