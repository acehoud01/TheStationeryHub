import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * Authentication Context
 * 
 * Manages authentication state across the application.
 * 
 * Provides:
 * - user: Current user object (null if not logged in)
 * - token: JWT token (null if not logged in)
 * - login(email, password): Login function
 * - register(userData): Registration function
 * - logout(): Logout function
 * - isAuthenticated: Boolean indicating if user is logged in
 * 
 * Storage:
 * - Stores token and user in localStorage for persistence
 * - Automatically loads on app startup
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on app startup
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /**
   * Login function
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Resolves with user data, rejects with error
   */
  const login = async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: email.trim(),
        password: password.trim()
      });

      const { token: newToken, user: newUser } = response.data;

      // Store in state
      setToken(newToken);
      setUser(newUser);

      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  /**
   * Register function
   * 
   * @param {object} userData - User registration data
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.confirmPassword - Password confirmation
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.phoneNumber - User's phone number (optional)
   * @param {string} userData.userType - User type (PARENT, SCHOOL_ADMIN, DONOR)
   * @returns {Promise} - Resolves with user data, rejects with error
   */
  const register = async (userData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: userData.email.trim(),
        password: userData.password.trim(),
        confirmPassword: userData.confirmPassword.trim(),
        fullName: userData.fullName.trim(),
        phoneNumber: userData.phoneNumber?.trim() || '',
        userType: userData.userType
      });

      // Registration successful - now needs OTP verification
      return response.data; // Returns email and requiresVerification flag
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  /**
   * Verify OTP function
   * 
   * @param {string} email - User's email
   * @param {string} otpCode - 6-digit OTP code
   * @returns {Promise} - Resolves with authentication data
   */
  const verifyOtp = async (email, otpCode) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        email: email.trim(),
        otpCode: otpCode.trim()
      });

      const { token: newToken, user: newUser } = response.data;

      // Store in state
      setToken(newToken);
      setUser(newUser);

      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      throw new Error(message);
    }
  };

  /**
   * Resend OTP function
   * 
   * @param {string} email - User's email
   * @param {string} method - 'email' or 'sms'
   * @returns {Promise} - Resolves with success message
   */
  const resendOtp = async (email, method = 'email') => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
        email: email.trim(),
        method: method
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      throw new Error(message);
    }
  };

  /**
   * Forgot Password function
   * 
   * @param {string} email - User's email
   * @returns {Promise} - Resolves with success message
   */
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.trim()
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset code';
      throw new Error(message);
    }
  };

  /**
   * Reset Password function
   * 
   * @param {string} email - User's email
   * @param {string} resetCode - Password reset OTP
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise} - Resolves with authentication data
   */
  const resetPassword = async (email, resetCode, newPassword, confirmPassword) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      throw new Error(message);
    }
  };

  /**
   * Logout function
   * 
   * Clears authentication state and localStorage
   * Also clears shopping cart
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Clear cart on logout
    
    // Dispatch custom event so CartContext can clear its state
    window.dispatchEvent(new Event('user-logout'));
  };

  /**
   * Update user function
   * 
   * Updates user data in state and localStorage
   * Used when user profile changes (e.g., linking to a school)
   * 
   * @param {object} updatedUser - Updated user object
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    isAuthenticated: !!token,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;