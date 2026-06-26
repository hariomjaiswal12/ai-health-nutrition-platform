// ==================== USE AUTH HOOK ====================
// File: frontend/src/hooks/useAuth.js
// Purpose: Custom React hook for comprehensive authentication management
// Features: User data, role checking, doctor profile info, permission checks
// Updated: Includes Modification 3 features (Doctor Directory & Appointment Booking)

import { useState, useEffect } from 'react';

/**
 * Main useAuth hook - Retrieves all user authentication and profile data
 * Provides complete user information including doctor-specific fields
 * 
 * @returns {Object} Comprehensive user authentication object with methods:
 *   - user: Complete user object (null if not logged in)
 *   - role: User's role ('patient', 'doctor', 'admin')
 *   - email: User's email
 *   - username: User's display name
 *   - userId: User's MongoDB ID
 *   - isLoggedIn: Boolean (true if authenticated)
 *   - isPatient: Boolean (true if role === 'patient')
 *   - isDoctor: Boolean (true if role === 'doctor')
 *   - isAdmin: Boolean (true if role === 'admin')
 *   - isDoctorProfileComplete: Boolean (doctor has filled all required fields)
 *   - doctorInfo: Object containing doctor-specific fields
 *   - logout: Function to clear user data and localStorage
 */
export function useAuth() {
  // ==================== STATE MANAGEMENT ====================
  
  // Main user object from localStorage
  const [user, setUser] = useState(null);
  
  // User role for quick access
  const [role, setRole] = useState(null);
  
  // Email address for quick access
  const [email, setEmail] = useState(null);
  
  // Username for quick access
  const [username, setUsername] = useState(null);
  
  // User's unique MongoDB ID
  const [userId, setUserId] = useState(null);
  
  // Login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Doctor-specific information (if user is a doctor)
  const [doctorInfo, setDoctorInfo] = useState(null);
  
  // Track if hook has initialized
  const [isLoading, setIsLoading] = useState(true);
  
  // Error state for debugging
  const [error, setError] = useState(null);

  // ==================== INITIALIZATION ====================
  
  /**
   * Load user data from localStorage on component mount
   * Extracts and sets all relevant user information
   */
  useEffect(() => {
    try {
      // Retrieve user data from localStorage (set during login)
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        // Parse the stored user JSON
        const userObj = JSON.parse(storedUser);
        
        // Set main user object
        setUser(userObj);
        
        // Set individual properties for quick access
        setRole(userObj.role || null);
        setEmail(userObj.email || null);
        setUsername(userObj.username || null);
        setUserId(userObj.id || null);
        setIsLoggedIn(true);
        
        // If user is a doctor, extract doctor-specific info
        if (userObj.role === 'doctor') {
          setDoctorInfo({
            specialization: userObj.specialization || '',
            experience: userObj.experience || 0,
            qualifications: userObj.qualifications || '',
            languages: userObj.languages || [],
            consultationFee: userObj.consultationFee || 0,
            contactPhone: userObj.contactPhone || '',
            whatsappNumber: userObj.whatsappNumber || '',
            availability: userObj.availability || '',
            bio: userObj.bio || '',
            profileImage: userObj.profileImage || '',
            isActive: userObj.isActive !== false
          });
        } else {
          setDoctorInfo(null);
        }
        
        setError(null);
      } else {
        // No user found in localStorage
        setUser(null);
        setRole(null);
        setEmail(null);
        setUsername(null);
        setUserId(null);
        setIsLoggedIn(false);
        setDoctorInfo(null);
      }
    } catch (err) {
      // Handle parsing errors
      console.error('❌ Error loading user from localStorage:', err);
      setError(err.message);
      setUser(null);
      setRole(null);
      setEmail(null);
      setUsername(null);
      setUserId(null);
      setIsLoggedIn(false);
      setDoctorInfo(null);
    } finally {
      // Mark initialization as complete
      setIsLoading(false);
    }
  }, []);

  // ==================== ROLE CHECK FUNCTIONS ====================
  
  /**
   * Check if current user is a patient
   * @returns {boolean} true if role === 'patient'
   */
  const isPatient = () => role === 'patient';
  
  /**
   * Check if current user is a doctor
   * @returns {boolean} true if role === 'doctor'
   */
  const isDoctor = () => role === 'doctor';
  
  /**
   * Check if current user is an admin
   * @returns {boolean} true if role === 'admin'
   */
  const isAdmin = () => role === 'admin';
  
  /**
   * Check if user has a specific role
   * @param {string} requiredRole - Role to check against
   * @returns {boolean} true if user has the required role
   */
  const hasRole = (requiredRole) => role === requiredRole;
  
  /**
   * Check if user has any of multiple roles
   * @param {string[]} requiredRoles - Array of roles to check
   * @returns {boolean} true if user has any of the required roles
   */
  const hasAnyRole = (requiredRoles) => {
    return Array.isArray(requiredRoles) && requiredRoles.includes(role);
  };

  // ==================== DOCTOR PROFILE FUNCTIONS ====================
  
  /**
   * Check if doctor profile is complete (all required fields filled)
   * Required fields: specialization, experience, qualifications, contactPhone
   * @returns {boolean} true if all required fields are filled
   */
  const isDoctorProfileComplete = () => {
    if (!isDoctor() || !doctorInfo) {
      return false;
    }
    
    return !!(
      doctorInfo.specialization &&
      doctorInfo.experience > 0 &&
      doctorInfo.qualifications &&
      doctorInfo.contactPhone
    );
  };
  
  /**
   * Get doctor's current availability status
   * @returns {string} Availability text or 'Not Available'
   */
  const getDoctorAvailability = () => {
    if (!isDoctor() || !doctorInfo) {
      return 'Not Available';
    }
    return doctorInfo.availability || 'Not Specified';
  };
  
  /**
   * Get doctor's consultation fee
   * @returns {number} Consultation fee or 0
   */
  const getDoctorConsultationFee = () => {
    if (!isDoctor() || !doctorInfo) {
      return 0;
    }
    return doctorInfo.consultationFee || 0;
  };
  
  /**
   * Get doctor's specialization
   * @returns {string} Specialization or empty string
   */
  const getDoctorSpecialization = () => {
    if (!isDoctor() || !doctorInfo) {
      return '';
    }
    return doctorInfo.specialization || '';
  };
  
  /**
   * Get doctor's experience in years
   * @returns {number} Years of experience or 0
   */
  const getDoctorExperience = () => {
    if (!isDoctor() || !doctorInfo) {
      return 0;
    }
    return doctorInfo.experience || 0;
  };
  
  /**
   * Get doctor's contact phone number
   * @returns {string} Phone number or empty string
   */
  const getDoctorPhoneNumber = () => {
    if (!isDoctor() || !doctorInfo) {
      return '';
    }
    return doctorInfo.contactPhone || '';
  };
  
  /**
   * Get doctor's WhatsApp number
   * @returns {string} WhatsApp number or empty string
   */
  const getDoctorWhatsAppNumber = () => {
    if (!isDoctor() || !doctorInfo) {
      return '';
    }
    return doctorInfo.whatsappNumber || '';
  };
  
  /**
   * Get doctor's profile image URL
   * @returns {string} Image URL or empty string
   */
  const getDoctorProfileImage = () => {
    if (!isDoctor() || !doctorInfo) {
      return '';
    }
    return doctorInfo.profileImage || '';
  };
  
  /**
   * Check if doctor is active (not deactivated)
   * @returns {boolean} true if doctor is active
   */
  const isDoctorActive = () => {
    if (!isDoctor() || !doctorInfo) {
      return false;
    }
    return doctorInfo.isActive !== false;
  };

  // ==================== LOGOUT FUNCTION ====================
  
  /**
   * Clear user data from state and localStorage
   * Used when user logs out or session expires
   */
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Clear all state variables
      setUser(null);
      setRole(null);
      setEmail(null);
      setUsername(null);
      setUserId(null);
      setIsLoggedIn(false);
      setDoctorInfo(null);
      setError(null);
      
      console.log('✅ User logged out successfully');
    } catch (err) {
      console.error('❌ Error during logout:', err);
      setError(err.message);
    }
  };

  // ==================== UPDATE USER FUNCTION ====================
  
  /**
   * Update user data in state and localStorage
   * Used after profile updates or login
   * @param {Object} updatedUserData - New user data to store
   */
  const updateUser = (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      
      // Update state
      setUser(newUserData);
      setRole(newUserData.role || role);
      setEmail(newUserData.email || email);
      setUsername(newUserData.username || username);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      // Update doctor info if user is a doctor
      if (newUserData.role === 'doctor') {
        setDoctorInfo({
          specialization: newUserData.specialization || '',
          experience: newUserData.experience || 0,
          qualifications: newUserData.qualifications || '',
          languages: newUserData.languages || [],
          consultationFee: newUserData.consultationFee || 0,
          contactPhone: newUserData.contactPhone || '',
          whatsappNumber: newUserData.whatsappNumber || '',
          availability: newUserData.availability || '',
          bio: newUserData.bio || '',
          profileImage: newUserData.profileImage || '',
          isActive: newUserData.isActive !== false
        });
      }
      
      console.log('✅ User data updated successfully');
    } catch (err) {
      console.error('❌ Error updating user data:', err);
      setError(err.message);
    }
  };

  // ==================== RETURN OBJECT ====================
  
  /**
   * Return authentication object with all user data and helper methods
   * This is what components access when using this hook
   */
  return {
    // Main user data
    user,                           // Complete user object
    role,                           // User's role (patient/doctor/admin)
    email,                          // User's email
    username,                       // User's display name
    userId,                         // User's MongoDB ID
    isLoggedIn,                     // Login status boolean
    isLoading,                      // Loading status during initialization
    error,                          // Any error messages
    
    // Doctor-specific data (Modification 3)
    doctorInfo,                     // Complete doctor profile info
    
    // Role checking functions
    isPatient,                      // () => boolean
    isDoctor,                       // () => boolean
    isAdmin,                        // () => boolean
    hasRole,                        // (requiredRole) => boolean
    hasAnyRole,                     // (requiredRoles[]) => boolean
    
    // Doctor profile functions (Modification 3)
    isDoctorProfileComplete,        // () => boolean
    getDoctorAvailability,          // () => string
    getDoctorConsultationFee,       // () => number
    getDoctorSpecialization,        // () => string
    getDoctorExperience,            // () => number
    getDoctorPhoneNumber,           // () => string
    getDoctorWhatsAppNumber,        // () => string
    getDoctorProfileImage,          // () => string
    isDoctorActive,                 // () => boolean
    
    // User management functions
    logout,                         // () => void
    updateUser                      // (updatedData) => void
  };
}

