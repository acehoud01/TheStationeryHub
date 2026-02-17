import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Avatar, CircularProgress } from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MessageIcon from '@mui/icons-material/Message';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const C = {
  forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8',
  cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070',
};

const ActionCard = ({ icon, title, description, to }) => (
  <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}`, boxShadow:'0 2px 12px rgba(27,58,45,0.06)', height:'100%' }}>
    <CardContent sx={{ p:3, display:'flex', flexDirection:'column', gap:2, height:'100%' }}>
      <Avatar sx={{ width:44, height:44, background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, borderRadius:'12px' }}>
        {icon}
      </Avatar>
      <Box sx={{ flex:1 }}>
        <Typography variant="h6" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mb:0.5 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color:C.stone, lineHeight:1.6 }}>{description}</Typography>
      </Box>
      <Button component={Link} to={to} variant="outlined" sx={{ borderColor:C.border, color:C.ink, fontWeight:600 }}>
        Open
      </Button>
    </CardContent>
  </Card>
);

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Parent';
  
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  useEffect(() => {
    if (user?.schoolId) {
      fetchUpcomingEvents();
    }
  }, [user?.schoolId]);
  
  const fetchUpcomingEvents = async () => {
    setLoadingEvents(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_ENDPOINTS.SCHOOL_EVENTS.BASE}/school/${user.schoolId}/upcoming`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response.data.slice(0, 5)); // Show only first 5 upcoming events
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };
  
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', py:5 }}>
      <Container maxWidth="lg">
        <Box sx={{
          background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 60%, #3D7A60 100%)`,
          borderRadius:'24px', p:{xs:3,md:5}, mb:5, position:'relative', overflow:'hidden',
        }}>
          <Box sx={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', border:'1px solid rgba(200,164,92,0.2)' }} />
          <Box sx={{ position:'relative', zIndex:1 }}>
            <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', fontSize:'0.72rem' }}>
              Parent Dashboard
            </Typography>
            <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff', mt:0.25 }}>
              Welcome back, {firstName}
            </Typography>
            <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.7)', mt:0.5, maxWidth:520 }}>
              Manage your children, track orders, and keep up with school communications.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              icon={<ChildCareIcon sx={{ color:'#fff', fontSize:22 }} />}
              title="My Children"
              description="Add or update child profiles and link to schools."
              to="/children"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              icon={<AutoStoriesIcon sx={{ color:'#fff', fontSize:22 }} />}
              title="Stationery Catalog"
              description="Browse items and build your child's list."
              to="/stationery"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              icon={<ShoppingCartIcon sx={{ color:'#fff', fontSize:22 }} />}
              title="Order History"
              description="Track past orders and payment status."
              to="/orders"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              icon={<MessageIcon sx={{ color:'#fff', fontSize:22 }} />}
              title="Communications"
              description="Read school updates and announcements."
              to="/communications"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ActionCard
              icon={<SchoolIcon sx={{ color:'#fff', fontSize:22 }} />}
              title="Browse Schools"
              description="Explore schools and learn more about them."
              to="/schools"
            />
          </Grid>
        </Grid>
        
        {/* Upcoming Events Section */}
        {user?.schoolId && (
          <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}`, mt:5, overflow:'hidden' }}>
            <Box sx={{ 
              background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
              p:3, 
              display:'flex', 
              alignItems:'center',
              gap:2
            }}>
              <Avatar sx={{ background:'rgba(255,255,255,0.15)', width:48, height:48, borderRadius:'14px' }}>
                <EventIcon sx={{ color:'#fff', fontSize:24 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff' }}>
                  Upcoming Events
                </Typography>
                <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.7)' }}>
                  Stay informed about school events and activities
                </Typography>
              </Box>
            </Box>
            
            <CardContent sx={{ p:3 }}>
              {loadingEvents ? (
                <Box sx={{ display:'flex', justifyContent:'center', py:3 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : events.length === 0 ? (
                <Box sx={{ textAlign:'center', py:4 }}>
                  <EventIcon sx={{ fontSize:48, color:C.border, mb:1 }} />
                  <Typography variant="body2" sx={{ color:C.stone }}>
                    No upcoming events at this time
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {events.map((event) => (
                    <Box 
                      key={event.id}
                      sx={{ 
                        display:'flex', 
                        justifyContent:'space-between',
                        alignItems:'center',
                        p:2,
                        borderRadius:'12px',
                        border:`1px solid ${C.border}`,
                        background:C.goldPale,
                        '&:hover': { background:C.parchment }
                      }}
                    >
                      <Box sx={{ flex:1 }}>
                        <Typography variant="body1" sx={{ fontWeight:700, color:C.ink }}>
                          {event.eventName}
                        </Typography>
                        {event.description && (
                          <Typography variant="body2" sx={{ color:C.stone, mt:0.5 }}>
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ textAlign:'right', ml:2 }}>
                        <Typography variant="body2" sx={{ fontWeight:600, color:C.forest }}>
                          {formatEventDate(event.eventDate)}
                        </Typography>
                        <Typography variant="caption" sx={{ color:C.stone }}>
                          {event.allDay ? 'All Day' : event.eventTime}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
