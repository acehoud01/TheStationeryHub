import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', cream:'#FAF7F2', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

export default function LoginPage() {
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'code'
  const [resetForm, setResetForm] = useState({ email: '', resetCode: '', newPassword: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const paths = { 
        PARENT:'/', 
        DONOR:'/donor/dashboard', 
        SCHOOL_ADMIN:'/school/dashboard', 
        PURCHASING_ADMIN:'/purchasing/dashboard',
        SUPER_ADMIN:'/admin' 
      };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await forgotPassword(resetForm.email);
      setResetStep('code');
    } catch (err) {
      setResetError(err.message || 'Failed to send reset code');
    } finally { setResetLoading(false); }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    
    if (!resetForm.resetCode) { setResetError('Reset code is required'); return; }
    if (!resetForm.newPassword) { setResetError('New password is required'); return; }
    if (resetForm.newPassword.length < 6) { setResetError('Password must be at least 6 characters'); return; }
    if (resetForm.newPassword !== resetForm.confirmPassword) { setResetError('Passwords do not match'); return; }
    
    setResetLoading(true);
    try {
      await resetPassword(resetForm.email, resetForm.resetCode, resetForm.newPassword, resetForm.confirmPassword);
      setResetError('');
      setForgotPasswordOpen(false);
      setResetStep('email');
      setResetForm({ email: '', resetCode: '', newPassword: '', confirmPassword: '' });
      setError(''); // Clear login error
      // Auto-fill email in login form
      setForm({ ...form, email: resetForm.email, password: '' });
    } catch (err) {
      setResetError(err.message || 'Password reset failed');
    } finally { setResetLoading(false); }
  };

  const closeForgotPasswordDialog = () => {
    setForgotPasswordOpen(false);
    setResetStep('email');
    setResetForm({ email: '', resetCode: '', newPassword: '', confirmPassword: '' });
    setResetError('');
  };

  return (
    <Box sx={{ minHeight:'100vh', background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', p:2,
      backgroundImage:`radial-gradient(ellipse at 70% 20%, rgba(200,164,92,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(27,58,45,0.06) 0%, transparent 50%)`,
    }}>
      <Box sx={{ width:'100%', maxWidth:440 }}>
        {/* Logo */}
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mb:4 }}>
          <Box sx={{ width:52, height:52, borderRadius:'14px', background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center', mb:2, boxShadow:`0 8px 24px rgba(27,58,45,0.22)` }}>
            <SchoolIcon sx={{ color:C.gold, fontSize:28 }} />
          </Box>
          <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.7rem', color:C.forest }}>
            AnySchool
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, p:{xs:3,sm:4.5},
          boxShadow:`0 4px 24px rgba(27,58,45,0.09)` }}>
          <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, color:C.ink, mb:0.75 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color:C.stone, mb:3 }}>
            Sign in to your AnySchool account
          </Typography>

          {error && <Alert severity="error" sx={{ mb:2.5, borderRadius:'10px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
            <TextField label="Email address" type="email" value={form.email} required
              onChange={e => setForm({...form, email:e.target.value})} />
            <TextField label="Password" type="password" value={form.password} required
              onChange={e => setForm({...form, password:e.target.value})} />
            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{ mt:1, py:1.5, fontSize:'1rem', fontWeight:700 }}>
              {loading ? <><CircularProgress size={18} sx={{ mr:1, color:'inherit' }} />Signing in…</> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt:2, textAlign:'center' }}>
            <Button onClick={() => setForgotPasswordOpen(true)} sx={{ textTransform:'none', color:C.forest, fontWeight:600, p:0, '&:hover': { textDecoration:'underline' } }}>
              Forgot password?
            </Button>
          </Box>

          <Box sx={{ mt:3, pt:3, borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
            <Typography variant="body2" sx={{ color:C.stone }}>
              Don't have an account?{' '}
              <Box component={Link} to="/register" sx={{ color:C.forest, fontWeight:700, textDecoration:'none', '&:hover':{ textDecoration:'underline' } }}>
                Create one free
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={closeForgotPasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.forest, fontSize:'1.3rem' }}>
          {resetStep === 'email' && 'Reset Your Password'}
          {resetStep === 'code' && 'Enter Reset Code'}
        </DialogTitle>
        <DialogContent>
          {resetError && <Alert severity="error" sx={{ mb:2, borderRadius:'8px' }}>{resetError}</Alert>}
          {resetStep === 'email' && (
            <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{ display:'flex', flexDirection:'column', gap:2, mt:2 }}>
              <Typography variant="body2" sx={{ color:C.stone }}>
                Enter your email address and we'll send you a code to reset your password.
              </Typography>
              <TextField label="Email address" type="email" value={resetForm.email} required
                onChange={e => setResetForm({...resetForm, email:e.target.value})} fullWidth />
              <Button type="submit" variant="contained" disabled={resetLoading} sx={{ mt:1 }}>
                {resetLoading ? <CircularProgress size={18} sx={{ mr:1 }} /> : null}
                Send Reset Code
              </Button>
            </Box>
          )}
          {resetStep === 'code' && (
            <Box sx={{ display:'flex', flexDirection:'column', gap:2, mt:2 }}>
              <Typography variant="body2" sx={{ color:C.stone }}>
                Enter the 6-digit code we sent to your email.
              </Typography>
              <TextField label="Reset code" value={resetForm.resetCode} maxLength="6"
                onChange={e => setResetForm({...resetForm, resetCode:e.target.value.replace(/\D/g, '').slice(0, 6)})} fullWidth placeholder="000000" />
              <TextField label="New password" type="password" value={resetForm.newPassword}
                onChange={e => setResetForm({...resetForm, newPassword:e.target.value})} fullWidth helperText="Minimum 6 characters" />
              <TextField label="Confirm password" type="password" value={resetForm.confirmPassword}
                onChange={e => setResetForm({...resetForm, confirmPassword:e.target.value})} fullWidth />
              <Button variant="contained" onClick={handleResetPasswordSubmit} disabled={resetLoading} sx={{ mt:1 }}>
                {resetLoading ? <><CircularProgress size={18} sx={{ mr:1 }} />Resetting…</> : 'Reset Password'}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={closeForgotPasswordDialog} sx={{ color:C.stone }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
