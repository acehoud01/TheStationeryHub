import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip,
  CircularProgress, Alert, TextField, InputAdornment, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GradeIcon from '@mui/icons-material/Grade';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const SA_PROVINCES = ['All','Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','Mpumalanga','North West','Northern Cape'];

const schColor = (name) => {
  const cols = ['#2D5C47','#1D4ED8','#7E22CE','#B45309','#BE123C','#0D6E6E','#1e3a5f'];
  let h = 0; for(let c of (name||'')) h = ((h<<5)-h)+c.charCodeAt(0);
  return cols[Math.abs(h)%cols.length];
};

export default function SchoolsListPage() {
  const [schools, setSchools]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [province, setProvince]   = useState('All');

  useEffect(() => { fetchSchools(); }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.SCHOOLS.LIST);
      if (res.data.success) setSchools(res.data.schools || []);
    } catch (e) { setError('Failed to load schools'); }
    finally { setLoading(false); }
  };

  const filtered = schools.filter(s => {
    const m = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.district?.toLowerCase().includes(search.toLowerCase());
    const p = province==='All' || s.province?.toLowerCase()===province.toLowerCase();
    return m && p;
  });

  const linkedCount = schools.filter(s => s.hasAdmin).length;
  const unlinkedCount = schools.length - linkedCount;

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', pb:10 }}>
      {/* Header */}
      <Box sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, py:{xs:6,md:9}, mb:5 }}>
        <Container maxWidth="lg">
          <Chip label="✦ REGISTERED SCHOOLS" sx={{ background:'rgba(200,164,92,0.2)', color:C.gold, fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.06em', mb:2, border:`1px solid rgba(200,164,92,0.3)` }} />
          <Typography variant="h2" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff', fontSize:{xs:'2.4rem',md:'3.6rem'} }}>
            Partner Schools
          </Typography>
          <Box sx={{ display:'flex', gap:3, mt:2, flexWrap:'wrap' }}>
            <Box>
              <Typography sx={{ color:'rgba(255,255,255,0.65)', fontSize:'0.9rem' }}>
                Total Schools
              </Typography>
              <Typography sx={{ color:'#fff', fontSize:'1.8rem', fontWeight:700 }}>
                {schools.length}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color:'rgba(255,255,255,0.65)', fontSize:'0.9rem' }}>
                With Admin
              </Typography>
              <Typography sx={{ color:'#4ade80', fontSize:'1.8rem', fontWeight:700 }}>
                {linkedCount}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color:'rgba(255,255,255,0.65)', fontSize:'0.9rem' }}>
                Available
              </Typography>
              <Typography sx={{ color:'#fbbf24', fontSize:'1.8rem', fontWeight:700 }}>
                {unlinkedCount}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Search + Province filter */}
        <Box sx={{ display:'flex', gap:2, mb:4, flexWrap:'wrap' }}>
          <TextField size="small" placeholder="Search by name or district…" value={search}
            onChange={e=>setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon fontSize="small" sx={{color:C.stone}}/></InputAdornment> }}
            sx={{ width:{xs:'100%',sm:320}, '& .MuiOutlinedInput-root':{ borderRadius:'10px', background:'#fff' } }} />
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', flex:1 }}>
            {SA_PROVINCES.slice(0,6).map(p => (
              <Chip key={p} label={p} onClick={()=>setProvince(p)} size="small"
                sx={{
                  cursor:'pointer', fontWeight:600, fontSize:'0.78rem',
                  background: province===p ? C.forest : '#fff',
                  color:      province===p ? '#fff'   : C.stone,
                  border:`1px solid ${province===p ? C.forest : C.border}`,
                  '&:hover':{ background: province===p ? C.forestMid : C.parchment },
                }} />
            ))}
          </Box>
        </Box>

        {error   && <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}
        {loading && <Box sx={{ display:'flex', justifyContent:'center', py:10 }}><CircularProgress /></Box>}

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign:'center', py:12 }}>
            <SchoolIcon sx={{ fontSize:72, color:C.border, mb:2 }} />
            <Typography variant="h5" sx={{ fontFamily:'"Cormorant Garamond",serif', color:C.stone }}>No schools found</Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {filtered.map(school => {
            const ac = schColor(school.name);
            const initials = school.name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || 'SC';
            return (
              <Grid item xs={12} sm={6} md={4} key={school.id}>
                <Card elevation={0} sx={{
                  borderRadius:'20px', 
                  border:`2px solid ${school.hasAdmin ? '#15803D' : C.border}`, 
                  height:'100%',
                  transition:'all 0.25s', 
                  boxShadow:`0 2px 10px rgba(27,58,45,0.06)`,
                  background: school.hasAdmin ? '#F0FDF4' : '#fff',
                  '&:hover':{ boxShadow:`0 12px 36px rgba(27,58,45,0.16)`, transform:'translateY(-3px)', borderColor: school.hasAdmin ? '#15803D' : C.gold },
                }}>
                  {/* Colour band */}
                  <Box sx={{ height:6, background: school.hasAdmin ? 'linear-gradient(90deg, #15803D 0%, #16a34a 100%)' : `linear-gradient(90deg, ${ac} 0%, ${ac}88 100%)`, borderRadius:'20px 20px 0 0' }} />
                  <CardContent sx={{ p:3 }}>
                    <Box sx={{ display:'flex', gap:2, alignItems:'flex-start', mb:2.5 }}>
                      <Avatar sx={{ width:48, height:48, background:`linear-gradient(135deg, ${ac} 0%, ${ac}AA 100%)`,
                        fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1rem',
                        border:`2px solid ${C.border}`, flexShrink:0 }}>
                        {initials}
                      </Avatar>
                      <Box sx={{ flex:1, minWidth:0 }}>
                        <Typography fontWeight={700} color={C.ink} sx={{ lineHeight:1.35 }}>{school.name}</Typography>
                        {school.province && (
                          <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mt:0.5 }}>
                            <LocationOnIcon sx={{ fontSize:13, color:C.stone }} />
                            <Typography variant="caption" color={C.stone}>
                              {[school.district, school.province].filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mb:2.5 }}>
                      {school.grades && (
                        <Chip icon={<GradeIcon sx={{fontSize:'12px !important'}}/>}
                          label={`Gr ${school.grades}`} size="small"
                          sx={{ background:C.goldPale, color:C.forest, fontWeight:600, fontSize:'0.72rem', height:22 }} />
                      )}
                      {school.hasAdmin ? (
                        <Chip 
                          icon={<CheckCircleIcon sx={{fontSize:'12px !important'}}/>}
                          label={`Admin: ${school.admin?.fullName || 'Linked'}`} 
                          size="small"
                          sx={{ background:'#DCFCE7', color:'#15803D', fontWeight:700, fontSize:'0.72rem', height:22 }} />
                      ) : (
                        <Chip 
                          icon={<PendingIcon sx={{fontSize:'12px !important'}}/>}
                          label="No Admin" 
                          size="small"
                          sx={{ background:'#FEF9C3', color:'#854D0E', fontWeight:700, fontSize:'0.72rem', height:22 }} />
                      )}
                    </Box>

                    {(school.phone || school.admin?.email) && (
                      <Box sx={{ pt:2, borderTop:`1px solid ${C.border}` }}>
                        {school.phone && (
                          <Typography variant="caption" color={C.stone} display="block">📞 {school.phone}</Typography>
                        )}
                        {school.admin?.email && (
                          <Typography variant="caption" color={C.stone} display="block">✉️ {school.admin.email}</Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
