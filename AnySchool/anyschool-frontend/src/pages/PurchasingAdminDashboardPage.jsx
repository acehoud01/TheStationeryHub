import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Avatar, Chip,
  CircularProgress, Alert, Button, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Badge,
  Paper, Tooltip, InputAdornment,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UndoIcon from '@mui/icons-material/Undo';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateHelpers';
import NewOrderAlert from '../components/NewOrderAlert';

const C = { 
  forest:'#1B3A2D', 
  forestMid:'#2D5C47', 
  gold:'#C8A45C', 
  goldPale:'#F5EDD8', 
  cream:'#FAF7F2', 
  parchment:'#F0EBE0', 
  border:'#E5DED4', 
  ink:'#1C1814', 
  stone:'#8C8070' 
};

const StatCard = ({ icon, label, value, sub, gradient, onClick }) => (
  <Card 
    elevation={0} 
    sx={{ 
      borderRadius:'18px', 
      border:`1px solid ${C.border}`, 
      boxShadow:`0 2px 12px rgba(27,58,45,0.07)`, 
      overflow:'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-2px)' } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p:3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color:C.stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', fontSize:'0.72rem' }}>{label}</Typography>
          <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mt:0.5 }}>{value}</Typography>
          {sub && <Typography variant="caption" color={C.stone}>{sub}</Typography>}
        </Box>
        <Avatar sx={{ background:gradient, width:48, height:48, borderRadius:'14px' }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const TabPanel = ({ children, value, index }) =>
  value === index ? <Box sx={{ pt:3 }}>{children}</Box> : null;

const STATUS_CHIP = ({ status }) => {
  const map = {
    PENDING:              { bg:'#FEF9C3', color:'#854D0E', label:'Awaiting Payment' },
    APPROVED:             { bg:'#FED7AA', color:'#92400E', label:'Order Sent' },
    ACKNOWLEDGED:         { bg:'#DBEAFE', color:'#1E40AF', label:'Order Acknowledged' },
    IN_PROCESS:           { bg:'#E0E7FF', color:'#4338CA', label:'Order in Process' },
    FINALIZING:           { bg:'#DDD6FE', color:'#5B21B6', label:'Finalizing Order' },
    OUT_FOR_DELIVERY:     { bg:'#FED7AA', color:'#92400E', label:'Out for Delivery' },
    DELIVERED:            { bg:'#BBF7D0', color:'#15803D', label:'Order Delivered' },
    CLOSED:               { bg:'#DCFCE7', color:'#15803D', label:'Closed' },
    DECLINED:             { bg:'#FEE2E2', color:'#991B1B', label:'Declined' },
    CANCELLED:            { bg:'#FEE2E2', color:'#991B1B', label:'Cancelled' },
    RETURNED:             { bg:'#FEE2E2', color:'#991B1B', label:'Returned (Payment Failed)' },
    // Legacy statuses (backward compatibility)
    PURCHASE_IN_PROGRESS: { bg:'#DBEAFE', color:'#1E40AF', label:'Purchasing' },
    PACKAGED:             { bg:'#E0E7FF', color:'#4338CA', label:'Packaged' },
    COMPLETED:            { bg:'#DCFCE7', color:'#15803D', label:'Completed' },
  };
  const s = map[status] || { bg:'#F3F4F6', color:'#374151', label:status };
  return <Chip label={s.label} size="small" sx={{ background:s.bg, color:s.color, fontWeight:700, fontSize:'0.72rem', height:22 }} />;
};

export default function PurchasingAdminDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(true);

  // Order detail dialog
  const [detailDialog, setDetailDialog] = useState({ open:false, order:null });
  
  // Status update dialog
  const [statusDialog, setStatusDialog] = useState({ open:false, order:null, status:'' });
  const [statusNotes, setStatusNotes] = useState('');

  // Delivery notes dialog
  const [deliveryDialog, setDeliveryDialog] = useState({ open:false, order:null });
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Submit for approval dialog
  const [approvalDialog, setApprovalDialog] = useState({ open:false, order:null });
  const [approvalNotes, setApprovalNotes] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization:`Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, statsRes] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.PURCHASING.ORDERS, { headers }),
        axios.get(API_ENDPOINTS.PURCHASING.ORDER_STATS, { headers }),
      ]);
      
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.orders || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
      }
    } catch (e) {
      setError('Failed to load purchasing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openDetailDialog = async (orderId) => {
    try {
      const res = await axios.get(API_ENDPOINTS.PURCHASING.ORDER_BY_ID(orderId), { headers });
      if (res.data.success) {
        setDetailDialog({ open:true, order:res.data.order });
      }
    } catch (e) {
      setError('Failed to load order details');
    }
  };

  const openStatusDialog = (order, status) => {
    setStatusDialog({ open:true, order, status });
    setStatusNotes('');
  };

  const updateOrderStatus = async () => {
    const { order, status } = statusDialog;
    setError(''); setSuccess('');
    try {
      await axios.put(
        API_ENDPOINTS.PURCHASING.UPDATE_STATUS(order.id),
        { status, notes: statusNotes },
        { headers }
      );
      setSuccess(`Order #${order.id} status updated to ${status}`);
      setStatusDialog({ open:false, order:null, status:'' });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status');
    }
  };

  const openDeliveryDialog = (order) => {
    setDeliveryDialog({ open:true, order });
    setDeliveryNotes('');
  };

  const submitDeliveryNotes = async () => {
    const { order } = deliveryDialog;
    setError(''); setSuccess('');
    try {
      await axios.put(
        API_ENDPOINTS.PURCHASING.DELIVERY_NOTES(order.id),
        { notes: deliveryNotes },
        { headers }
      );
      setSuccess(`Delivery notes recorded for order #${order.id}`);
      setDeliveryDialog({ open:false, order:null });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save delivery notes');
    }
  };

  const openApprovalDialog = (order) => {
    setApprovalDialog({ open:true, order });
    setApprovalNotes('');
  };

  const submitForApproval = async () => {
    const { order } = approvalDialog;
    setError(''); setSuccess('');
    try {
      await axios.put(
        API_ENDPOINTS.PURCHASING.SUBMIT_FOR_APPROVAL(order.id),
        { notes: approvalNotes },
        { headers }
      );
      setSuccess(`Order #${order.id} submitted to Super Admin for approval`);
      setApprovalDialog({ open:false, order:null });
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit for approval');
    }
  };

  // New workflow actions
  const acknowledgeOrder = async (orderId) => {
    setError(''); setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.PURCHASING.ACKNOWLEDGE(orderId), {}, { headers });
      setSuccess(`Order #${orderId} acknowledged successfully`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to acknowledge order');
    }
  };

  const startProcessing = async (orderId) => {
    setError(''); setSuccess('');
    try {
      const res = await axios.post(API_ENDPOINTS.PURCHASING.START_PROCESSING(orderId), {}, { headers });
      setSuccess(res.data.message || `Order #${orderId} processing started`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to start processing');
    }
  };

  const verifyPayment = async (orderId) => {
    setError(''); setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.PURCHASING.VERIFY_PAYMENT(orderId), {}, { headers });
      setSuccess(`Payment verified for order #${orderId}`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to verify payment');
    }
  };

  const sendForDelivery = async (orderId) => {
    setError(''); setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.PURCHASING.SEND_FOR_DELIVERY(orderId), {}, { headers });
      setSuccess(`Order #${orderId} sent for delivery`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send for delivery');
    }
  };

  const markDelivered = async (orderId) => {
    setError(''); setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.PURCHASING.MARK_DELIVERED(orderId), {}, { headers });
      setSuccess(`Order #${orderId} marked as delivered`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark as delivered');
    }
  };

  const closeOrder = async (orderId) => {
    setError(''); setSuccess('');
    try {
      await axios.post(API_ENDPOINTS.PURCHASING.CLOSE_ORDER(orderId), {}, { headers });
      setSuccess(`Order #${orderId} closed successfully`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to close order');
    }
  };

  const returnOrder = async (orderId) => {
    const confirmed = window.confirm(
      'Are you sure you want to return this order to the user?\n\n' +
      'This action will mark the order as RETURNED and notify the user that payment was unsuccessful.'
    );
    if (!confirmed) return;

    setError(''); setSuccess('');
    try {
      const res = await axios.post(
        API_ENDPOINTS.PURCHASING.RETURN_ORDER(orderId), 
        { reason: 'Unsuccessful payment, please try again' }, 
        { headers }
      );
      setSuccess(res.data.message || `Order #${orderId} returned to user`);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to return order');
    }
  };

  const markPaymentReceived = async (orderId) => {
    setError(''); setSuccess('');
    try {
      const res = await axios.post(API_ENDPOINTS.PURCHASING.MARK_PAYMENT(orderId), {}, { headers });
      const data = res.data;
      if (data.allPaymentsReceived) {
        setSuccess(`Final payment received for order #${orderId}. Order approved!`);
      } else {
        setSuccess(`Payment ${data.paymentsReceived}/${data.totalPayments} received for order #${orderId}`);
      }
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark payment');
    }
  };

  // Filter orders based on tab
  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Apply tab filter
    if (tab === 1) filtered = filtered.filter(o => ['PENDING', 'RETURNED'].includes(o.status)); // Pending/Returned
    if (tab === 2) filtered = filtered.filter(o => o.status === 'APPROVED'); // New orders
    if (tab === 3) filtered = filtered.filter(o => o.status === 'ACKNOWLEDGED'); // Acknowledged
    if (tab === 4) filtered = filtered.filter(o => ['IN_PROCESS', 'FINALIZING', 'OUT_FOR_DELIVERY'].includes(o.status)); // In Process
    if (tab === 5) filtered = filtered.filter(o => ['DELIVERED', 'CLOSED', 'COMPLETED'].includes(o.status)); // Closed/Delivered
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(o => 
        String(o.id).includes(search) ||
        o.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        o.school?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (loading) return (
    <Container sx={{ textAlign:'center', py:8 }}>
      <CircularProgress sx={{ color:C.forest }} />
      <Typography sx={{ mt:2, color:C.stone }}>Loading purchasing dashboard...</Typography>
    </Container>
  );

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:C.cream, py:6 }}>
      {/* New Order Alert */}
      {showNewOrderAlert && <NewOrderAlert onDismiss={() => { setShowNewOrderAlert(false); fetchAll(); }} />}
      
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb:4 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:1 }}>
            <Avatar sx={{ background:`linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)`, width:56, height:56, borderRadius:'16px' }}>
              <LocalShippingIcon sx={{ fontSize:28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink }}>
                Purchasing Dashboard
              </Typography>
              <Typography variant="body2" color={C.stone}>
                Process orders, track deliveries, and submit for approval
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb:3 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb:3 }}>{success}</Alert>}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb:4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<PendingActionsIcon />}
                label="New Orders"
                value={stats.newOrders || 0}
                sub="Awaiting acknowledgment"
                gradient="linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)"
                onClick={() => setTab(1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<CheckCircleIcon />}
                label="Acknowledged"
                value={stats.acknowledged || 0}
                sub="Orders acknowledged"
                gradient="linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)"
                onClick={() => setTab(2)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<ShoppingCartIcon />}
                label="In Process"
                value={(stats.inProcess || 0) + (stats.finalizing || 0) + (stats.outForDelivery || 0)}
                sub="Processing & delivery"
                gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)"
                onClick={() => setTab(3)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<LocalShippingIcon />}
                label="Closed"
                value={(stats.delivered || 0) + (stats.closed || 0)}
                sub="Delivered & closed"
                gradient="linear-gradient(135deg, #34D399 0%, #10B981 100%)"
                onClick={() => setTab(4)}
              />
            </Grid>
          </Grid>
        )}

        {/* Main Content */}
        <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}` }}>
          <CardContent sx={{ p:0 }}>
            {/* Tabs */}
            <Box sx={{ borderBottom:`1px solid ${C.border}`, px:3, pt:2 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                <Tabs 
                  value={tab} 
                  onChange={(e, v) => setTab(v)}
                  sx={{ '& .MuiTab-root': { fontWeight:600, color:C.stone }, '& .Mui-selected': { color:C.forest } }}
                >
                  <Tab label="All Orders" />
                  <Tab label="Pending/Returned" />
                  <Tab label={<Badge badgeContent={stats?.newOrders || 0} color="error">New Orders</Badge>} />
                  <Tab label="Acknowledged" />
                  <Tab label="In Process" />
                  <Tab label="Closed" />
                </Tabs>
                <Box sx={{ display:'flex', gap:1 }}>
                  <TextField
                    size="small"
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                      sx: { borderRadius:'12px' }
                    }}
                  />
                  <IconButton onClick={fetchAll} sx={{ bgcolor:C.goldPale, '&:hover':{bgcolor:C.gold} }}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Orders Table */}
            <TabPanel value={tab} index={tab}>
              {filteredOrders.length === 0 ? (
                <Box sx={{ textAlign:'center', py:8 }}>
                  <ShoppingCartIcon sx={{ fontSize:64, color:C.stone, opacity:0.3, mb:2 }} />
                  <Typography color={C.stone}>No orders found</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor:C.parchment }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>School</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Type</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Status</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Payment</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Date</TableCell>
                        <TableCell sx={{ fontWeight:700, color:C.forest }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders.map(order => (
                        <TableRow key={order.id} hover>
                          <TableCell sx={{ fontWeight:600 }}>#{order.id}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight:600 }}>{order.user?.fullName}</Typography>
                              <Typography variant="caption" color={C.stone}>{order.user?.email}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{order.school?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.orderType} 
                              size="small" 
                              sx={{ 
                                bgcolor: order.orderType === 'PURCHASE' ? '#DBEAFE' : '#FED7AA',
                                color: order.orderType === 'PURCHASE' ? '#1E40AF' : '#92400E',
                                fontWeight:600 
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight:600 }}>R {order.totalAmount}</TableCell>
                          <TableCell><STATUS_CHIP status={order.status} /></TableCell>
                          <TableCell>
                            {order.paymentType === 'PAYMENT_PLAN' ? (
                              <Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
                                <Chip 
                                  icon={<AccountBalanceWalletIcon />} 
                                  label={`${order.paymentsReceived || 0}/${order.paymentPlanMonths} Payments`}
                                  size="small" 
                                  sx={{ 
                                    bgcolor: (order.paymentsReceived || 0) >= order.paymentPlanMonths ? '#DCFCE7' : '#FEF3C7', 
                                    color: (order.paymentsReceived || 0) >= order.paymentPlanMonths ? '#15803D' : '#92400E',
                                    fontWeight:600 
                                  }} 
                                />
                                <Typography variant="caption" color={C.stone}>
                                  R{order.monthlyInstalment || 0}/month
                                </Typography>
                              </Box>
                            ) : order.paymentComplete ? (
                              <Chip 
                                icon={<PaymentIcon />} 
                                label="Paid" 
                                size="small" 
                                sx={{ bgcolor:'#DCFCE7', color:'#15803D', fontWeight:600 }} 
                              />
                            ) : (
                              <Chip 
                                label="Pending" 
                                size="small" 
                                sx={{ bgcolor:'#FEF9C3', color:'#854D0E', fontWeight:600 }} 
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color={C.stone}>
                              {formatDate(order.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display:'flex', gap:0.5, alignItems:'center' }}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => openDetailDialog(order.id)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {/* New workflow actions */}
                              {order.status === 'APPROVED' && (
                                <Tooltip title="Acknowledge Order">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => acknowledgeOrder(order.id)}
                                    sx={{ color:C.forest }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {order.status === 'ACKNOWLEDGED' && (
                                <Tooltip title="Start Processing">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => startProcessing(order.id)}
                                    sx={{ color:'#3B82F6' }}
                                  >
                                    <ShoppingCartIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {order.status === 'IN_PROCESS' && (
                                <Tooltip title="Verify Payment">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => verifyPayment(order.id)}
                                    sx={{ color:'#7C3AED' }}
                                  >
                                    <PaymentIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {order.status === 'FINALIZING' && (
                                <Tooltip title="Send for Delivery">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => sendForDelivery(order.id)}
                                    sx={{ color:'#92400E' }}
                                  >
                                    <LocalShippingIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {order.status === 'OUT_FOR_DELIVERY' && (
                                <Tooltip title="Mark as Delivered">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => markDelivered(order.id)}
                                    sx={{ color:'#15803D' }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {order.status === 'DELIVERED' && (
                                <Tooltip title="Close Order">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => closeOrder(order.id)}
                                    sx={{ color:'#10B981' }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Payment tracking actions */}
                              {order.status === 'PENDING' && !order.paymentComplete && (
                                <Tooltip title="Return Order (Payment Failed)">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => returnOrder(order.id)}
                                    sx={{ color:'#DC2626' }}
                                  >
                                    <UndoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {order.paymentType === 'PAYMENT_PLAN' && 
                               order.paymentsReceived < order.paymentPlanMonths && 
                               ['PENDING', 'APPROVED'].includes(order.status) && (
                                <Tooltip title={`Mark Payment ${(order.paymentsReceived || 0) + 1}/${order.paymentPlanMonths} Received`}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => markPaymentReceived(order.id)}
                                    sx={{ color:'#059669' }}
                                  >
                                    <AccountBalanceWalletIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog 
          open={detailDialog.open} 
          onClose={() => setDetailDialog({ open:false, order:null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.75rem' }}>
            Order Details #{detailDialog.order?.id}
          </DialogTitle>
          <DialogContent dividers>
            {detailDialog.order && (
              <Box>
                <Grid container spacing={2} sx={{ mb:3 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color={C.stone} sx={{ textTransform:'uppercase', fontWeight:600 }}>
                      Customer
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight:600 }}>
                      {detailDialog.order.user?.fullName}
                    </Typography>
                    <Typography variant="caption" color={C.stone}>
                      {detailDialog.order.user?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color={C.stone} sx={{ textTransform:'uppercase', fontWeight:600 }}>
                      School
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight:600 }}>
                      {detailDialog.order.school?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color={C.stone} sx={{ textTransform:'uppercase', fontWeight:600 }}>
                      Status
                    </Typography>
                    <Box sx={{ mt:0.5 }}>
                      <STATUS_CHIP status={detailDialog.order.status} />
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color={C.stone} sx={{ textTransform:'uppercase', fontWeight:600 }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight:700, color:C.forest }}>
                      R {detailDialog.order.totalAmount}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color={C.stone} sx={{ textTransform:'uppercase', fontWeight:600 }}>
                      Payment
                    </Typography>
                    <Box sx={{ mt:0.5 }}>
                      {detailDialog.order.paymentComplete ? (
                        <Chip icon={<PaymentIcon />} label="Paid" size="small" sx={{ bgcolor:'#DCFCE7', color:'#15803D' }} />
                      ) : (
                        <Chip label="Pending" size="small" sx={{ bgcolor:'#FEF9C3', color:'#854D0E' }} />
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my:2 }} />

                <Typography variant="h6" sx={{ fontWeight:700, mb:2 }}>Order Items</Typography>
                {detailDialog.order.items?.map((item, idx) => (
                  <Box key={idx} sx={{ display:'flex', justifyContent:'space-between', py:1.5, borderBottom:`1px solid ${C.border}` }}>
                    <Box>
                      <Typography sx={{ fontWeight:600 }}>{item.stationery?.name}</Typography>
                      <Typography variant="caption" color={C.stone}>Qty: {item.quantity}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight:700 }}>R {item.subtotal}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog({ open:false, order:null })}>Close</Button>
            {detailDialog.order?.status === 'PENDING' && (
              <Button 
                variant="contained" 
                onClick={() => {
                  openStatusDialog(detailDialog.order, 'PROCESSING');
                  setDetailDialog({ open:false, order:null });
                }}
                sx={{ bgcolor:C.forest, '&:hover':{bgcolor:C.forestMid} }}
              >
                Mark as Processing
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open:false, order:null, status:'' })}>
          <DialogTitle>
            {statusDialog.status === 'PURCHASE_IN_PROGRESS' && '🛒 Start Purchase Process'}
            {statusDialog.status === 'PACKAGED' && '📦 Mark Order as Packaged'}
            {statusDialog.status === 'OUT_FOR_DELIVERY' && '🚚 Send Out for Delivery'}
            {statusDialog.status === 'DELIVERED' && '✓ Confirm Delivery'}
            {statusDialog.status === 'COMPLETED' && '✓ Complete Transaction'}
            {!['PURCHASE_IN_PROGRESS', 'PACKAGED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(statusDialog.status) && 'Update Order Status'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color={C.stone} sx={{ mb:2 }}>
              Update order #{statusDialog.order?.id} to <strong>{statusDialog.status?.replace(/_/g, ' ')}</strong>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optional)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog({ open:false, order:null, status:'' })}>Cancel</Button>
            <Button variant="contained" onClick={updateOrderStatus} sx={{ bgcolor:C.forest }}>
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delivery Notes Dialog */}
        <Dialog open={deliveryDialog.open} onClose={() => setDeliveryDialog({ open:false, order:null })}>
          <DialogTitle>Add Delivery Notes</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color={C.stone} sx={{ mb:2 }}>
              Record delivery tracking information for order #{deliveryDialog.order?.id}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Delivery Notes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g., Shipped via courier XYZ, tracking number: 123456..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeliveryDialog({ open:false, order:null })}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={submitDeliveryNotes} 
              disabled={!deliveryNotes.trim()}
              sx={{ bgcolor:C.forest }}
            >
              Save Notes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Submit for Approval Dialog */}
        <Dialog open={approvalDialog.open} onClose={() => setApprovalDialog({ open:false, order:null })}>
          <DialogTitle>Submit for Super Admin Approval</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb:2 }}>
              This order will be marked as ready and submitted to the Super Admin for final approval.
            </Alert>
            <Typography variant="body2" color={C.stone} sx={{ mb:2 }}>
              Order #{approvalDialog.order?.id} - R {approvalDialog.order?.totalAmount}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes for Super Admin (optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes for the Super Admin..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog({ open:false, order:null })}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={submitForApproval}
              startIcon={<SendIcon />}
              sx={{ bgcolor:C.forest }}
            >
              Submit for Approval
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
