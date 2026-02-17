import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
  Alert, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import apiClient from '../services/api.service';
import API from '../config/api';

const ApprovalQueuePage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchApprovals(); }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.APPROVALS.PENDING);
      if (res.data.success) setApprovals(res.data.approvals || []);
    } catch { setError('Failed to load pending approvals'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.put(API.APPROVALS.APPROVE(id), {});
      setSuccess('Order approved successfully');
      fetchApprovals();
    } catch (err) { setError(err.response?.data?.message || 'Approval failed'); }
    finally { setActionLoading(false); }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await apiClient.put(API.APPROVALS.REJECT(rejectDialog.id), { rejectionReason: rejectReason });
      setSuccess('Order rejected');
      setRejectDialog({ open: false, id: null });
      setRejectReason('');
      fetchApprovals();
    } catch (err) { setError(err.response?.data?.message || 'Rejection failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Approval Queue</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Review and approve pending procurement orders</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Order #</TableCell>
                <TableCell>Requester ID</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">No pending approvals — you're all caught up!</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>Order #{a.orderId}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{a.requesterId}</Typography></TableCell>
                    <TableCell><Chip label={`Level ${a.level}`} size="small" /></TableCell>
                    <TableCell><Chip label={a.status} color="warning" size="small" /></TableCell>
                    <TableCell><Typography variant="body2">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-ZA') : '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(a.id)}
                          disabled={actionLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => setRejectDialog({ open: true, id: a.id })}
                          disabled={actionLoading}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleRejectSubmit} color="error" variant="contained" disabled={!rejectReason.trim() || actionLoading}>
            Reject Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApprovalQueuePage;
