import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Box, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Avatar
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import apiClient from '../services/api.service';
import API from '../config/api';

const ROLES = ['EMPLOYEE', 'DEPARTMENT_MANAGER', 'PROCUREMENT_OFFICER', 'COMPANY_ADMIN'];
const ROLE_COLORS = { EMPLOYEE: 'default', DEPARTMENT_MANAGER: 'primary', PROCUREMENT_OFFICER: 'warning', COMPANY_ADMIN: 'error', SUPER_ADMIN: 'error' };

const EmployeeManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ role: '', departmentId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        apiClient.get(API.USERS.BASE),
        apiClient.get(API.DEPARTMENTS.BASE),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (deptsRes.data.success) setDepartments(deptsRes.data.departments || []);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const openEdit = (user) => {
    setEditDialog({ open: true, user });
    setEditForm({ role: user.role || '', departmentId: user.departmentId || '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(API.USERS.DETAIL(editDialog.user.id), editForm);
      setSuccess('User updated successfully');
      setEditDialog({ open: false, user: null });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await apiClient.delete(API.USERS.DETAIL(id));
      setSuccess('User deactivated');
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Employees</Typography>
          <Typography variant="body2" color="text.secondary">{users.length} user{users.length !== 1 ? 's' : ''} in your organisation</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const dept = departments.find((d) => d.id === u.departmentId);
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{u.firstName} {u.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                    <TableCell>
                      <Chip label={u.role?.replace(/_/g, ' ')} color={ROLE_COLORS[u.role] || 'default'} size="small" />
                    </TableCell>
                    <TableCell><Typography variant="body2">{dept?.name || '-'}</Typography></TableCell>
                    <TableCell>
                      <Chip label={u.isEnabled ? 'Active' : 'Inactive'} color={u.isEnabled ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="outlined" onClick={() => openEdit(u)}>Edit</Button>
                        {u.isEnabled && (
                          <Button size="small" color="error" onClick={() => handleDeactivate(u.id)}>Deactivate</Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User — {editDialog.user?.firstName} {editDialog.user?.lastName}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} label="Role">
                {ROLES.map((r) => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select value={editForm.departmentId} onChange={(e) => setEditForm((f) => ({ ...f, departmentId: e.target.value }))} label="Department">
                <MenuItem value="">None</MenuItem>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagementPage;