// ==================== ADDITIONAL SPECIALIZED HOOKS ====================

/**
 * Simplified hook to check only if user is logged in
 * Use this when you only need login status
 * 
 * @returns {boolean} true if user is logged in
 */
export function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      setIsLoggedIn(!!storedUser);
    } catch (err) {
      console.error('Error checking login status:', err);
      setIsLoggedIn(false);
    }
  }, []);
  
  return isLoggedIn;
}

/**
 * Hook to get only user role
 * Useful for role-based rendering
 * 
 * @returns {string} User's role ('patient', 'doctor', 'admin', or empty string)
 */
export function useUserRole() {
  const [role, setRole] = useState('');
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setRole(userObj.role || '');
      }
    } catch (err) {
      console.error('Error getting user role:', err);
      setRole('');
    }
  }, []);
  
  return role;
}

/**
 * Hook to get only user ID
 * Useful for API calls that need user ID
 * 
 * @returns {string} User's unique ID or empty string if not logged in
 */
export function useUserId() {
  const [userId, setUserId] = useState('');
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserId(userObj.id || '');
      }
    } catch (err) {
      console.error('Error getting user ID:', err);
      setUserId('');
    }
  }, []);
  
  return userId;
}

/**
 * Hook to get only user email
 * Useful for email-related operations
 * 
 * @returns {string} User's email or empty string if not logged in
 */
