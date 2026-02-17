import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, Typography, TextField,
  Button, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Stepper, Step, StepLabel
} from '@mui/material';
import { Business } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API from '../config/api';

const ROLE_REDIRECTS = {
  SUPER_ADMIN: '/admin',
  COMPANY_ADMIN: '/dashboard',
  PROCUREMENT_OFFICER: '/dashboard',
  DEPARTMENT_MANAGER: '/dashboard',
  EMPLOYEE: '/dashboard',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password flow
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState(0);
  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPwd, setFpNewPwd] = useState('');
  const [fpConfirmPwd, setFpConfirmPwd] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(API.AUTH.LOGIN, { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        const redirect = ROLE_REDIRECTS[res.data.user.role] || '/dashboard';
        navigate(redirect, { replace: true });
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-otp', { state: { email } });
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFpSubmit = async () => {
    setFpError('');
    setFpLoading(true);
    try {
      if (fpStep === 0) {
        await axios.post(API.AUTH.FORGOT_PASSWORD, { email: fpEmail });
        setFpSuccess('If an account exists, a reset code has been sent.');
        setFpStep(1);
      } else {
        if (fpNewPwd !== fpConfirmPwd) { setFpError('Passwords do not match'); setFpLoading(false); return; }
        const res = await axios.post(API.AUTH.RESET_PASSWORD, { email: fpEmail, resetCode: fpCode, newPassword: fpNewPwd, confirmPassword: fpConfirmPwd });
        if (res.data.success) {
          setFpSuccess('Password reset successfully. You can now log in.');
          setTimeout(() => { setFpOpen(false); setFpStep(0); setFpEmail(''); setFpCode(''); setFpNewPwd(''); setFpConfirmPwd(''); setFpSuccess(''); }, 2000);
        } else {
          setFpError(res.data.message);
        }
      }
    } catch (err) {
      setFpError(err.response?.data?.message || 'An error occurred');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="xs">
        <Box textAlign="center" mb={3}>
          <Business sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ fontFamily: '"Cormorant Garamond", serif' }}>
            AnyOffice
          </Typography>
          <Typography variant="body2" color="text.secondary">B2B Office Procurement</Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} mb={3}>Sign In</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleLogin}>
              <TextField label="Email Address" type="email" fullWidth required value={email}
                onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} autoFocus />
              <TextField label="Password" type="password" fullWidth required value={password}
                onChange={(e) => setPassword(e.target.value)} sx={{ mb: 1 }} />
              <Box textAlign="right" mb={2}>
                <Button size="small" onClick={() => { setFpOpen(true); setFpEmail(email); }} sx={{ textTransform: 'none', color: 'primary.main' }}>
                  Forgot password?
                </Button>
              </Box>
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, fontWeight: 600 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </form>
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#1A2E44', fontWeight: 600 }}>Register here</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={fpOpen} onClose={() => setFpOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <Stepper activeStep={fpStep} sx={{ mb: 3 }}>
              <Step><StepLabel>Enter Email</StepLabel></Step>
              <Step><StepLabel>Reset Password</StepLabel></Step>
            </Stepper>
            {fpSuccess && <Alert severity="success" sx={{ mb: 2 }}>{fpSuccess}</Alert>}
            {fpError && <Alert severity="error" sx={{ mb: 2 }}>{fpError}</Alert>}
            {fpStep === 0 ? (
              <TextField label="Email Address" type="email" fullWidth value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} sx={{ mt: 1 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label="Reset Code" fullWidth value={fpCode} onChange={(e) => setFpCode(e.target.value)} />
                <TextField label="New Password" type="password" fullWidth value={fpNewPwd} onChange={(e) => setFpNewPwd(e.target.value)} />
                <TextField label="Confirm Password" type="password" fullWidth value={fpConfirmPwd} onChange={(e) => setFpConfirmPwd(e.target.value)} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFpOpen(false)}>Cancel</Button>
            <Button onClick={handleFpSubmit} variant="contained" disabled={fpLoading}>
              {fpLoading ? <CircularProgress size={18} color="inherit" /> : fpStep === 0 ? 'Send Code' : 'Reset Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LoginPage;
