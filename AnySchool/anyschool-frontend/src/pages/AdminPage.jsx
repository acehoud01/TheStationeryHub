import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Avatar, Chip,
  CircularProgress, Alert, Button, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip,
  Badge, LinearProgress, InputAdornment,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MessageIcon from '@mui/icons-material/Message';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateHelpers';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const StatCard = ({ icon, label, value, sub, gradient, pulse }) => (
  <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}`, boxShadow:`0 2px 12px rgba(27,58,45,0.07)`, overflow:'hidden' }}>
    <CardContent sx={{ p:3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color:C.stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', fontSize:'0.72rem' }}>{label}</Typography>
          <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mt:0.5 }}>{value}</Typography>
          {sub && <Typography variant="caption" color={C.stone}>{sub}</Typography>}
        </Box>
        <Badge color="error" variant="dot" invisible={!pulse}>
          <Avatar sx={{ background:gradient, width:48, height:48, borderRadius:'14px' }}>{icon}</Avatar>
        </Badge>
      </Box>
    </CardContent>
  </Card>
);

const TabPanel = ({ children, value, index }) =>
  value === index ? <Box sx={{ pt:3 }}>{children}</Box> : null;

const STATUS_CHIP = ({ status }) => {
  const map = {
    ACTIVE:    { bg:'#DCFCE7', color:'#15803D' },
    INACTIVE:  { bg:'#FEE2E2', color:'#991B1B' },
    UNVERIFIED: { bg:'#FEF3C7', color:'#92400E' },
    PENDING:   { bg:'#FEF9C3', color:'#854D0E' },
    APPROVED:  { bg:'#DCFCE7', color:'#15803D' },
    REJECTED:  { bg:'#FEE2E2', color:'#991B1B' },
    VERIFIED:  { bg:'#DCFCE7', color:'#15803D' },
    PARENT:       { bg:'#F0FDF4', color:'#15803D' },
    DONOR:        { bg:'#EFF6FF', color:'#1D4ED8' },
    SCHOOL_ADMIN: { bg:'#FEF3C7', color:'#92400E' },
    PURCHASING_ADMIN: { bg:'#F3E8FF', color:'#7E22CE' },
    SUPER_ADMIN:  { bg:'#F3E8FF', color:'#7E22CE' },
  };
  const s = map[status] || { bg:'#F3F4F6', color:'#374151' };
  return <Chip label={status} size="small" sx={{ background:s.bg, color:s.color, fontWeight:700, fontSize:'0.72rem', height:22 }} />;
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]           = useState(0);
  const [schools, setSchools]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [orders, setOrders]     = useState([]);
  const [schoolRequests, setSchoolRequests] = useState([]);
  const [stats, setStats]       = useState(null);
  const [health, setHealth]     = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [search, setSearch]     = useState('');

  // School dialog
  const [schoolDialog, setSchoolDialog] = useState(false);
  const [editSchool,   setEditSchool]   = useState(null);
  const [schoolForm, setSchoolForm]     = useState({ name:'', province:'', district:'', grades:'', contactEmail:'', contactPhone:'' });

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ open:false, type:'', item:null });

  // Request review dialog
  const [requestDialog, setRequestDialog] = useState({ open:false, request:null, action:'' });
  const [requestNotes, setRequestNotes]   = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization:`Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [schoolRes, userRes, ordRes, statRes, healthRes, requestsRes, sysHealthRes] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.SCHOOLS.LIST),
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
        axios.get(API_ENDPOINTS.ADMIN.ORDERS,  { headers }),
        axios.get(API_ENDPOINTS.ORDERS.STATS, { headers }),
        axios.get(API_ENDPOINTS.HEALTH),
        axios.get(API_ENDPOINTS.SCHOOL_REQUESTS.ADMIN_PENDING, { headers }),
        axios.get(API_ENDPOINTS.SYSTEM_MONITORING.HEALTH, { headers }),
      ]);
      if (schoolRes.status==='fulfilled' && schoolRes.value.data.success) setSchools(schoolRes.value.data.schools||[]);
      if (userRes.status==='fulfilled'   && userRes.value.data.success)   setUsers(userRes.value.data.users||[]);
      if (ordRes.status==='fulfilled'    && ordRes.value.data.success)    setOrders(ordRes.value.data.orders||[]);
      if (statRes.status==='fulfilled'   && statRes.value.data.success)   setStats(statRes.value.data);
      if (healthRes.status==='fulfilled') setHealth({ status:'UP', ...healthRes.value.data });
      else setHealth({ status:'DOWN' });
      if (requestsRes.status==='fulfilled' && requestsRes.value.data.success) setSchoolRequests(requestsRes.value.data.requests||[]);
      if (sysHealthRes.status==='fulfilled' && sysHealthRes.value.data) setSystemHealth(sysHealthRes.value.data);
    } catch (e) { setError('Failed to load admin data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // School CRUD
  const openSchoolDialog = (school=null) => {
    setEditSchool(school);
    setSchoolForm(school
      ? { name:school.name||'', province:school.province||'', district:school.district||'', grades:school.grades||'', contactEmail:school.contactEmail||'', contactPhone:school.contactPhone||'' }
      : { name:'', province:'', district:'', grades:'', contactEmail:'', contactPhone:'' });
    setSchoolDialog(true);
  };

  const saveSchool = async () => {
    setError(''); setSuccess('');
    try {
      if (editSchool) {
        await axios.put(`${API_ENDPOINTS.SCHOOLS.BY_ID(editSchool.id)}`, schoolForm, { headers });
        setSuccess('School updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.SCHOOLS.LIST, schoolForm, { headers });
        setSuccess('School created successfully');
      }
      setSchoolDialog(false); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Failed to save school'); }
  };

  const deleteItem = async () => {
    const { type, item } = deleteDialog;
    setError(''); setSuccess('');
    try {
      if (type==='school') await axios.delete(API_ENDPOINTS.SCHOOLS.BY_ID(item.id), { headers });
      if (type==='user')   await axios.delete(`${API_BASE_URL}/api/admin/users/${item.id}`, { headers });
      if (type==='order')  await axios.delete(`${API_BASE_URL}/api/admin/orders/${item.id}`, { headers });
      setSuccess(`${type.charAt(0).toUpperCase()+type.slice(1)} deleted`);
      setDeleteDialog({ open:false, type:'', item:null }); fetchAll();
    } catch (e) { setError(e.response?.data?.message || `Failed to delete ${type}`); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, { status }, { headers });
      setSuccess('Order status updated'); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Failed to update status'); }
  };

  const approveOrder = async (orderId) => {
    try {
      await axios.post(API_ENDPOINTS.ADMIN.APPROVE_ORDER(orderId), {}, { headers });
      setSuccess(`Order #${orderId} approved successfully`); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Failed to approve order'); }
  };

  const declineOrder = async (orderId, reason) => {
    try {
      await axios.post(API_ENDPOINTS.ADMIN.DECLINE_ORDER(orderId), { reason }, { headers });
      setSuccess(`Order #${orderId} declined`); fetchAll();
    } catch (e) { setError(e.response?.data?.message || 'Failed to decline order'); }
  };

  // School request approval/rejection
  const openRequestDialog = (request, action) => {
    setRequestDialog({ open:true, request, action });
    setRequestNotes('');
  };

  const handleRequestAction = async () => {
    const { request, action } = requestDialog;
    setError(''); setSuccess('');
    try {
      if (action === 'approve') {
        await axios.post(API_ENDPOINTS.SCHOOL_REQUESTS.APPROVE(request.id), 
          requestNotes ? { notes: requestNotes } : {}, 
          { headers });
        setSuccess(`School request approved! Admin ${request.admin.fullName} is now linked.`);
      } else {
        await axios.post(API_ENDPOINTS.SCHOOL_REQUESTS.REJECT(request.id), 
          { reason: requestNotes || 'Request was rejected' }, 
          { headers });
        setSuccess('School request rejected.');
      }
      setRequestDialog({ open:false, request:null, action:'' });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const filteredSchools = schools.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.province?.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers   = users.filter(u => !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredOrders  = orders.filter(o => !search || String(o.id).includes(search) || o.studentName?.toLowerCase().includes(search.toLowerCase()));
  const filteredRequests = schoolRequests.filter(r => !search || r.admin?.fullName?.toLowerCase().includes(search.toLowerCase()) || r.schoolName?.toLowerCase().includes(search.toLowerCase()));

  const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'SA';
  const pendingCount = schoolRequests.length;

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', py:5 }}>
      <Container maxWidth="xl">

        {/* Hero Header */}
        <Box sx={{
          background:`linear-gradient(135deg, #2D1B69 0%, #1B3A2D 50%, ${C.forestMid} 100%)`,
          borderRadius:'24px', p:{xs:3,md:5}, mb:5, position:'relative', overflow:'hidden',
        }}>
          <Box sx={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', border:'1px solid rgba(200,164,92,0.15)' }}/>
          <Box sx={{ position:'absolute', bottom:-80, left:'40%', width:200, height:200, borderRadius:'50%', background:'rgba(200,164,92,0.04)' }}/>
          <Box sx={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:3 }}>
            <Box sx={{ display:'flex', gap:3, alignItems:'center' }}>
              <Avatar sx={{ width:64, height:64, background:`linear-gradient(135deg, ${C.gold} 0%, #E2C07A 100%)`,
                color:C.forest, fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.3rem', border:'3px solid rgba(255,255,255,0.2)' }}>
                {initials}
              </Avatar>
              <Box>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.25 }}>
                  <AdminPanelSettingsIcon sx={{ color:C.gold, fontSize:18 }} />
                  <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', fontSize:'0.72rem' }}>
                    Super Administrator
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff' }}>
                  Admin Control Panel
                </Typography>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mt:0.75 }}>
                  {health?.status === 'UP'
                    ? <><WifiIcon sx={{ fontSize:14, color:'#4ade80' }} /><Typography variant="caption" sx={{ color:'#4ade80' }}>System Online</Typography></>
                    : <><WifiOffIcon sx={{ fontSize:14, color:'#f87171' }} /><Typography variant="caption" sx={{ color:'#f87171' }}>System Issue</Typography></>
                  }
                </Box>
              </Box>
            </Box>
            <Button onClick={fetchAll} variant="outlined" startIcon={<RefreshIcon/>}
              sx={{ borderColor:'rgba(255,255,255,0.35)', color:'#fff', '&:hover':{ borderColor:'#fff', background:'rgba(255,255,255,0.08)' } }}>
              Refresh
            </Button>
          </Box>
        </Box>

        {error   && <Alert severity="error"   sx={{ mb:3, borderRadius:'12px' }} onClose={()=>setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb:3, borderRadius:'12px' }} onClose={()=>setSuccess('')}>{success}</Alert>}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb:5 }}>
          {[
            { icon:<SchoolIcon sx={{color:'#fff',fontSize:22}}/>, label:'Total Schools', value:schools.length, sub:'registered', gradient:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` },
            { icon:<PeopleIcon sx={{color:'#fff',fontSize:22}}/>, label:'Total Users', value:users.length, sub:'all roles', gradient:'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)' },
            { icon:<ShoppingCartIcon sx={{color:'#fff',fontSize:22}}/>, label:'Total Orders', value:orders.length, sub:'all time', gradient:'linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)' },
            { icon:<PendingActionsIcon sx={{color:'#fff',fontSize:22}}/>, label:'Pending Requests', value:pendingCount, sub:'need review', gradient:'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)', pulse:pendingCount>0 },
          ].map(s => <Grid item xs={12} sm={6} md={3} key={s.label}><StatCard {...s}/></Grid>)}
        </Grid>

        {/* Network / Health Panel */}
        <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, p:3, mb:4, boxShadow:`0 2px 12px rgba(27,58,45,0.06)` }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
            <BugReportIcon sx={{ color:C.forest }} />
            <Typography variant="h6" fontWeight={700} color={C.ink}>System Health</Typography>
            <Box sx={{ ml:'auto', display:'flex', gap:1 }}>
              <Chip
                icon={health?.status==='UP' ? <WifiIcon sx={{fontSize:'13px !important'}}/> : <WifiOffIcon sx={{fontSize:'13px !important'}}/>}
                label={health?.status==='UP' ? 'Backend Online' : 'Backend Offline'}
                size="small"
                sx={{
                  background: health?.status==='UP' ? '#DCFCE7' : '#FEE2E2',
                  color:      health?.status==='UP' ? '#15803D' : '#991B1B',
                  fontWeight:700, fontSize:'0.75rem',
                }} />
              <Chip label={`${schools.length} Schools`} size="small" sx={{ background:C.goldPale, color:C.forest, fontWeight:700 }} />
              <Chip label={`${users.length} Users`} size="small" sx={{ background:'#EFF6FF', color:'#1D4ED8', fontWeight:700 }} />
            </Box>
          </Box>
          <Grid container spacing={3}>
            {[
              { label:'Schools Active', value:schools.filter(s=>s.isActive!==false).length, total:schools.length, color:C.forest },
              { label:'Users Active', value:users.filter(u=>u.enabled!==false && u.verified!==false).length, total:users.length, color:'#1D4ED8' },
              { label:'Users Unverified', value:users.filter(u=>!u.verified).length, total:users.length, color:'#B45309' },
              { label:'Orders Delivered', value:orders.filter(o=>o.status==='DELIVERED').length, total:orders.length, color:'#15803D' },
              { label:'Orders Pending', value:orders.filter(o=>o.status==='PENDING').length, total:orders.length, color:'#B45309' },
            ].map(({label,value,total,color}) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Box>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.75 }}>
                    <Typography variant="caption" fontWeight={600} color={C.stone}>{label}</Typography>
                    <Typography variant="caption" fontWeight={700} color={color}>{value} / {total}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={total>0 ? (value/total)*100 : 0}
                    sx={{ height:6, borderRadius:3, background:'#F3F4F6', '& .MuiLinearProgress-bar':{ background:color, borderRadius:3 } }}/>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* System Monitoring Dashboard */}
        {systemHealth && (
          <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, p:3, mb:4, boxShadow:`0 2px 12px rgba(27,58,45,0.06)` }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
              <AdminPanelSettingsIcon sx={{ color:C.forest }} />
              <Typography variant="h6" fontWeight={700} color={C.ink}>System Monitoring Dashboard</Typography>
              <Box sx={{ ml:'auto' }}>
                <Chip 
                  label={systemHealth.systemStatus || 'UNKNOWN'}
                  size="small"
                  sx={{
                    background: systemHealth.systemStatus === 'HEALTHY' ? '#DCFCE7' : 
                               systemHealth.systemStatus === 'WARNING' ? '#FEF9C3' : '#FEE2E2',
                    color: systemHealth.systemStatus === 'HEALTHY' ? '#15803D' : 
                           systemHealth.systemStatus === 'WARNING' ? '#854D0E' : '#991B1B',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Box>

            {/* System Status Overview */}
            <Grid container spacing={2} sx={{ mb:3 }}>
              {[
                { label: 'Backend', status: systemHealth.backend?.status, icon: '⚙️', color: systemHealth.backend?.status === 'HEALTHY' ? '#15803D' : '#991B1B' },
                { label: 'Database', status: systemHealth.database?.status, icon: '💾', color: systemHealth.database?.status === 'CONNECTED' ? '#15803D' : '#991B1B' },
                { label: 'Network', status: systemHealth.network?.status, icon: '🌐', color: systemHealth.network?.status === 'OPERATIONAL' ? '#15803D' : '#991B1B' },
              ].map(item => (
                <Grid item xs={12} sm={6} md={3} key={item.label}>
                  <Box sx={{ p:2, background:C.goldPale, borderRadius:'12px', border:`1px solid ${C.border}` }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
                      <Typography variant="caption" fontWeight={600} color={C.stone}>{item.icon} {item.label}</Typography>
                      <Chip label={item.status} size="small" sx={{ background:'#fff', height:20, fontSize:'0.7rem' }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Resource Utilization */}
            <Grid container spacing={2} sx={{ mb:3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                    <Typography variant="caption" fontWeight={600} color={C.stone}>CPU Usage</Typography>
                    <Typography variant="caption" fontWeight={700} color={C.forest}>{systemHealth.backend?.cpu?.processUsage}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={parseFloat(systemHealth.backend?.cpu?.processUsage || 0)}
                    sx={{ height:6, borderRadius:3, background:'#F3F4F6', '& .MuiLinearProgress-bar':{ background:'#3B82F6', borderRadius:3 } }}/>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                    <Typography variant="caption" fontWeight={600} color={C.stone}>Memory Usage</Typography>
                    <Typography variant="caption" fontWeight={700} color={systemHealth.backend?.memory?.percentage?.includes('85') || systemHealth.backend?.memory?.percentage?.includes('9') ? '#991B1B' : '#15803D'}>
                      {systemHealth.backend?.memory?.percentage}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={parseFloat(systemHealth.backend?.memory?.percentage || 0)}
                    sx={{ height:6, borderRadius:3, background:'#F3F4F6', '& .MuiLinearProgress-bar':{ background: systemHealth.backend?.memory?.percentage?.includes('85') || systemHealth.backend?.memory?.percentage?.includes('9') ? '#EF4444' : '#A855F7', borderRadius:3 } }}/>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                    <Typography variant="caption" fontWeight={600} color={C.stone}>Threads Active</Typography>
                    <Typography variant="caption" fontWeight={700} color={C.forest}>{systemHealth.backend?.threads?.active} / {systemHealth.backend?.threads?.peak}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(systemHealth.backend?.threads?.active / systemHealth.backend?.threads?.peak) * 100}
                    sx={{ height:6, borderRadius:3, background:'#F3F4F6', '& .MuiLinearProgress-bar':{ background:'#10B981', borderRadius:3 } }}/>
                </Box>
              </Grid>
            </Grid>

            {/* Application Uptime */}
            <Box sx={{ p:2, background:'#F0EBE0', borderRadius:'12px', mb:3, border:`1px solid ${C.border}` }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Box>
                  <Typography variant="caption" fontWeight={600} color={C.stone}>Uptime</Typography>
                  <Typography variant="body2" fontWeight={700} color={C.forest}>{systemHealth.application?.uptime?.formatted}</Typography>
                </Box>
                <Box sx={{ textAlign:'right' }}>
                  <Typography variant="caption" fontWeight={600} color={C.stone}>Started</Typography>
                  <Typography variant="caption" color={C.forest}>{systemHealth.application?.startTime?.split('T')[0]}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Critical Alerts */}
            {systemHealth.alerts && systemHealth.alerts.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={700} color={C.stone} sx={{ mb:1.5, display:'block' }}>⚠️ ALERTS & WARNINGS</Typography>
                {systemHealth.alerts.map((alert, idx) => (
                  <Alert key={idx} severity={alert.severity === 'CRITICAL' ? 'error' : alert.severity === 'WARNING' ? 'warning' : 'info'} 
                    sx={{ mb:1, borderRadius:'8px' }}>
                    <strong>{alert.component}:</strong> {alert.message}
                  </Alert>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Main Content */}
        <Box sx={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:`0 2px 12px rgba(27,58,45,0.06)` }}>
          <Box sx={{ px:3, pt:3, display:'flex', alignItems:'center', flexWrap:'wrap', gap:2 }}>
            <Badge badgeContent={pendingCount} color="error">
              <Tabs value={tab} onChange={(_,v)=>setTab(v)}
                sx={{ '& .MuiTab-root':{ fontWeight:600, textTransform:'none', fontSize:'0.9rem' } }}>
                <Tab label="Schools" />
                <Tab label="Users" />
                <Tab label="Orders" />
                <Tab label="School Requests" />
                <Tab label="Communications" />
              </Tabs>
            </Badge>
            <Box sx={{ ml:'auto' }}>
              <TextField size="small" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
                InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon fontSize="small" sx={{color:C.stone}}/></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px', background:C.cream } }}/>
            </Box>
            {tab===0 && (
              <Button variant="contained" startIcon={<AddCircleIcon/>} onClick={()=>openSchoolDialog()} size="small"
                sx={{ background:C.forest, borderRadius:'10px', textTransform:'none', fontWeight:600 }}>
                Add School
              </Button>
            )}
          </Box>

          {/* ── SCHOOLS TAB ── */}
          <TabPanel value={tab} index={0}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['ID','Name','Province','District','Grades','Status','Actions'].map(h=>(
                      <TableCell key={h} sx={{ fontWeight:700, color:C.stone, fontSize:'0.75rem', letterSpacing:'0.04em', textTransform:'uppercase', borderColor:C.border }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSchools.map(s => (
                    <TableRow key={s.id} sx={{ '&:hover':{ background:C.cream }, '& td':{ borderColor:C.border } }}>
                      <TableCell sx={{ fontWeight:600, color:C.forest, fontSize:'0.82rem' }}>#{s.id}</TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:'0.9rem' }}>{s.name}</TableCell>
                      <TableCell>{s.province||'—'}</TableCell>
                      <TableCell>{s.district||'—'}</TableCell>
                      <TableCell sx={{ fontSize:'0.82rem', color:C.stone }}>{s.grades||'—'}</TableCell>
                      <TableCell><STATUS_CHIP status={s.isActive===false?'INACTIVE':'ACTIVE'}/></TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', gap:0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={()=>openSchoolDialog(s)} sx={{ color:C.forest }}>
                              <EditIcon fontSize="small"/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={()=>setDeleteDialog({open:true,type:'school',item:s})} sx={{ color:'#EF4444' }}>
                              <DeleteIcon fontSize="small"/>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredSchools.length===0 && <Typography variant="body2" color={C.stone} sx={{ textAlign:'center', py:4 }}>No schools found</Typography>}
          </TabPanel>

          {/* ── USERS TAB ── */}
          <TabPanel value={tab} index={1}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['ID','Name','Email','Phone','Role','School','Status','Actions'].map(h=>(
                      <TableCell key={h} sx={{ fontWeight:700, color:C.stone, fontSize:'0.75rem', letterSpacing:'0.04em', textTransform:'uppercase', borderColor:C.border }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id} sx={{ '&:hover':{ background:C.cream }, '& td':{ borderColor:C.border } }}>
                      <TableCell sx={{ fontWeight:600, color:C.forest, fontSize:'0.82rem' }}>#{u.id}</TableCell>
                      <TableCell sx={{ fontWeight:700, fontSize:'0.9rem' }}>{u.fullName}</TableCell>
                      <TableCell sx={{ fontSize:'0.85rem' }}>{u.email}</TableCell>
                      <TableCell sx={{ fontSize:'0.85rem', color:C.stone }}>{u.phoneNumber||'—'}</TableCell>
                      <TableCell><STATUS_CHIP status={u.role}/></TableCell>
                      <TableCell sx={{ fontSize:'0.82rem', color:C.stone, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {u.school?.name || (u.schoolId ? `#${u.schoolId}` : '—')}
                      </TableCell>
                      <TableCell>
                        {!u.verified ? (
                          <Tooltip title="Email not verified. User registered but hasn't completed OTP verification. Safe to delete if it's a typo or incomplete registration." arrow>
                            <Box sx={{ display: 'inline-block' }}>
                              <STATUS_CHIP status='UNVERIFIED'/>
                            </Box>
                          </Tooltip>
                        ) : (
                          <STATUS_CHIP status={u.enabled===false ? 'INACTIVE' : 'ACTIVE'}/>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={()=>setDeleteDialog({open:true,type:'user',item:u})} sx={{ color:'#EF4444' }}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredUsers.length===0 && <Typography variant="body2" color={C.stone} sx={{ textAlign:'center', py:4 }}>No users found</Typography>}
          </TabPanel>

          {/* ── ORDERS TAB ── */}
          <TabPanel value={tab} index={2}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['ID','Student','School','Amount','Type','Status','Actions'].map(h=>(
                      <TableCell key={h} sx={{ fontWeight:700, color:C.stone, fontSize:'0.75rem', letterSpacing:'0.04em', textTransform:'uppercase', borderColor:C.border }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map(o => (
                    <TableRow key={o.id} sx={{ '&:hover':{ background:C.cream }, '& td':{ borderColor:C.border } }}>
                      <TableCell sx={{ fontWeight:600, color:C.forest, fontSize:'0.82rem' }}>#{o.id}</TableCell>
                      <TableCell sx={{ fontSize:'0.85rem' }}>{o.studentName||'—'}</TableCell>
                      <TableCell sx={{ fontSize:'0.82rem', color:C.stone, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {o.school?.name || o.requestedSchoolName || '—'}
                      </TableCell>
                      <TableCell sx={{ fontWeight:700 }}>R {(o.totalAmount||0).toFixed(2)}</TableCell>
                      <TableCell><Chip label={o.orderType||'ORDER'} size="small" sx={{ background:'#EFF6FF', color:'#1D4ED8', fontWeight:700, fontSize:'0.72rem', height:22 }}/></TableCell>
                      <TableCell>
                        {o.status === 'PENDING' ? (
                          <Box sx={{ display:'flex', gap:0.5, alignItems:'center' }}>
                            <Chip label="PENDING" size="small" sx={{ background:'#FEF9C3', color:'#854D0E', fontWeight:700, fontSize:'0.72rem', height:22 }}/>
                            <Tooltip title="Approve Order">
                              <IconButton size="small" onClick={()=>approveOrder(o.id)} sx={{ color:'#15803D' }}>
                                <CheckCircleIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Decline Order">
                              <IconButton size="small" onClick={()=>declineOrder(o.id, 'Order declined by admin')} sx={{ color:'#EF4444' }}>
                                <BlockIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : o.status === 'ACKNOWLEDGED' ? (
                          // For ACKNOWLEDGED orders from high-value purchases, show Approve/Decline buttons
                          <Box sx={{ display:'flex', gap:0.5, alignItems:'center' }}>
                            <Chip label="AWAITING APPROVAL" size="small" sx={{ background:'#E0E7FF', color:'#4338CA', fontWeight:700, fontSize:'0.72rem', height:22 }}/>
                            <Tooltip title="Approve for Processing">
                              <IconButton size="small" onClick={()=>approveOrder(o.id)} sx={{ color:'#15803D' }}>
                                <CheckCircleIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Decline Order">
                              <IconButton size="small" onClick={()=>declineOrder(o.id, 'Order declined by admin')} sx={{ color:'#EF4444' }}>
                                <BlockIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <TextField select value={o.status||'PENDING'} size="small"
                            onChange={e=>updateOrderStatus(o.id,e.target.value)}
                            sx={{ minWidth:160, '& .MuiOutlinedInput-root':{ borderRadius:'8px', fontSize:'0.8rem' } }}>
                            {['DISPUTED', 'REFUNDED', 'CANCELLED'].map(s=>(
                              <MenuItem key={s} value={s} sx={{ fontSize:'0.82rem' }}>{s.replace(/_/g, ' ')}</MenuItem>
                            ))}
                          </TextField>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={()=>setDeleteDialog({open:true,type:'order',item:o})} sx={{ color:'#EF4444' }}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredOrders.length===0 && <Typography variant="body2" color={C.stone} sx={{ textAlign:'center', py:4 }}>No orders found</Typography>}
          </TabPanel>

          {/* ── SCHOOL REQUESTS TAB ── */}
          <TabPanel value={tab} index={3}>
            {filteredRequests.length===0 ? (
              <Box sx={{ py:6, textAlign:'center' }}>
                <CheckCircleIcon sx={{ fontSize:64, color:C.stone, opacity:0.3, mb:2 }}/>
                <Typography variant="h6" fontWeight={600} color={C.stone}>No Pending Requests</Typography>
                <Typography variant="body2" color={C.stone} sx={{ mt:0.5 }}>All school onboarding requests have been processed.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['ID','Admin','Email','Phone','Request Type','School','Created','Actions'].map(h=>(
                        <TableCell key={h} sx={{ fontWeight:700, color:C.stone, fontSize:'0.75rem', letterSpacing:'0.04em', textTransform:'uppercase', borderColor:C.border }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.map(r => (
                      <TableRow key={r.id} sx={{ '&:hover':{ background:C.cream }, '& td':{ borderColor:C.border } }}>
                        <TableCell sx={{ fontWeight:600, color:C.forest, fontSize:'0.82rem' }}>#{r.id}</TableCell>
                        <TableCell sx={{ fontWeight:700, fontSize:'0.9rem' }}>{r.admin?.fullName||'—'}</TableCell>
                        <TableCell sx={{ fontSize:'0.85rem' }}>{r.admin?.email||'—'}</TableCell>
                        <TableCell sx={{ fontSize:'0.85rem', color:C.stone }}>{r.admin?.phoneNumber||'—'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={r.requestType==='NEW_SCHOOL' ? 'New School' : 'Link Existing'} 
                            size="small" 
                            sx={{ 
                              background:r.requestType==='NEW_SCHOOL' ? '#DCFCE7' : '#EFF6FF', 
                              color:r.requestType==='NEW_SCHOOL' ? '#15803D' : '#1D4ED8', 
                              fontWeight:700, 
                              fontSize:'0.72rem', 
                              height:22 
                            }}/>
                        </TableCell>
                        <TableCell sx={{ fontSize:'0.85rem', maxWidth:180 }}>
                          {r.requestType==='NEW_SCHOOL' 
                            ? <><strong>{r.schoolName}</strong><br/><Typography variant="caption" color={C.stone}>{r.province}, {r.phoneNumber}</Typography></>
                            : <Typography variant="caption">Link to School #{r.linkedSchoolId}</Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ fontSize:'0.82rem', color:C.stone }}>{formatDate(r.createdAt)}</TableCell>
                        <TableCell>
                          <Box sx={{ display:'flex', gap:0.5 }}>
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={()=>openRequestDialog(r,'approve')} sx={{ color:'#15803D' }}>
                                <CheckCircleIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" onClick={()=>openRequestDialog(r,'reject')} sx={{ color:'#EF4444' }}>
                                <BlockIcon fontSize="small"/>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* ── COMMUNICATIONS TAB ── */}
          <TabPanel value={tab} index={4}>
            <Box sx={{ py:6, textAlign:'center' }}>
              <MessageIcon sx={{ fontSize:64, color:C.forest, mb:2 }}/>  
              <Typography variant="h5" fontWeight={700} color={C.ink} sx={{ mb:1, fontFamily:'"Cormorant Garamond",serif' }}>
                School Communications
              </Typography>
              <Typography variant="body1" color={C.stone} sx={{ mb:3, maxWidth:500, mx:'auto' }}>
                Send announcements, events, reminders, and urgent messages to schools, grades, or individual students.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<MessageIcon/>} 
                onClick={()=>navigate('/school/communications')}
                sx={{ 
                  background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, 
                  borderRadius:'12px', 
                  textTransform:'none', 
                  fontWeight:600,
                  px:4,
                  py:1.5
                }}>
                Open Communications
              </Button>
            </Box>
          </TabPanel>
        </Box>

        {/* School Dialog */}
        <Dialog open={schoolDialog} onClose={()=>setSchoolDialog(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ borderRadius:'20px', border:`1px solid ${C.border}` } }}>
          <DialogTitle sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink }}>
            {editSchool ? 'Edit School' : 'Add New School'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt:1, display:'flex', flexDirection:'column', gap:2 }}>
              <TextField label="School Name" value={schoolForm.name} required onChange={e=>setSchoolForm(p=>({...p,name:e.target.value}))} />
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Province" value={schoolForm.province} fullWidth onChange={e=>setSchoolForm(p=>({...p,province:e.target.value}))} /></Grid>
                <Grid item xs={6}><TextField label="District" value={schoolForm.district} fullWidth onChange={e=>setSchoolForm(p=>({...p,district:e.target.value}))} /></Grid>
              </Grid>
              <TextField label="Grades (comma-separated)" value={schoolForm.grades} placeholder="e.g. 1,2,3,4,5,6,7" onChange={e=>setSchoolForm(p=>({...p,grades:e.target.value}))} helperText="Enter the grades this school offers" />
              <TextField label="Contact Email" type="email" value={schoolForm.contactEmail} onChange={e=>setSchoolForm(p=>({...p,contactEmail:e.target.value}))} />
              <TextField label="Contact Phone" value={schoolForm.contactPhone} onChange={e=>setSchoolForm(p=>({...p,contactPhone:e.target.value}))} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3, gap:1 }}>
            <Button onClick={()=>setSchoolDialog(false)} sx={{ color:C.stone }}>Cancel</Button>
            <Button onClick={saveSchool} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Request Review Dialog */}
        <Dialog open={requestDialog.open} onClose={()=>setRequestDialog({open:false,request:null,action:''})} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ borderRadius:'20px', border:`1px solid ${C.border}` } }}>
          <DialogTitle sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink }}>
            {requestDialog.action==='approve' ? 'Approve School Request' : 'Reject School Request'}
          </DialogTitle>
          <DialogContent>
            {requestDialog.request && (
              <Box sx={{ pt:1 }}>
                <Typography variant="body2" sx={{ mb:2 }}>
                  <strong>Admin:</strong> {requestDialog.request.admin?.fullName} ({requestDialog.request.admin?.email})
                </Typography>
                <Typography variant="body2" sx={{ mb:2 }}>
                  <strong>Type:</strong> {requestDialog.request.requestType==='NEW_SCHOOL' ? 'Create New School' : 'Link to Existing School'}
                </Typography>
                {requestDialog.request.requestType==='NEW_SCHOOL' ? (
                  <>
                    <Typography variant="body2"><strong>School Name:</strong> {requestDialog.request.schoolName}</Typography>
                    <Typography variant="body2"><strong>Province:</strong> {requestDialog.request.province}</Typography>
                    <Typography variant="body2" sx={{ mb:2 }}><strong>Phone:</strong> {requestDialog.request.phoneNumber}</Typography>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ mb:2 }}>
                    <strong>School ID:</strong> #{requestDialog.request.linkedSchoolId}
                  </Typography>
                )}
                <Divider sx={{ my:2 }}/>
                <TextField 
                  label={requestDialog.action==='approve' ? 'Notes (optional)' : 'Rejection Reason'} 
                  multiline 
                  rows={3} 
                  fullWidth 
                  value={requestNotes} 
                  onChange={e=>setRequestNotes(e.target.value)}
                  placeholder={requestDialog.action==='approve' ? 'Add any notes for your records...' : 'Provide a reason for rejection...'}
                  required={requestDialog.action==='reject'}
                />
                {requestDialog.action==='approve' && (
                  <Alert severity="success" sx={{ mt:2, borderRadius:'10px' }}>
                    Admin {requestDialog.request.admin?.fullName} will be linked to the school and can start managing it.
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3, gap:1 }}>
            <Button onClick={()=>setRequestDialog({open:false,request:null,action:''})} sx={{ color:C.stone }}>Cancel</Button>
            <Button 
              onClick={handleRequestAction} 
              variant="contained" 
              color={requestDialog.action==='approve' ? 'success' : 'error'}
              disabled={requestDialog.action==='reject' && !requestNotes.trim()}
            >
              {requestDialog.action==='approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={deleteDialog.open} onClose={()=>setDeleteDialog({open:false,type:'',item:null})}
          PaperProps={{ sx:{ borderRadius:'20px', border:`1px solid ${C.border}` } }}>
          <DialogTitle sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink }}>
            Delete {deleteDialog.type}?
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteDialog.item?.name || deleteDialog.item?.fullName || `#${deleteDialog.item?.id}`}</strong>?
            </Typography>
            <Alert severity="error" sx={{ mt:2, borderRadius:'10px' }}>This action is permanent and cannot be undone.</Alert>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:3, gap:1 }}>
            <Button onClick={()=>setDeleteDialog({open:false,type:'',item:null})} sx={{ color:C.stone }}>Cancel</Button>
            <Button onClick={deleteItem} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
