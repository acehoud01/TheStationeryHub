import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', cream:'#FAF7F2', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

export default function VerifyOtpPage() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const fullName = location.state?.fullName || '';

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!email) {
    return (
      <Box sx={{ minHeight:'100vh', background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', p:2 }}>
        <Box sx={{ textAlign:'center' }}>
          <Typography color="error" variant="h6" sx={{ mb:2 }}>
            Invalid verification flow. Please register again.
          </Typography>
          <Button component={Link} to="/register" variant="contained">
            Back to Registration
          </Button>
        </Box>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSuccess(false);

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtp(email, otpCode);
      const paths = { 
        PARENT:'/', 
        DONOR:'/donor/dashboard', 
        SCHOOL_ADMIN:'/school/dashboard',
        PURCHASING_ADMIN:'/purchasing/dashboard'
      };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendSuccess(false);
    setResendLoading(true);

    try {
      await resendOtp(email, 'email');
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
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
          <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, color:C.ink, mb:0.5 }}>
            Verify Your Account
          </Typography>
          <Typography variant="body2" sx={{ color:C.stone, mb:3 }}>
            We sent a verification code to {email}
          </Typography>

          {error && <Alert severity="error" sx={{ mb:2.5, borderRadius:'10px' }}>{error}</Alert>}
          {resendSuccess && <Alert severity="success" sx={{ mb:2.5, borderRadius:'10px' }}>OTP resent successfully!</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>
            <TextField 
              label="Verification Code" 
              type="text"
              inputProps={{ 
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric',
                style: { fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center' }
              }}
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
            />
            <Typography variant="caption" sx={{ color:C.stone, textAlign:'center' }}>
              6-digit code expires in 10 minutes
            </Typography>

            <Button type="submit" variant="contained" size="large" disabled={loading || otpCode.length !== 6}
              sx={{ mt:1, py:1.5, fontSize:'1rem', fontWeight:700 }}>
              {loading ? <><CircularProgress size={18} sx={{ mr:1, color:'inherit' }} />Verifying…</> : 'Verify Account'}
            </Button>
          </Box>

          <Box sx={{ mt:3, pt:3, borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
            <Typography variant="body2" sx={{ color:C.stone, mb:1 }}>
              Didn't receive a code?
            </Typography>
            <Button onClick={handleResendOtp} disabled={resendLoading}
              sx={{ textTransform:'none', color:C.forest, fontWeight:700, p:0, '&:hover':{ textDecoration:'underline' } }}>
              {resendLoading ? <><CircularProgress size={16} sx={{ mr:0.5 }} />Resending…</> : 'Resend Code'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