export function useUserEmail() {
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setEmail(userObj.email || '');
      }
    } catch (err) {
      console.error('Error getting user email:', err);
      setEmail('');
    }
  }, []);
  
  return email;
}

/**
 * Hook to get only user username
 * Useful for displaying user's name
 * 
 * @returns {string} User's username or empty string if not logged in
 */
export function useUsername() {
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUsername(userObj.username || '');
      }
    } catch (err) {
      console.error('Error getting username:', err);
      setUsername('');
    }
  }, []);
  
  return username;
}

/**
 * Hook to get doctor information (Modification 3)
 * Only works if user is a doctor
 * 
 * @returns {Object|null} Doctor profile info or null if not a doctor
 */
export function useDoctorInfo() {
  const [doctorInfo, setDoctorInfo] = useState(null);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        if (userObj.role === 'doctor') {
          setDoctorInfo({
            specialization: userObj.specialization || '',
            experience: userObj.experience || 0,
            qualifications: userObj.qualifications || '',
            languages: userObj.languages || [],
            consultationFee: userObj.consultationFee || 0,
            contactPhone: userObj.contactPhone || '',
            whatsappNumber: userObj.whatsappNumber || '',
            availability: userObj.availability || '',
            bio: userObj.bio || '',
            profileImage: userObj.profileImage || '',
            isActive: userObj.isActive !== false
          });
        }
      }
    } catch (err) {
      console.error('Error getting doctor info:', err);
      setDoctorInfo(null);
    }
  }, []);
  
  return doctorInfo;
}

/**
 * Hook to check if user is a doctor (Modification 3)
 * 
 * @returns {boolean} true if user is a doctor
 */
export function useIsDoctor() {
  const [isDoctor, setIsDoctor] = useState(false);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setIsDoctor(userObj.role === 'doctor');
      }
    } catch (err) {
      console.error('Error checking if doctor:', err);
      setIsDoctor(false);
    }
  }, []);
  
  return isDoctor;
}

/**
 * Hook to check if user is a patient (Modification 3)
 * 
 * @returns {boolean} true if user is a patient
 */
export function useIsPatient() {
  const [isPatient, setIsPatient] = useState(false);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setIsPatient(userObj.role === 'patient');
      }
    } catch (err) {
      console.error('Error checking if patient:', err);
      setIsPatient(false);
    }
  }, []);
  
  return isPatient;
}

/**
 * Hook to check if user is an admin
 * 
 * @returns {boolean} true if user is an admin
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setIsAdmin(userObj.role === 'admin');
      }
    } catch (err) {
      console.error('Error checking if admin:', err);
      setIsAdmin(false);
    }
  }, []);
  
  return isAdmin;
}

export default useAuth;

