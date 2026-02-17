import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Chip, CircularProgress,
  Alert, Button, Grid, Divider, Collapse, IconButton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolIcon from '@mui/icons-material/School';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateHelpers';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const STATUS_STYLES = {
  PENDING:               { bg:'#FEF9C3', color:'#854D0E', label:'Pending Payment' },
  APPROVED:             { bg:'#DCFCE7', color:'#15803D', label:'Payment Received' },
  ACKNOWLEDGED:         { bg:'#E0E7FF', color:'#4338CA', label:'Acknowledged' },
  IN_PROCESS:           { bg:'#DBEAFE', color:'#1D4ED8', label:'Processing' },
  FINALIZING:           { bg:'#F3E8FF', color:'#7C3AED', label:'Finalizing' },
  OUT_FOR_DELIVERY:     { bg:'#FED7AA', color:'#B45309', label:'Out for Delivery' },
  DELIVERED:            { bg:'#DCFCE7', color:'#15803D', label:'Delivered' },
  CLOSED:               { bg:'#E5E7EB', color:'#374151', label:'Closed' },
  DECLINED:             { bg:'#FEE2E2', color:'#991B1B', label:'Declined' },
  CANCELLED:            { bg:'#FEE2E2', color:'#991B1B', label:'Cancelled' },
  RETURNED:             { bg:'#FEE2E2', color:'#991B1B', label:'Returned (Payment Failed)' },
};

