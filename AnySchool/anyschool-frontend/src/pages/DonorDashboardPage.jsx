import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Avatar, Chip, CircularProgress, Alert, Divider, LinearProgress,
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getSchoolName, formatCurrency } from '../utils/safeAccess';
import { formatDate } from '../utils/dateHelpers';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const getStatusInfo = (status) => {
  const info = {
    PENDING:           { label:'Pending Payment', bg:'#FEF9C3', color:'#854D0E', icon:'pending' },
    APPROVED:          { label:'Payment Received', bg:'#DCFCE7', color:'#15803D', icon:'check' },
    ACKNOWLEDGED:      { label:'Acknowledged', bg:'#E0E7FF', color:'#4338CA', icon:'check' },
    IN_PROCESS:        { label:'Processing', bg:'#DBEAFE', color:'#1D4ED8', icon:'clock' },
    FINALIZING:        { label:'Finalizing', bg:'#F3E8FF', color:'#7C3AED', icon:'clock' },
    OUT_FOR_DELIVERY:  { label:'Out for Delivery', bg:'#FED7AA', color:'#B45309', icon:'clock' },
    DELIVERED:         { label:'Delivered', bg:'#DCFCE7', color:'#15803D', icon:'check' },
    CLOSED:            { label:'Closed', bg:'#E5E7EB', color:'#374151', icon:'check' },
    CANCELLED:         { label:'Cancelled', bg:'#FEE2E2', color:'#991B1B', icon:'error' },
    DECLINED:          { label:'Declined', bg:'#FEE2E2', color:'#991B1B', icon:'error' },
    RETURNED:          { label:'Returned (Payment Failed)', bg:'#FEE2E2', color:'#991B1B', icon:'error' },
  };
  return info[status] || { label:status, bg:'#F3F4F6', color:'#6B7280', icon:'pending' };
};

