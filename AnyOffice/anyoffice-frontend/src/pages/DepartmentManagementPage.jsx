import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Grid, Button, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import apiClient from '../services/api.service';
import BudgetTracker from '../components/BudgetTracker';
import API from '../config/api';

const emptyForm = { name: '', code: '', monthlyBudget: '', costCenter: '' };

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.DEPARTMENTS.BASE);
      if (res.data.success) setDepartments(res.data.departments || []);
    } catch { setError('Failed to load departments'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name || '', code: dept.code || '', monthlyBudget: dept.monthlyBudget || '', costCenter: dept.costCenter || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Department name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiClient.put(API.DEPARTMENTS.DETAIL(editing.id), form);
        setSuccess('Department updated');
      } else {
        await apiClient.post(API.DEPARTMENTS.BASE, form);
        setSuccess('Department created');
      }
      setDialogOpen(false);
      fetchDepartments();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this department?')) return;
    try {
      await apiClient.delete(API.DEPARTMENTS.DETAIL(id));
      setSuccess('Department deactivated');
      fetchDepartments();
    } catch (err) { setError(err.response?.data?.message || 'Failed to deactivate'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Departments</Typography>
          <Typography variant="body2" color="text.secondary">{departments.length} active department{departments.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Department</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3}>
        {departments.map((dept) => (
          <Grid item xs={12} sm={6} md={4} key={dept.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{dept.name}</Typography>
                    {dept.code && <Chip label={dept.code} size="small" sx={{ mt: 0.5 }} />}
                  </Box>
                  <Button size="small" startIcon={<Edit />} onClick={() => openEdit(dept)}>Edit</Button>
                </Box>
                {dept.costCenter && (
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Cost Centre: {dept.costCenter}
                  </Typography>
                )}
                <BudgetTracker
                  allocated={Number(dept.monthlyBudget || 0)}
                  spent={Number(dept.currentSpend || 0)}
                  label="Monthly Budget"
                />
                <Button size="small" color="error" sx={{ mt: 2 }} onClick={() => handleDeactivate(dept.id)}>
                  Deactivate
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {departments.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary" mb={2}>No departments yet</Typography>
              <Button variant="contained" onClick={openCreate}>Create First Department</Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit Department' : 'New Department'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Department Name" required fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label="Code" fullWidth value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <TextField label="Monthly Budget (R)" type="number" fullWidth value={form.monthlyBudget} onChange={(e) => setForm((f) => ({ ...f, monthlyBudget: e.target.value }))} />
            <TextField label="Cost Centre" fullWidth value={form.costCenter} onChange={(e) => setForm((f) => ({ ...f, costCenter: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : editing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DepartmentManagementPage;
