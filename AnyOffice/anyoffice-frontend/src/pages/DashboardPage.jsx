import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Chip, CircularProgress, Alert, Table, TableBody, TableCell,
  TableHead, TableRow, Avatar
} from '@mui/material';
import {
  ShoppingBag, Pending, AttachMoney, People, CheckCircle,
  Category, TrendingUp, Add
} from '@mui/icons-material';
import apiClient from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import BudgetTracker from '../components/BudgetTracker';
import API from '../config/api';

const STATUS_COLORS = {
  APPROVED: 'success', PENDING_APPROVAL: 'warning', REJECTED: 'error',
  PROCESSING: 'info', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'default',
};

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [ordersRes, analyticsRes] = await Promise.all([
        apiClient.get(API.ORDERS.BASE),
        apiClient.get(API.ANALYTICS.DASHBOARD).catch(() => ({ data: {} })),
      ]);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders?.slice(0, 5) || []);
      if (analyticsRes.data.success) setDashData(analyticsRes.data.data);

      if (user?.departmentId) {
        const budgetRes = await apiClient.get(API.BUDGET.DEPARTMENT(user.departmentId)).catch(() => null);
        if (budgetRes?.data?.success) setBudget(budgetRes.data.budget);
      }
    } catch {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, {user?.firstName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role?.replace(/_/g, ' ')} · {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/catalog')}>New Order</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Cards */}
      {dashData && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Orders" value={dashData.totalOrders ?? '-'} icon={<ShoppingBag />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Pending Approvals" value={dashData.pendingApprovals ?? 0} icon={<Pending />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Monthly Spend" value={`R${Number(dashData.monthlySpend ?? 0).toLocaleString()}`} icon={<AttachMoney />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Employees" value={dashData.totalEmployees ?? '-'} icon={<People />} color="secondary" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={budget ? 8 : 12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Recent Orders</Typography>
                <Button size="small" onClick={() => navigate('/orders')}>View All</Button>
              </Box>
              {orders.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ShoppingBag sx={{ fontSize: 48, color: 'grey.300' }} />
                  <Typography color="text.secondary" mt={1}>No orders yet</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/catalog')}>Browse Catalog</Button>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>
                        <TableCell><Typography variant="body2" fontWeight={600}>{o.orderNumber}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{new Date(o.orderDate).toLocaleDateString('en-ZA')}</Typography></TableCell>
                        <TableCell><Typography variant="body2">R{Number(o.grandTotal).toFixed(2)}</Typography></TableCell>
                        <TableCell>
                          <Chip label={o.status?.replace(/_/g, ' ')} color={STATUS_COLORS[o.status] || 'default'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Budget tracker */}
        {budget && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>Department Budget</Typography>
                <BudgetTracker
                  allocated={Number(budget.allocatedAmount || 0)}
                  spent={Number(budget.spentAmount || 0)}
                  label={budget.departmentName || 'Current Period'}
                />
                <Button fullWidth variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/budget')}>
                  Manage Budget
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Quick actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Quick Actions</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Browse Catalog', icon: <Category />, to: '/catalog', color: 'primary' },
                  { label: 'My Orders', icon: <ShoppingBag />, to: '/orders', color: 'primary' },
                  ...((['DEPARTMENT_MANAGER', 'PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user?.role))
                    ? [{ label: 'Approvals', icon: <CheckCircle />, to: '/approvals', color: 'warning' }] : []),
                  ...((['PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user?.role))
                    ? [{ label: 'Analytics', icon: <TrendingUp />, to: '/analytics', color: 'success' }] : []),
                ].map((action) => (
                  <Grid item xs={6} sm={3} key={action.label}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={action.icon}
                      onClick={() => navigate(action.to)}
                      sx={{ py: 1.5, flexDirection: 'column', gap: 0.5 }}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
