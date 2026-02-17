import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Box, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch,
  FormControlLabel
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import apiClient from '../services/api.service';
import API from '../config/api';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, item: null });
  const [editForm, setEditForm] = useState({ currentStock: '', location: '', autoReorderEnabled: false });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, lowRes] = await Promise.all([
        apiClient.get(API.INVENTORY.BASE),
        apiClient.get(API.INVENTORY.LOW_STOCK),
      ]);
      if (invRes.data.success) setInventory(invRes.data.inventory || []);
      if (lowRes.data.success) setLowStock(lowRes.data.items || []);
    } catch { setError('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const openEdit = (item) => {
    setEditDialog({ open: true, item });
    setEditForm({ currentStock: item.currentStock ?? '', location: item.location || '', autoReorderEnabled: item.autoReorderEnabled || false });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(API.INVENTORY.DETAIL(editDialog.item.id), editForm);
      setSuccess('Inventory updated');
      setEditDialog({ open: false, item: null });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const displayed = tab === 'low' ? lowStock : inventory;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Inventory</Typography>
          <Typography variant="body2" color="text.secondary">Track office supply stock levels</Typography>
        </Box>
        {lowStock.length > 0 && (
          <Chip
            icon={<Warning />}
            label={`${lowStock.length} low stock`}
            color="warning"
            onClick={() => setTab(tab === 'low' ? 'all' : 'low')}
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant={tab === 'all' ? 'contained' : 'outlined'} size="small" onClick={() => setTab('all')}>All ({inventory.length})</Button>
        <Button variant={tab === 'low' ? 'contained' : 'outlined'} color="warning" size="small" onClick={() => setTab('low')}>Low Stock ({lowStock.length})</Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Product ID</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Avg Monthly</TableCell>
                <TableCell>Auto-Reorder</TableCell>
                <TableCell>Last Restocked</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No inventory records found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((item) => (
                  <TableRow key={item.id} hover sx={{ bgcolor: item.currentStock <= 10 ? 'warning.50' : 'inherit' }}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{item.stationeryId}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{item.location || '-'}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{item.currentStock}</Typography>
                        {item.currentStock <= 10 && <Warning fontSize="small" color="warning" />}
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{item.averageMonthlyConsumption ?? '-'}</Typography></TableCell>
                    <TableCell>
                      <Chip label={item.autoReorderEnabled ? 'On' : 'Off'} color={item.autoReorderEnabled ? 'success' : 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell><Typography variant="body2">{item.lastRestockedDate ? new Date(item.lastRestockedDate).toLocaleDateString('en-ZA') : '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => openEdit(item)}>Update</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, item: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Update Inventory — Product #{editDialog.item?.stationeryId}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Current Stock" type="number" fullWidth value={editForm.currentStock} onChange={(e) => setEditForm((f) => ({ ...f, currentStock: e.target.value }))} />
            <TextField label="Location" fullWidth value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} />
            <FormControlLabel
              control={<Switch checked={editForm.autoReorderEnabled} onChange={(e) => setEditForm((f) => ({ ...f, autoReorderEnabled: e.target.checked }))} />}
              label="Auto-Reorder Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, item: null })}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryPage;