const STEPS = ['APPROVED','ACKNOWLEDGED','IN_PROCESS','FINALIZING','OUT_FOR_DELIVERY','DELIVERED','CLOSED'];

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => { 
    fetchOrders(); 
    // Poll for order updates every 3 seconds to show live status changes from Purchase Admin
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.ORDERS.LIST, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.data.success) setOrders(res.data.orders || []);
    } catch (e) { setError(e.response?.data?.message || 'Failed to load orders'); }
    finally { setLoading(false); }
  };

  const toggle = (id) => setExpanded(p => ({ ...p, [id]:!p[id] }));

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', pb:10 }}>
      {/* Header */}
      <Box sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, py:{xs:6,md:9}, mb:5 }}>
        <Container maxWidth="lg">
          <Chip label="✦ ORDER HISTORY" sx={{ background:'rgba(200,164,92,0.2)', color:C.gold, fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.06em', mb:2, border:`1px solid rgba(200,164,92,0.3)` }} />
          <Typography variant="h2" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff', fontSize:{xs:'2.4rem',md:'3.6rem'} }}>
            My Orders
          </Typography>
          <Typography sx={{ color:'rgba(255,255,255,0.65)', mt:1 }}>
            {orders.length} {orders.length===1?'order':'orders'} placed
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Box sx={{ textAlign:'center', py:12 }}>
            <ShoppingCartIcon sx={{ fontSize:80, color:C.border, mb:3 }} />
            <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', color:C.stone, mb:2 }}>No orders yet</Typography>
            <Typography variant="body1" color={C.stone} mb={4}>Browse our catalog and place your first order.</Typography>
            <Button variant="contained" component={Link} to="/stationery" size="large"
              sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
              Browse Catalog
            </Button>
          </Box>
        ) : (
          <Box sx={{ display:'flex', flexDirection:'column', gap:2.5 }}>
            {orders.map(order => {
              const st = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
              const isOpen = expanded[order.id];
              const stepIdx = STEPS.indexOf(order.status);

              return (
                <Card key={order.id} elevation={0} sx={{
                  borderRadius:'20px', border:`1px solid ${C.border}`,
                  boxShadow:`0 2px 10px rgba(27,58,45,0.06)`,
                  overflow:'hidden',
                }}>
                  {/* Status bar */}
                  <Box sx={{ height:4, background:`linear-gradient(90deg, ${C.forest} 0%, ${C.forestMid} ${Math.max(((stepIdx+1)/STEPS.length)*100,10)}%, ${C.border} ${Math.max(((stepIdx+1)/STEPS.length)*100,10)}% 100%)` }} />
                  <CardContent sx={{ p:3 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:2 }}>
                      <Box>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1 }}>
                          <Typography fontWeight={700} color={C.forest} sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'1.15rem' }}>
                            Order #{order.id}
                          </Typography>
                          <Chip label={st.label} size="small"
                            sx={{ background:st.bg, color:st.color, fontWeight:700, fontSize:'0.72rem', height:22 }} />
                          {order.orderType==='DONATION' && (
                            <Chip label="Donation" size="small"
                              sx={{ background:'#EDE9FE', color:'#6D28D9', fontWeight:700, fontSize:'0.72rem', height:22 }} />
                          )}
                        </Box>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1, flexWrap:'wrap' }}>
                          <SchoolIcon sx={{ fontSize:15, color:C.stone }} />
                          <Typography variant="body2" color={C.stone}>
                            {order.school?.name || order.requestedSchoolName || '—'}
                            {order.studentName ? ` · ${order.studentName}` : ''}
                            {order.studentGrade ? ` · Gr ${order.studentGrade}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign:'right' }}>
                        <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.5rem', color:C.ink }}>
                          R {(order.totalAmount||0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color={C.stone}>{formatDate(order.createdAt)}</Typography>
                      </Box>
                    </Box>

                    {/* Progress steps */}
                    {order.orderType !== 'DONATION' && order.status !== 'CANCELLED' && (
                      <Box sx={{ mt:2.5, display:'flex', alignItems:'center', gap:0 }}>
                        {STEPS.map((step, i) => (
                          <React.Fragment key={step}>
                            <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                              <Box sx={{
                                width:28, height:28, borderRadius:'50%',
                                background: i<=stepIdx ? C.forest : C.border,
                                border: i===stepIdx ? `3px solid ${C.gold}` : 'none',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                transition:'all 0.3s',
                              }}>
                                {i<=stepIdx && <Box sx={{ width:10, height:10, borderRadius:'50%', background:'#fff' }}/>}
                              </Box>
                              <Typography variant="caption" sx={{ mt:0.5, color:i<=stepIdx?C.forest:C.stone, fontWeight:i===stepIdx?700:400, fontSize:'0.68rem', textAlign:'center' }}>
                                {step.charAt(0)+step.slice(1).toLowerCase()}
                              </Typography>
                            </Box>
                            {i<STEPS.length-1 && (
                              <Box sx={{ flex:2, height:2, background:i<stepIdx?C.forest:C.border, mb:2.5, transition:'all 0.3s' }} />
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    )}

                    {/* Toggle items */}
                    {order.orderItems && order.orderItems.length > 0 && (
                      <>
                        <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mt:2, cursor:'pointer', width:'fit-content' }}
                          onClick={()=>toggle(order.id)}>
                          <Typography variant="caption" sx={{ color:C.forestMid, fontWeight:600, letterSpacing:'0.04em' }}>
                            {isOpen ? 'HIDE' : 'VIEW'} {order.orderItems.length} {order.orderItems.length===1?'ITEM':'ITEMS'}
                          </Typography>
                          {isOpen ? <ExpandLessIcon sx={{fontSize:16,color:C.forestMid}}/> : <ExpandMoreIcon sx={{fontSize:16,color:C.forestMid}}/>}
                        </Box>
                        <Collapse in={isOpen}>
                          <Box sx={{ mt:2, p:2.5, background:C.parchment, borderRadius:'12px' }}>
                            {order.orderItems.map((item, i) => (
                              <Box key={i} sx={{ display:'flex', justifyContent:'space-between', py:1,
                                borderBottom:i<order.orderItems.length-1?`1px solid ${C.border}`:'none' }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={600} color={C.ink}>{item.stationeryName||item.name||`Item #${i+1}`}</Typography>
                                  <Typography variant="caption" color={C.stone}>Qty: {item.quantity||1}</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={700} color={C.forest}>
                                  R {((item.price||0)*(item.quantity||1)).toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
