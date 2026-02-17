import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Grid, Button, IconButton,
  TextField, Divider, Alert, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, Chip
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart } from '@mui/icons-material';
import apiClient from '../services/api.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../config/api';

const APPROVAL_TIERS = [
  { max: 5000, label: 'Auto-Approved', color: 'success' },
  { max: 20000, label: 'Dept. Manager Approval', color: 'warning' },
  { max: 50000, label: 'Procurement Officer Approval', color: 'warning' },
  { max: Infinity, label: 'Company Admin Approval', color: 'error' },
];

const getApprovalTier = (total) => APPROVAL_TIERS.find((t) => total < t.max);

const VAT_RATE = 0.15;

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ departmentId: user?.departmentId || '', shippingAddress: '', priority: 'MEDIUM', paymentMethod: 'COMPANY_ACCOUNT', deliveryNotes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiClient.get(API.DEPARTMENTS.BASE).then((res) => {
      if (res.data.success) setDepartments(res.data.departments || []);
    }).catch(() => {});
  }, []);

  const subtotal = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const tax = subtotal * VAT_RATE;
  const grandTotal = subtotal + tax;
  const tier = getApprovalTier(grandTotal);

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        items: cartItems.map((i) => ({ stationeryId: i.id, quantity: i.quantity, notes: '' })),
      };
      const res = await apiClient.post(API.ORDERS.BASE, payload);
      if (res.data.success) {
        clearCart();
        setSuccess(`Order ${res.data.order.orderNumber} placed successfully!`);
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        setError(res.data.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} mb={1}>Your cart is empty</Typography>
        <Typography color="text.secondary" mb={3}>Browse the catalog to add items</Typography>
        <Button variant="contained" onClick={() => navigate('/catalog')}>Browse Catalog</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Shopping Cart</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {cartItems.map((item, idx) => (
                <Box key={item.id}>
                  {idx > 0 && <Divider sx={{ my: 2 }} />}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={600}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.category}</Typography>
                      <Typography color="primary.main" fontWeight={600}>R{Number(item.price).toFixed(2)} each</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Remove fontSize="small" /></IconButton>
                      <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Add fontSize="small" /></IconButton>
                    </Box>
                    <Typography fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>
                      R{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton color="error" onClick={() => removeFromCart(item.id)}><Delete /></IconButton>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Order Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select value={form.departmentId} onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))} label="Department">
                      <MenuItem value="">None</MenuItem>
                      {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} label="Priority">
                      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Shipping Address" fullWidth size="small" value={form.shippingAddress} onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Delivery Notes (optional)" fullWidth size="small" multiline rows={2} value={form.deliveryNotes} onChange={(e) => setForm((f) => ({ ...f, deliveryNotes: e.target.value }))} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Order Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>R{subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">VAT (15%)</Typography>
                <Typography>R{tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography fontWeight={700}>Grand Total</Typography>
                <Typography fontWeight={700} color="primary.main" variant="h6">R{grandTotal.toFixed(2)}</Typography>
              </Box>
              {tier && (
                <Alert severity={tier.color === 'success' ? 'success' : 'warning'} sx={{ mb: 2, py: 0.5 }}>
                  <Typography variant="caption">{tier.label}</Typography>
                </Alert>
              )}
              <Button variant="contained" fullWidth size="large" onClick={handleSubmit} disabled={loading || cartItems.length === 0} sx={{ py: 1.5, fontWeight: 700 }}>
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Place Order'}
              </Button>
              <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/catalog')}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
