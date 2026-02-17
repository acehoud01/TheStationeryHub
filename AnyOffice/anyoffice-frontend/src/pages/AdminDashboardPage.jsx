import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Avatar
} from '@mui/material';
import { Business, People, TrendingUp, CheckCircle } from '@mui/icons-material';
import apiClient from '../services/api.service';
import API from '../config/api';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.main`, width: 52, height: 52 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.get(API.ADMIN.COMPANIES),
      apiClient.get(API.ADMIN.USERS),
      apiClient.get(API.ADMIN.ANALYTICS),
    ]).then(([c, u, a]) => {
      if (c.data.success) setCompanies(c.data.companies || []);
      if (u.data.success) setUsers(u.data.users || []);
      if (a.data.success) setAnalytics(a.data.data);
    }).catch(() => setError('Failed to load admin data'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Admin Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>Platform-wide overview — Super Admin</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Companies" value={analytics?.totalCompanies ?? companies.length} icon={<Business />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Companies" value={analytics?.activeCompanies ?? '-'} icon={<CheckCircle />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={analytics?.totalUsers ?? users.length} icon={<People />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Platform Health" value="Active" icon={<TrendingUp />} color="success" />
        </Grid>
      </Grid>

      {/* Companies table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Companies ({companies.length})</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscription</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No companies registered</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant="body2">{c.id}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{c.name}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{c.industry || '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{c.contactEmail}</Typography></TableCell>
                      <TableCell>
                        <Chip label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={c.subscriptionTier || 'BASIC'} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>All Users ({users.length})</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(0, 20).map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell><Typography variant="body2">{u.id}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{u.firstName} {u.lastName}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                    <TableCell>
                      <Chip label={u.role?.replace(/_/g, ' ')} size="small" />
                    </TableCell>
                    <TableCell><Typography variant="body2">{u.companyId ?? '-'}</Typography></TableCell>
                    <TableCell>
                      <Chip label={u.isEnabled ? 'Active' : 'Inactive'} color={u.isEnabled ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminDashboardPage;
