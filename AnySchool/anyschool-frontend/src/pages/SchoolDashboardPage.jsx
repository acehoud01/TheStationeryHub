import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Avatar, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MessageIcon from '@mui/icons-material/Message';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { formatCurrency } from '../utils/safeAccess';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

const C = {
  forest: '#1B3A2D', forestMid: '#2D5C47', gold: '#C8A45C',
  goldPale: '#F5EDD8', cream: '#FAF7F2', parchment: '#F0EBE0',
  border: '#E5DED4', ink: '#1C1814', stone: '#8C8070',
};

const StatCard = ({ icon, label, value, sub, gradient }) => (
  <Card elevation={0} sx={{ borderRadius: '18px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,0.07)' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color: C.stone, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.72rem' }}>{label}</Typography>
          <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mt: 0.5 }}>{value}</Typography>
          {sub && <Typography variant="caption" sx={{ color: C.stone }}>{sub}</Typography>}
        </Box>
        <Avatar sx={{ background: gradient || `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, width: 48, height: 48, borderRadius: '14px' }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const ActionCard = ({ icon, title, description, to }) => (
  <Card elevation={0} sx={{ borderRadius: '18px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(27,58,45,0.06)', height: '100%' }}>
    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Avatar sx={{ width: 44, height: 44, background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, borderRadius: '12px' }}>
        {icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: C.stone, lineHeight: 1.6 }}>{description}</Typography>
      </Box>
      <Button component={Link} to={to} variant="outlined" sx={{ borderColor: C.border, color: C.ink, fontWeight: 600 }}>
        Open
      </Button>
    </CardContent>
  </Card>
);

export default function SchoolDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // Events state
  const [events, setEvents] = useState([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    description: '',
    allDay: false,
  });

  useEffect(() => {
    if (!user) return;
    if (user?.role !== 'SCHOOL_ADMIN') {
      navigate('/');
      return;
    }
    if (!user?.schoolId) {
      navigate('/school/onboarding');
      return;
    }
    fetchDashboard();
    // Poll for order updates every 3 seconds
    const interval = setInterval(fetchDashboard, 3000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [schoolRes, statsRes, eventsRes, ordersRes] = await Promise.all([
        axios.get(API_ENDPOINTS.SCHOOLS.BY_ID(user.schoolId)),
        axios.get(API_ENDPOINTS.SCHOOLS.STATS(user.schoolId), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.SCHOOL_EVENTS.BASE}/school/${user.schoolId}/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // Use the school-specific orders endpoint
        axios.get(`${API_BASE_URL}/api/orders/school/${user.schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (schoolRes.data?.success) setSchool(schoolRes.data.school || null);
      if (statsRes.data?.success) setStats(statsRes.data.stats || null);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (ordersRes.data?.success) {
        // Orders are already filtered for this school by the backend
        setOrders(ordersRes.data.orders || []);
      } else {
        setOrders([]);
        console.log('Orders response:', ordersRes.data);
      }
    } catch (e) {
      console.error('Failed to load school dashboard:', e.response?.data?.message || e.message);
      setError(e.response?.data?.message || 'Failed to load school dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenEventDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        eventName: event.eventName,
        eventDate: event.eventDate.split('T')[0],
        eventTime: event.eventTime || '',
        description: event.description || '',
        allDay: event.allDay,
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        eventName: '',
        eventDate: '',
        eventTime: '',
        description: '',
        allDay: false,
      });
    }
    setEventDialogOpen(true);
  };
  
  const handleCloseEventDialog = () => {
    setEventDialogOpen(false);
    setEditingEvent(null);
  };
  
  const handleSaveEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const eventData = {
        ...eventForm,
        schoolId: user.schoolId,
        eventDate: new Date(eventForm.eventDate + 'T00:00:00').toISOString(),
      };
      
      if (editingEvent) {
        await axios.put(
          `${API_ENDPOINTS.SCHOOL_EVENTS.BASE}/${editingEvent.id}`,
          eventData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          API_ENDPOINTS.SCHOOL_EVENTS.BASE,
          eventData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      handleCloseEventDialog();
      fetchDashboard();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save event');
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_ENDPOINTS.SCHOOL_EVENTS.BASE}/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboard();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete event');
    }
  };
  
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: C.cream, minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Box sx={{
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 60%, #3D7A60 100%)`,
          borderRadius: '24px', p: { xs: 3, md: 5 }, mb: 5, position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(200,164,92,0.2)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
              School Dashboard
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: '#fff', mt: 0.25 }}>
              {school?.name || 'Your School'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, maxWidth: 520 }}>
              Track orders, manage communications, and view your school performance.
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
            <Button onClick={fetchDashboard} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Total Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              sub="all time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<LocalAtmIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Purchase Revenue"
              value={formatCurrency(stats?.purchaseRevenue || 0)}
              sub={`${stats?.totalPurchases ?? 0} orders`}
              gradient="linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<VolunteerActivismIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Donation Revenue"
              value={formatCurrency(stats?.donationRevenue || 0)}
              sub={`${stats?.totalDonations ?? 0} donations`}
              gradient="linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AutoStoriesIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Unique Donors"
              value={stats?.uniqueDonors ?? 0}
              sub="supporters"
              gradient="linear-gradient(135deg, #B45309 0%, #F59E0B 100%)"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={<AutoStoriesIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Total Orders"
              value={stats?.totalOrders ?? 0}
              sub="purchases + donations"
              gradient="linear-gradient(135deg, #059669 0%, #10B981 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={<SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Pending Orders"
              value={stats?.pendingOrders ?? 0}
              sub="awaiting action"
              gradient="linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={<SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />}
              label="Completed Orders"
              value={stats?.completedOrders ?? 0}
              sub="delivered"
              gradient="linear-gradient(135deg, #16A34A 0%, #22C55E 100%)"
            />
          </Grid>
        </Grid>

        {/* Upcoming Events Section */}
        <Card elevation={0} sx={{ borderRadius: '18px', border: `1px solid ${C.border}`, mb: 5, overflow: 'hidden' }}>
          <Box sx={{ 
            background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            p: 3, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ background: 'rgba(255,255,255,0.15)', width: 48, height: 48, borderRadius: '14px' }}>
                <EventIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: '#fff' }}>
                  Upcoming Events
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Manage school events and keep families informed
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenEventDialog()}
              variant="contained"
              sx={{
                background: '#fff',
                color: C.forest,
                fontWeight: 600,
                '&:hover': { background: 'rgba(255,255,255,0.9)' }
              }}
            >
              Add Event
            </Button>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            {events.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 64, color: C.border, mb: 2 }} />
                <Typography variant="h6" sx={{ color: C.stone, mb: 1 }}>
                  No upcoming events
                </Typography>
                <Typography variant="body2" sx={{ color: C.stone, mb: 3 }}>
                  Add your first event to keep families informed
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenEventDialog()}
                  variant="outlined"
                  sx={{ borderColor: C.border, color: C.ink }}
                >
                  Create Event
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: C.parchment }}>
                      <TableCell sx={{ fontWeight: 700, color: C.ink }}>Event Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.ink }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.ink }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: C.ink }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: C.ink }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow 
                        key={event.id}
                        sx={{ 
                          '&:hover': { background: C.goldPale },
                          '&:last-child td': { border: 0 }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: C.ink }}>
                            {event.eventName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: C.stone }}>
                            {formatEventDate(event.eventDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {event.allDay ? (
                            <Chip label="All Day" size="small" sx={{ background: C.goldPale, color: C.ink, fontWeight: 600 }} />
                          ) : (
                            <Typography variant="body2" sx={{ color: C.stone }}>
                              {event.eventTime}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: C.stone, maxWidth: 300 }}>
                            {event.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEventDialog(event)}
                            sx={{ color: C.forest, mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEvent(event.id)}
                            sx={{ color: '#DC2626' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

{/* Tabbed Section for Order, Catalog, and Communications */}
        <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, boxShadow: `0 2px 12px rgba(27,58,45,0.06)`, overflow: 'hidden', mb: 5 }}>
          <Box sx={{ borderBottom: `1px solid ${C.border}`, background: C.goldPale }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newVal) => setActiveTab(newVal)}
              sx={{ 
                '& .MuiTab-root': { 
                  fontWeight: 600, 
                  color: C.stone,
                  '&.Mui-selected': { color: C.forest }
                },
                '& .MuiTabs-indicator': { background: C.forest }
              }}
            >
              <Tab label="📚 Stationery Catalog" />
              <Tab label="📦 Student Orders" />
              <Tab label="💬 Communications" />
            </Tabs>
          </Box>

          {/* Tab 0: Stationery Catalog */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" color={C.stone} mb={3}>
                Review items and bundles available to families.
              </Typography>
              <Button component={Link} to="/stationery" variant="contained" size="large"
                sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
                Open Stationery Catalog
              </Button>
            </Box>
          )}

          {/* Tab 1: Student Orders */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <LocalAtmIcon sx={{ color: C.forest, fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700} color={C.ink}>Student Orders</Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Chip label={`${orders.length} orders`} size="small" sx={{ background: C.goldPale, color: C.forest, fontWeight: 700 }} />
                </Box>
              </Box>
              {orders.length === 0 ? (
                <Typography variant="body2" color={C.stone} sx={{ textAlign: 'center', py: 4 }}>No orders yet for your school</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: C.goldPale }}>
                        <TableCell sx={{ fontWeight: 700, color: C.forest }}>Order #</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.forest }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.forest }}>Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: C.forest }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.forest }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.forest }}>Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((o) => {
                        const statusColors = {
                          PENDING: { bg: '#FEF9C3', color: '#854D0E' },
                          APPROVED: { bg: '#DCFCE7', color: '#15803D' },
                          ACKNOWLEDGED: { bg: '#E0E7FF', color: '#4338CA' },
                          IN_PROCESS: { bg: '#DBEAFE', color: '#1D4ED8' },
                          FINALIZING: { bg: '#F3E8FF', color: '#7C3AED' },
                          OUT_FOR_DELIVERY: { bg: '#FED7AA', color: '#B45309' },
                          DELIVERED: { bg: '#DCFCE7', color: '#15803D' },
                          CLOSED: { bg: '#E5E7EB', color: '#374151' },
                          DECLINED: { bg: '#FEE2E2', color: '#991B1B' },
                          CANCELLED: { bg: '#FEE2E2', color: '#991B1B' },
                          RETURNED: { bg: '#FEE2E2', color: '#991B1B' },
                        };
                        const sc = statusColors[o.status] || { bg: '#F3F4F6', color: '#6B7280' };
                        return (
                          <TableRow key={o.id} sx={{ '&:hover': { background: C.goldPale } }}>
                            <TableCell sx={{ fontWeight: 700, color: C.forest }}>#{o.id}</TableCell>
                            <TableCell>{o.studentName || '—'}</TableCell>
                            <TableCell><Chip label={o.orderType || 'ORDER'} size="small" sx={{ background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.72rem' }} /></TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>R {(o.totalAmount || 0).toFixed(2)}</TableCell>
                            <TableCell><Chip label={o.status || 'UNKNOWN'} size="small" sx={{ background: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.72rem' }} /></TableCell>
                            <TableCell sx={{ fontSize: '0.85rem', color: C.stone }}>
                              {o.updatedAt ? new Date(o.updatedAt).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 
                               o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Tab 2: Communications */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" color={C.stone} mb={3}>
                Send announcements and updates to parents.
              </Typography>
              <Button component={Link} to="/school/communications" variant="contained" size="large"
                sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
                Open Communications
              </Button>
            </Box>
          )}
        </Box>
      </Container>
      
      {/* Event Dialog */}
      <Dialog 
        open={eventDialogOpen} 
        onClose={handleCloseEventDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '18px', border: `1px solid ${C.border}` }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Cormorant Garamond",serif', 
          fontWeight: 700, 
          color: C.ink,
          borderBottom: `1px solid ${C.border}`,
          background: C.goldPale
        }}>
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Event Name"
            value={eventForm.eventName}
            onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
            margin="normal"
            required
            placeholder="e.g., Sport Day, SGB Meeting"
          />
          <TextField
            fullWidth
            label="Event Date"
            type="date"
            value={eventForm.eventDate}
            onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <TextField
              fullWidth
              label="Event Time"
              value={eventForm.eventTime}
              onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
              placeholder="e.g., 10:00, 15:00"
              disabled={eventForm.allDay}
            />
            <Button
              variant={eventForm.allDay ? 'contained' : 'outlined'}
              onClick={() => setEventForm({ ...eventForm, allDay: !eventForm.allDay, eventTime: eventForm.allDay ? eventForm.eventTime : 'All Day' })}
              sx={{ 
                minWidth: 120,
                borderColor: C.border,
                color: eventForm.allDay ? '#fff' : C.ink,
                background: eventForm.allDay ? C.forest : 'transparent'
              }}
            >
              All Day
            </Button>
          </Box>
          <TextField
            fullWidth
            label="Description (Optional)"
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            placeholder="Add event details..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${C.border}` }}>
          <Button onClick={handleCloseEventDialog} sx={{ color: C.stone }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            disabled={!eventForm.eventName || !eventForm.eventDate}
            sx={{
              background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
              color: '#fff',
              fontWeight: 600,
              px: 3
            }}
          >
            {editingEvent ? 'Update' : 'Create'} Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
