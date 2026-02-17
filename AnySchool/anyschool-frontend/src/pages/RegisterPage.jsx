import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, CircularProgress, MenuItem, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const ROLES = [
  { value:'PARENT',       label:'Parent / Guardian',  icon:<FamilyRestroomIcon fontSize="small"/>, desc:'Manage children & order supplies',   bg:'#F0F9F4', color:C.forestMid },
  { value:'DONOR',        label:'Donor',               icon:<VolunteerActivismIcon fontSize="small"/>, desc:'Support schools with donations', bg:'#EFF6FF', color:'#1D4ED8' },
  { value:'SCHOOL_ADMIN', label:'School Administrator',icon:<AdminPanelSettingsIcon fontSize="small"/>, desc:'Manage your school account',    bg:'#FEF3C7', color:'#92400E' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ fullName:'', email:'', phoneNumber:'', password:'', confirmPassword:'', userType:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password || !form.userType) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      // Redirect to OTP verification page
      navigate('/verify-otp', { state: { email: form.email, fullName: form.fullName } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight:'100vh', background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', py:4, px:2,
      backgroundImage:`radial-gradient(ellipse at 80% 10%, rgba(200,164,92,0.08) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(27,58,45,0.05) 0%, transparent 50%)`,
    }}>
      <Box sx={{ width:'100%', maxWidth:520 }}>
        {/* Logo */}
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mb:4 }}>
          <Box sx={{ width:52, height:52, borderRadius:'14px', background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center', mb:2, boxShadow:`0 8px 24px rgba(27,58,45,0.22)` }}>
            <SchoolIcon sx={{ color:C.gold, fontSize:28 }} />
          </Box>
          <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.7rem', color:C.forest }}>AnySchool</Typography>
        </Box>

        <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, p:{xs:3,sm:4.5}, boxShadow:`0 4px 24px rgba(27,58,45,0.09)` }}>
          <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, color:C.ink, mb:0.5 }}>Create account</Typography>
          <Typography variant="body2" sx={{ color:C.stone, mb:3 }}>Join AnySchool — it's free</Typography>

          {error && <Alert severity="error" sx={{ mb:2.5, borderRadius:'10px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display:'flex', flexDirection:'column', gap:2 }}>

            {/* Role selector */}
            <Box>
              <Typography variant="caption" sx={{ color:C.stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', mb:1, display:'block' }}>
                I am a…
              </Typography>
              <Box sx={{ display:'flex', gap:1.5, flexWrap:'wrap' }}>
                {ROLES.map(r => (
                  <Box key={r.value} onClick={() => set('userType', r.value)}
                    sx={{
                      flex:'1 1 130px', p:2, borderRadius:'12px', cursor:'pointer',
                      border:`2px solid ${form.userType===r.value ? r.color : C.border}`,
                      background: form.userType===r.value ? r.bg : '#fff',
                      transition:'all 0.2s',
                      '&:hover':{ borderColor:r.color, background:r.bg },
                    }}
                  >
                    <Box sx={{ color:r.color, mb:0.5 }}>{r.icon}</Box>
                    <Typography variant="body2" fontWeight={700} color={C.ink}>{r.label}</Typography>
                    <Typography variant="caption" color={C.stone}>{r.desc}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <TextField label="Full Name" value={form.fullName} required onChange={e => set('fullName',e.target.value)} />
            <TextField label="Email Address" type="email" value={form.email} required onChange={e => set('email',e.target.value)} />
            <TextField label="Phone Number (optional)" value={form.phoneNumber} onChange={e => set('phoneNumber',e.target.value)} />
            <TextField label="Password" type="password" value={form.password} required
              onChange={e => set('password',e.target.value)} helperText="Minimum 8 characters" />
            <TextField label="Confirm Password" type="password" value={form.confirmPassword} required
              onChange={e => set('confirmPassword',e.target.value)} />

            <Button type="submit" variant="contained" size="large" disabled={loading || !form.userType}
              sx={{ mt:1, py:1.5, fontSize:'1rem', fontWeight:700 }}>
              {loading ? <><CircularProgress size={18} sx={{ mr:1, color:'inherit' }} />Creating account…</> : 'Create Account'}
            </Button>
          </Box>

          <Box sx={{ mt:3, pt:3, borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
            <Typography variant="body2" sx={{ color:C.stone }}>
              Already have an account?{' '}
              <Box component={Link} to="/login" sx={{ color:C.forest, fontWeight:700, textDecoration:'none', '&:hover':{ textDecoration:'underline' } }}>
                Sign in
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
