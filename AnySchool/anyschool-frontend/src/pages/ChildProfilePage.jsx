import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Avatar, Chip,
  CircularProgress, Alert, Button, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import CakeIcon from '@mui/icons-material/Cake';
import GradeIcon from '@mui/icons-material/Grade';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Link as RouterLink } from 'react-router-dom';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const avatarColor = (name) => {
  const colors = ['#2D5C47','#1D4ED8','#7E22CE','#B45309','#BE123C','#0D6E6E'];
  let h = 0; for(let c of (name||'')) h = ((h<<5)-h)+c.charCodeAt(0);
  return colors[Math.abs(h) % colors.length];
};

const STATUS_MAP = {
  VERIFIED: { icon:<VerifiedIcon sx={{fontSize:15}}/>, label:'Verified', bg:'#DCFCE7', tc:'#15803D' },
  PENDING:  { icon:<PendingIcon  sx={{fontSize:15}}/>, label:'Pending',  bg:'#FEF9C3', tc:'#854D0E' },
  REJECTED: { label:'Rejected', bg:'#FEE2E2', tc:'#991B1B' },
  APPROVED: { icon:<VerifiedIcon sx={{fontSize:15}}/>, label:'Approved', bg:'#DCFCE7', tc:'#15803D' },
  UNLINKED: { label:'Unlinked', bg:'#DBEAFE', tc:'#1D4ED8' },
};

const formatDob = (dob) => {
  if (!dob) return null;
  try { return new Date(dob).toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' }); }
  catch { return null; }
};

const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date(), b = new Date(dob);
  let age = today.getFullYear() - b.getFullYear();
  if (today.getMonth() < b.getMonth() || (today.getMonth()===b.getMonth() && today.getDate()<b.getDate())) age--;
  return age;
};

const InfoRow = ({ label, value, chip }) => (
  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:1.5,
    borderBottom:`1px solid ${C.border}`, '&:last-child':{ borderBottom:'none' } }}>
    <Typography variant="body2" sx={{ color:C.stone, fontWeight:600 }}>{label}</Typography>
    {chip || <Typography variant="body2" sx={{ color:C.ink, fontWeight:500, textAlign:'right' }}>{value || '—'}</Typography>}
  </Box>
);

export default function ChildProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_ENDPOINTS.CHILDREN.BY_ID(id), { headers:{ Authorization:`Bearer ${token}` } });
        if (res.data.success) setChild(res.data.child);
        else setError('Child not found');
      } catch (e) { setError('Failed to load child profile'); }
      finally { setLoading(false); }
    };
    fetchChild();
  }, [id]);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><CircularProgress /></Box>;
  if (error || !child) return (
    <Container sx={{ py:8 }}>
      <Alert severity="error" sx={{ borderRadius:'12px', mb:3 }}>{error || 'Child not found'}</Alert>
      <Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate('/children')}>Back to Children</Button>
    </Container>
  );

  const ac  = avatarColor(child.name);
  const st  = STATUS_MAP[child.verificationStatus] || STATUS_MAP.PENDING;
  const age = calcAge(child.dateOfBirth);
  const initials = child.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'C';

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', py:5 }}>
      <Container maxWidth="md">
        {/* Back */}
        <Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate('/children')}
          sx={{ mb:4, color:C.stone, '&:hover':{ color:C.forest } }}>
          Back to My Children
        </Button>

        {/* Profile hero card */}
        <Card elevation={0} sx={{ borderRadius:'24px', border:`1px solid ${C.border}`, mb:4, overflow:'hidden',
          boxShadow:`0 4px 24px rgba(27,58,45,0.10)` }}>
          <Box sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, p:{xs:3,md:5} }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:3, flexWrap:'wrap' }}>
              <Avatar sx={{
                width:{xs:72,md:92}, height:{xs:72,md:92},
                background:`linear-gradient(135deg, ${ac} 0%, ${ac}99 100%)`,
                fontFamily:'"Cormorant Garamond",serif', fontWeight:700,
                fontSize:{xs:'1.6rem',md:'2rem'},
                border:'4px solid rgba(255,255,255,0.2)',
              }}>{initials}</Avatar>
              <Box sx={{ flex:1 }}>
                <Typography variant="h3" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700,
                  color:'#fff', fontSize:{xs:'1.8rem',md:'2.6rem'}, mb:1 }}>
                  {child.name}
                </Typography>
                <Box sx={{ display:'flex', flexWrap:'wrap', gap:1 }}>
                  <Chip icon={<GradeIcon sx={{fontSize:'14px !important', color:`${C.gold} !important`}}/>}
                    label={`Grade ${child.grade}`} size="small"
                    sx={{ background:'rgba(200,164,92,0.2)', color:C.gold, fontWeight:700, border:`1px solid rgba(200,164,92,0.35)` }} />
                  {age !== null && (
                    <Chip icon={<CakeIcon sx={{fontSize:'14px !important', color:'rgba(255,255,255,0.8) !important'}}/>}
                      label={`${age} years old`} size="small"
                      sx={{ background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.9)', fontWeight:600 }} />
                  )}
                  <Chip icon={st.icon ? React.cloneElement(st.icon, { sx:{ fontSize:'13px !important', color:`${st.tc} !important` } }) : undefined}
                    label={st.label} size="small"
                    sx={{ background:st.bg, color:st.tc, fontWeight:700 }} />
                </Box>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p:{xs:3,md:5} }}>
            <Grid container spacing={4}>
              {/* Personal Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mb:2, pb:1, borderBottom:`2px solid ${C.goldPale}` }}>
                  Personal Information
                </Typography>
                <InfoRow label="Full Name" value={child.name} />
                <InfoRow label="Date of Birth" value={formatDob(child.dateOfBirth)} />
                <InfoRow label="Age" value={age !== null ? `${age} years old` : null} />
                <InfoRow label="Grade" value={`Grade ${child.grade}`} />
                <InfoRow label="Verification" chip={
                  <Chip label={st.label} size="small" sx={{ background:st.bg, color:st.tc, fontWeight:700, height:22 }} />
                } />
              </Grid>

              {/* School Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mb:2, pb:1, borderBottom:`2px solid ${C.goldPale}` }}>
                  School Information
                </Typography>
                {child.school ? (
                  <>
                    <InfoRow label="School Name" value={child.school.name} />
                    <InfoRow label="Province" value={child.school.province} />
                    <InfoRow label="District" value={child.school.district} />
                    <InfoRow label="Grades Offered" value={child.school.grades} />
                    <InfoRow label="Contact" value={child.school.contactEmail} />
                  </>
                ) : (
                  <>
                    <InfoRow label="Requested School" value={child.requestedSchoolName} />
                    <InfoRow label="Status" value="Awaiting school registration" />
                    <Box sx={{ mt:2, p:2, background:'#EFF6FF', borderRadius:'12px' }}>
                      <Typography variant="body2" sx={{ color:'#1D4ED8', lineHeight:1.7 }}>
                        Your child's school hasn't been registered yet. Once an admin adds it, your child will be automatically linked.
                      </Typography>
                    </Box>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Actions */}
        <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
          <Button variant="contained" startIcon={<ShoppingCartIcon/>} component={RouterLink} to="/cart"
            sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
            Order Supplies for {child.name.split(' ')[0]}
          </Button>
          <Button variant="outlined" startIcon={<EditIcon/>} onClick={()=>navigate('/children')}
            sx={{ borderColor:C.border, color:C.ink }}>
            Edit Profile
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