const StatCard = ({ icon, label, value, sub, color='forest', gradient }) => (
  <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:`0 2px 12px rgba(27,58,45,0.07)` }}>
    <CardContent sx={{ p:3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color:C.stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', fontSize:'0.72rem' }}>{label}</Typography>
          <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mt:0.5 }}>{value}</Typography>
          {sub && <Typography variant="caption" sx={{ color:C.stone }}>{sub}</Typography>}
        </Box>
        <Avatar sx={{ background: gradient || `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, width:48, height:48, borderRadius:'14px' }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function DonorDashboardPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => { 
    fetchData();
    // Poll for donation updates every 3 seconds to show live status changes
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [donRes, statRes] = await Promise.all([
        axios.get(API_ENDPOINTS.ORDERS.DONATIONS, { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(API_ENDPOINTS.ORDERS.STATS,     { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      if (donRes.data.success)  setDonations(donRes.data.donations || []);
      if (statRes.data.success) setStats(statRes.data.stats || {});
    } catch (e) { setError(e.response?.data?.message || 'Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const totalDonated = stats?.totalDonated || donations.reduce((s,d) => s + (d.totalAmount||0), 0);
  const schoolsHelped = stats?.schoolsHelped || [...new Set(donations.map(d=>getSchoolName(d)).filter(Boolean))].length;
  const completedDonations = stats?.completedDonations || donations.filter(d=>['DELIVERED','CLOSED','COMPLETED'].includes(d.status)).length;
  const initials = user?.fullName ? user.fullName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'D';

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', py:5 }}>
      <Container maxWidth="lg">

        {/* Hero welcome */}
        <Box sx={{
          background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 60%, #3D7A60 100%)`,
          borderRadius:'24px', p:{xs:3,md:5}, mb:5, position:'relative', overflow:'hidden',
        }}>
          <Box sx={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', border:'1px solid rgba(200,164,92,0.2)' }} />
          <Box sx={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:3 }}>
            <Box sx={{ display:'flex', gap:3, alignItems:'center' }}>
              <Avatar sx={{ width:64, height:64, background:`linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight||'#E2C07A'} 100%)`,
                fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.4rem', color:C.forest, border:'3px solid rgba(255,255,255,0.2)' }}>
                {initials}
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', fontSize:'0.72rem' }}>
                  Donor Dashboard
                </Typography>
                <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff', mt:0.25 }}>
                  Welcome back, {user?.fullName?.split(' ')[0] || 'Donor'}
                </Typography>
                <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.65)', mt:0.5 }}>
                  Your generosity is changing lives in South African classrooms.
                </Typography>
              </Box>
            </Box>
            <Button component={Link} to="/stationery" variant="contained" startIcon={<VolunteerActivismIcon/>}
              sx={{ background:`linear-gradient(135deg, ${C.gold} 0%, #E2C07A 100%)`, color:C.forest, fontWeight:700, whiteSpace:'nowrap' }}>
              Donate Now
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb:5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<VolunteerActivismIcon sx={{color:'#fff',fontSize:22}}/>} label="Total Donated"
              value={`R ${totalDonated.toLocaleString('en-ZA',{minimumFractionDigits:0})}`}
              sub="lifetime contributions"
              gradient={`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<AutoStoriesIcon sx={{color:'#fff',fontSize:22}}/>} label="Donations Made"
              value={donations.length} sub="total orders"
              gradient="linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<SchoolIcon sx={{color:'#fff',fontSize:22}}/>} label="Schools Supported"
              value={schoolsHelped}
              sub="unique schools"
              gradient="linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<TrendingUpIcon sx={{color:'#fff',fontSize:22}}/>} label="Impact Score"
              value={completedDonations}
              sub="deliveries completed"
              gradient="linear-gradient(135deg, #B45309 0%, #F59E0B 100%)" />
          </Grid>
        </Grid>

        {/* Donation history */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, p:3, boxShadow:`0 2px 12px rgba(27,58,45,0.06)` }}>
              <Typography variant="h5" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mb:3 }}>
                Donation History
              </Typography>
              {donations.length === 0 ? (
                <Box sx={{ textAlign:'center', py:6 }}>
                  <VolunteerActivismIcon sx={{ fontSize:64, color:C.border, mb:2 }} />
                  <Typography color={C.stone}>No donations yet. Be the first to make an impact!</Typography>
                  <Button component={Link} to="/stationery" variant="contained" sx={{ mt:2 }}>Browse Catalog</Button>
                </Box>
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {donations.map(d => (
                    <Box key={d.id} sx={{ p:2.5, background:C.parchment, borderRadius:'14px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:2 }}>
                      <Box>
                        <Typography fontWeight={700} color={C.ink}>{getSchoolName(d)}</Typography>
                        <Typography variant="caption" color={C.stone}>{formatDate(d.createdAt)} · {d.itemCount||0} items</Typography>
                      </Box>
                      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                        <Typography fontWeight={700} color={C.forest} sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'1.1rem' }}>
                          R {(d.totalAmount||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2})}
                        </Typography>
                        <Chip
                          icon={getStatusInfo(d.status).icon==='check'?<CheckCircleIcon sx={{fontSize:'13px !important'}}/>:<PendingIcon sx={{fontSize:'13px !important'}}/>}
                          label={getStatusInfo(d.status).label}
                          size="small"
                          sx={{
                            background: getStatusInfo(d.status).bg,
                            color: getStatusInfo(d.status).color,
                            fontWeight:700, fontSize:'0.72rem', height:24,
                          }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Side panel */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display:'flex', flexDirection:'column', gap:3 }}>
              {/* Quick actions */}
              <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, p:3, boxShadow:`0 2px 12px rgba(27,58,45,0.06)` }}>
                <Typography variant="h6" fontWeight={700} color={C.ink} mb={2}>Quick Actions</Typography>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                  <Button component={Link} to="/stationery" variant="contained" startIcon={<AutoStoriesIcon/>} fullWidth
                    sx={{ justifyContent:'flex-start', px:2 }}>Browse Catalog</Button>
                  <Button component={Link} to="/schools" variant="outlined" startIcon={<SchoolIcon/>} fullWidth
                    sx={{ justifyContent:'flex-start', px:2, borderColor:C.border, color:C.ink }}>View Schools</Button>
                </Box>
              </Box>

              {/* Impact visual */}
              {donations.length > 0 && (
                <Box sx={{ background:`linear-gradient(135deg, ${C.goldPale} 0%, ${C.parchment} 100%)`, borderRadius:'20px', border:`1px solid ${C.border}`, p:3 }}>
                  <Typography variant="h6" fontWeight={700} color={C.forest} mb={2}>Your Impact</Typography>
                  <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                    {[
                      { label:'Orders Delivered', value: donations.filter(d=>['DELIVERED','CLOSED'].includes(d.status)).length, total:donations.length },
                      { label:'Orders Processing', value: donations.filter(d=>['ACKNOWLEDGED','IN_PROCESS','FINALIZING','OUT_FOR_DELIVERY'].includes(d.status)).length, total:donations.length },
                    ].map(({label,value,total})=>(
                      <Box key={label}>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                          <Typography variant="caption" fontWeight={600} color={C.stone}>{label}</Typography>
                          <Typography variant="caption" fontWeight={700} color={C.forest}>{value}/{total}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={total>0?(value/total)*100:0}
                          sx={{ borderRadius:4, height:6, background:'rgba(27,58,45,0.1)', '& .MuiLinearProgress-bar':{ background:`linear-gradient(90deg, ${C.forest} 0%, ${C.forestLight||'#3D7A60'} 100%)` } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
