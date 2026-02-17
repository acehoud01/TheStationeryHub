import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box,
  CircularProgress, Alert, Avatar
} from '@mui/material';
import {
  ShoppingBag, AttachMoney, TrendingUp, Pending
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import apiClient from '../services/api.service';
import API from '../config/api';

const COLORS = ['#1A2E44', '#C8A45C', '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

const StatCard = ({ title, value, sub, icon, color = 'primary' }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.main`, width: 52, height: 52 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [spend, setSpend] = useState(null);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.get(API.ANALYTICS.DASHBOARD),
      apiClient.get(API.ANALYTICS.SPEND),
      apiClient.get(API.ANALYTICS.ORDERS),
    ]).then(([d, s, o]) => {
      if (d.data.success) setDashboard(d.data.data);
      if (s.data.success) setSpend(s.data.data);
      if (o.data.success) setOrders(o.data.data);
    }).catch(() => setError('Failed to load analytics'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const ordersByStatus = orders?.byStatus
    ? Object.entries(orders.byStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Analytics</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>Company procurement insights and trends</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Orders" value={dashboard?.totalOrders ?? '-'} icon={<ShoppingBag />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Spend" value={`R${Number(spend?.totalSpend ?? 0).toLocaleString()}`} icon={<AttachMoney />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Order Value" value={`R${Number(spend?.averageOrderValue ?? 0).toFixed(2)}`} icon={<TrendingUp />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Approvals" value={dashboard?.pendingApprovals ?? 0} icon={<Pending />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Orders by Status (Pie) */}
        {ordersByStatus.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Orders by Status</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Orders']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Dashboard status breakdown (Bar) */}
        {dashboard?.ordersByStatus && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Order Status Breakdown</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={Object.entries(dashboard.ordersByStatus).map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1A2E44" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summary stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Company Overview</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Total Employees', value: dashboard?.totalEmployees ?? '-' },
                  { label: 'Total Departments', value: dashboard?.totalDepartments ?? '-' },
                  { label: 'Monthly Spend', value: `R${Number(dashboard?.monthlySpend ?? 0).toLocaleString()}` },
                  { label: 'Total Orders', value: spend?.totalOrders ?? '-' },
                ].map((stat) => (
                  <Grid item xs={6} sm={3} key={stat.label}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="h5" fontWeight={700} color="primary.main">{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Box>
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

export default AnalyticsPage;
