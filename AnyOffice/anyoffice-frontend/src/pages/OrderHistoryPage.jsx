import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  CircularProgress, Alert, Box, Button, TextField, InputAdornment,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Search } from '@mui/icons-material';
import apiClient from '../services/api.service';
import API from '../config/api';

const STATUS_COLORS = {
  APPROVED: 'success', PENDING_APPROVAL: 'warning', REJECTED: 'error',
  PROCESSING: 'info', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'default',
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    apiClient.get(API.ORDERS.BASE)
      .then((res) => { if (res.data.success) { setOrders(res.data.orders || []); setFiltered(res.data.orders || []); } })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'ALL') result = result.filter((o) => o.status === statusFilter);
    if (search) result = result.filter((o) => o.orderNumber?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [orders, statusFilter, search]);

  const handleCancel = async (id) => {
    try {
      await apiClient.delete(API.ORDERS.DETAIL(id));
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'CANCELLED' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel this order');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Order History</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Track and manage your procurement orders</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search order number..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => v && setStatusFilter(v)}
          size="small"
        >
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REJECTED'].map((s) => (
            <ToggleButton key={s} value={s} sx={{ fontSize: '0.7rem' }}>
              {s.replace(/_/g, ' ')}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>{filtered.length} order{filtered.length !== 1 ? 's' : ''}</Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>VAT</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{order.orderNumber}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2">{new Date(order.orderDate).toLocaleDateString('en-ZA')}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{order.items?.length ?? '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">R{Number(order.totalAmount || 0).toFixed(2)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">R{Number(order.taxAmount || 0).toFixed(2)}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>R{Number(order.grandTotal || 0).toFixed(2)}</Typography></TableCell>
                      <TableCell>
                        <Chip label={order.status?.replace(/_/g, ' ')} color={STATUS_COLORS[order.status] || 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                            {expanded === order.id ? 'Hide' : 'Details'}
                          </Button>
                          {order.status === 'PENDING_APPROVAL' && (
                            <Button size="small" color="error" onClick={() => handleCancel(order.id)}>Cancel</Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {expanded === order.id && order.items?.map((item) => (
                      <TableRow key={item.id} sx={{ bgcolor: 'grey.50' }}>
                        <TableCell colSpan={2} sx={{ pl: 4 }}>
                          <Typography variant="caption">↳ Item #{item.stationeryId}</Typography>
                        </TableCell>
                        <TableCell><Typography variant="caption">Qty: {item.quantity}</Typography></TableCell>
                        <TableCell><Typography variant="caption">R{Number(item.unitPrice).toFixed(2)}/ea</Typography></TableCell>
                        <TableCell colSpan={4}><Typography variant="caption">Subtotal: R{Number(item.subtotal).toFixed(2)}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
};

export default OrderHistoryPage;
