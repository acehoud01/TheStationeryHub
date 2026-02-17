import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, TextField, Chip, CircularProgress, Alert, Badge, InputAdornment
} from '@mui/material';
import { Search, ShoppingCart, AddShoppingCart } from '@mui/icons-material';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import API from '../config/api';

const CatalogPage = () => {
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API.CATALOG.CATEGORIES);
      if (res.data.success) setCategories(res.data.categories || []);
    } catch { }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory
        ? `${API.CATALOG.LIST}?category=${encodeURIComponent(selectedCategory)}`
        : API.CATALOG.LIST;
      const res = await axios.get(url);
      if (res.data.success) setProducts(res.data.items || []);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { fetchProducts(); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API.CATALOG.SEARCH}?q=${encodeURIComponent(search)}`);
      if (res.data.success) setProducts(res.data.items || []);
    } catch { setError('Search failed'); } finally { setLoading(false); }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedIds((prev) => new Set([...prev, product.id]));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(product.id); return s; }), 1500);
  };

  const inCart = (id) => cartItems.some((i) => i.id === id);

  const filtered = search
    ? products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Product Catalog</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Browse and order office supplies for your company</Typography>

      {/* Search */}
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <Button type="submit" variant="contained" sx={{ px: 3 }}>Search</Button>
        {search && <Button onClick={() => { setSearch(''); fetchProducts(); }} variant="outlined">Clear</Button>}
      </Box>

      {/* Category chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip
          label="All"
          onClick={() => setSelectedCategory('')}
          color={!selectedCategory ? 'primary' : 'default'}
          variant={!selectedCategory ? 'filled' : 'outlined'}
        />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setSelectedCategory(cat)}
            color={selectedCategory === cat ? 'primary' : 'default'}
            variant={selectedCategory === cat ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</Typography>
          <Grid container spacing={3}>
            {filtered.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {product.imageUrl ? (
                    <CardMedia component="img" height="160" image={product.imageUrl} alt={product.name} sx={{ objectFit: 'contain', p: 1, bgcolor: 'grey.50' }} />
                  ) : (
                    <Box sx={{ height: 160, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingCart sx={{ fontSize: 48, color: 'grey.400' }} />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom noWrap>{product.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>{product.category}</Typography>
                    {product.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.5 }}>
                        {product.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        R{Number(product.price).toFixed(2)}
                      </Typography>
                      <Chip
                        label={product.available ? 'In Stock' : 'Out of Stock'}
                        color={product.available ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant={addedIds.has(product.id) ? 'contained' : inCart(product.id) ? 'outlined' : 'contained'}
                      color={addedIds.has(product.id) ? 'success' : 'primary'}
                      fullWidth
                      disabled={!product.available}
                      onClick={() => handleAddToCart(product)}
                      startIcon={<AddShoppingCart />}
                      size="small"
                    >
                      {addedIds.has(product.id) ? 'Added!' : inCart(product.id) ? 'Add More' : 'Add to Cart'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {filtered.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <ShoppingCart sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography color="text.secondary">No products found</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default CatalogPage;
