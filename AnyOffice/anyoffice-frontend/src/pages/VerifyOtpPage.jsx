import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, Typography, TextField,
  Button, Alert, CircularProgress
} from '@mui/material';
import { Email } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API from '../config/api';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || '';

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(API.AUTH.VERIFY_OTP, { email, otpCode });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const res = await axios.post(API.AUTH.RESEND_OTP, { email });
      if (res.data.success) {
        setSuccess('Verification code resent. Please check your email.');
        setCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="xs">
        <Box textAlign="center" mb={3}>
          <Email sx={{ fontSize: 56, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            We sent a 6-digit code to <strong>{email}</strong>
          </Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <form onSubmit={handleVerify}>
              <TextField
                label="Verification Code"
                fullWidth
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em' } }}
                sx={{ mb: 3 }}
                autoFocus
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || otpCode.length !== 6} sx={{ py: 1.5, fontWeight: 600 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify Email'}
              </Button>
            </form>
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Didn't receive the code?
              </Typography>
              <Button
                onClick={handleResend}
                disabled={resendLoading || cooldown > 0}
                sx={{ textTransform: 'none' }}
              >
                {resendLoading ? <CircularProgress size={16} /> : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default VerifyOtpPage;
