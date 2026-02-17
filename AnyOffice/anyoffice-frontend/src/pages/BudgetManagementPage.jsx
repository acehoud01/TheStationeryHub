import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add } from '@mui/icons-material';
import apiClient from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import BudgetTracker from '../components/BudgetTracker';
import API from '../config/api';

const BudgetManagementPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ departmentId: '', fiscalYear: new Date().getFullYear(), fiscalQuarter: 1, allocatedAmount: '', category: 'GENERAL' });
  const [saving, setSaving] = useState(false);

  const isAdmin = ['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, deptRes] = await Promise.all([
        apiClient.get(API.BUDGET.SUMMARY),
        apiClient.get(API.DEPARTMENTS.BASE),
      ]);
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
        setAllocations(summaryRes.data.summary?.allocations || []);
      }
      if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
    } catch { setError('Failed to load budget data'); }
    finally { setLoading(false); }
  };

  const handleAllocate = async () => {
    setSaving(true);
    try {
      await apiClient.post(API.BUDGET.ALLOCATE, form);
      setSuccess('Budget allocated successfully');
      setDialogOpen(false);
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Allocation failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Budget Management</Typography>
          <Typography variant="body2" color="text.secondary">Track and manage company procurement budgets</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Allocate Budget</Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Summary cards */}
      {summary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Total Allocated</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  R{Number(summary.totalAllocated || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  R{Number(summary.totalSpent || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Remaining</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  R{Number((summary.totalAllocated || 0) - (summary.totalSpent || 0)).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Department budgets */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Department Budgets</Typography>
          {departments.length === 0 ? (
            <Typography color="text.secondary">No departments found</Typography>
          ) : (
            <Grid container spacing={3}>
              {departments.map((dept) => (
                <Grid item xs={12} sm={6} key={dept.id}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={2}>{dept.name}</Typography>
                    <BudgetTracker
                      allocated={Number(dept.monthlyBudget || 0)}
                      spent={Number(dept.currentSpend || 0)}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Allocations table */}
      {allocations.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Dept ID</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Quarter</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Allocated</TableCell>
                  <TableCell>Spent</TableCell>
                  <TableCell>Remaining</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allocations.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.departmentId}</TableCell>
                    <TableCell>{a.fiscalYear}</TableCell>
                    <TableCell>Q{a.fiscalQuarter}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>R{Number(a.allocatedAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>R{Number(a.spentAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>R{Number((a.allocatedAmount || 0) - (a.spentAmount || 0)).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Allocate dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Allocate Budget</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select value={form.departmentId} onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))} label="Department">
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Fiscal Year" type="number" value={form.fiscalYear} onChange={(e) => setForm((f) => ({ ...f, fiscalYear: e.target.value }))} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Quarter</InputLabel>
                <Select value={form.fiscalQuarter} onChange={(e) => setForm((f) => ({ ...f, fiscalQuarter: e.target.value }))} label="Quarter">
                  {[1, 2, 3, 4].map((q) => <MenuItem key={q} value={q}>Q{q}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField label="Amount (R)" type="number" value={form.allocatedAmount} onChange={(e) => setForm((f) => ({ ...f, allocatedAmount: e.target.value }))} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAllocate} variant="contained" disabled={saving || !form.departmentId || !form.allocatedAmount}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Allocate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BudgetManagementPage;
