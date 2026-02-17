import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button,
  Chip, CircularProgress, Alert, TextField, InputAdornment, MenuItem, Fab,
  Snackbar, Tooltip, Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useCart } from '../context/CartContext';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8', cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070' };

const CATEGORIES = ['All','Pens','Pencils','Notebooks','Rulers','Erasers','Scissors','Crayons','Markers','Art Supplies','Geometry','Other'];

export default function StationeryCatalogPage() {
  const { addToCart, cartItems } = useCart();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [category, setCat]    = useState('All');
  const [added, setAdded]     = useState({});
  const [snack, setSnack]     = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.STATIONERY.LIST);
      if (res.data.success) setItems(res.data.stationery || []);
    } catch (e) { setError('Failed to load catalog'); }
    finally { setLoading(false); }
  };

  const handleAdd = (item) => {
    addToCart(item);
    setAdded(p => ({ ...p, [item.id]: true }));
    setSnack(`${item.name} added to cart`);
    setTimeout(() => setAdded(p => ({ ...p, [item.id]: false })), 2000);
  };

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category==='All' || i.category?.toLowerCase()===category.toLowerCase();
    return matchSearch && matchCat;
  });

  const cartCount = cartItems?.reduce((s,i) => s+(i.quantity||1), 0) || 0;

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', pb:10 }}>
      {/* Page header */}
      <Box sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, py:{xs:6,md:9}, mb:5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:3 }}>
            <Box>
              <Chip label="✦ STATIONERY CATALOG" sx={{ background:'rgba(200,164,92,0.2)', color:C.gold, fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.06em', mb:2, border:`1px solid rgba(200,164,92,0.3)` }} />
              <Typography variant="h2" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'#fff', fontSize:{xs:'2.4rem',md:'3.6rem'} }}>
                School Supplies
              </Typography>
              <Typography sx={{ color:'rgba(255,255,255,0.65)', mt:1 }}>
                {items.length} quality items for every grade
              </Typography>
            </Box>
            {cartCount > 0 && (
              <Badge badgeContent={cartCount} color="warning">
                <Button component={Link} to="/cart" variant="contained" startIcon={<ShoppingCartIcon/>}
                  sx={{ background:`linear-gradient(135deg, ${C.gold} 0%, #E2C07A 100%)`, color:C.forest, fontWeight:700 }}>
                  View Cart
                </Button>
              </Badge>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Filters */}
        <Box sx={{ display:'flex', gap:2, mb:4, flexWrap:'wrap', alignItems:'center' }}>
          <TextField size="small" placeholder="Search items…" value={search}
            onChange={e=>setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon fontSize="small" sx={{color:C.stone}}/></InputAdornment> }}
            sx={{ width:{xs:'100%',sm:280}, '& .MuiOutlinedInput-root':{ borderRadius:'10px', background:'#fff' } }} />
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', flex:1 }}>
            {CATEGORIES.map(cat => (
              <Chip key={cat} label={cat} onClick={()=>setCat(cat)} size="small"
                sx={{
                  cursor:'pointer', fontWeight:600, fontSize:'0.78rem',
                  background: category===cat ? C.forest : '#fff',
                  color:      category===cat ? '#fff'   : C.stone,
                  border:`1px solid ${category===cat ? C.forest : C.border}`,
                  '&:hover':{ background: category===cat ? C.forestMid : C.parchment },
                }} />
            ))}
          </Box>
        </Box>

        {error   && <Alert severity="error"   sx={{ mb:3, borderRadius:'12px' }}>{error}</Alert>}
        {loading && <Box sx={{ display:'flex', justifyContent:'center', py:10 }}><CircularProgress /></Box>}

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign:'center', py:12 }}>
            <AutoStoriesIcon sx={{ fontSize:72, color:C.border, mb:2 }} />
            <Typography variant="h5" sx={{ fontFamily:'"Cormorant Garamond",serif', color:C.stone }}>No items found</Typography>
            <Button variant="outlined" sx={{ mt:2, borderColor:C.border, color:C.stone }} onClick={()=>{ setSearch(''); setCat('All'); }}>
              Clear filters
            </Button>
          </Box>
        )}

        <Grid container spacing={3}>
          {filtered.map(item => {
            const inCart = added[item.id];
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card elevation={0} sx={{
                  borderRadius:'18px', border:`1px solid ${C.border}`, height:'100%',
                  display:'flex', flexDirection:'column', overflow:'hidden',
                  transition:'all 0.25s', boxShadow:`0 2px 10px rgba(27,58,45,0.06)`,
                  '&:hover':{ boxShadow:`0 12px 36px rgba(27,58,45,0.16)`, transform:'translateY(-3px)', borderColor:C.gold },
                }}>
                  {/* Image area */}
                  <Box sx={{
                    height:160, background:C.parchment, display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative', overflow:'hidden',
                  }}>
                    {item.imageUrl ? (
                      <CardMedia component="img" image={item.imageUrl} alt={item.name}
                        sx={{ height:'100%', width:'100%', objectFit:'cover' }} />
                    ) : (
                      <AutoStoriesIcon sx={{ fontSize:60, color:C.border }} />
                    )}
                    {item.category && (
                      <Chip label={item.category} size="small"
                        sx={{ position:'absolute', top:10, left:10, background:'rgba(27,58,45,0.85)',
                          color:'#fff', fontWeight:600, fontSize:'0.7rem', height:22, backdropFilter:'blur(4px)' }} />
                    )}
                  </Box>

                  <CardContent sx={{ p:2.5, flex:1, display:'flex', flexDirection:'column' }}>
                    <Typography fontWeight={700} color={C.ink} mb={0.5} sx={{ lineHeight:1.4 }}>{item.name}</Typography>
                    {item.description && (
                      <Typography variant="caption" color={C.stone} sx={{ lineHeight:1.6, mb:1.5, display:'block',
                        overflow:'hidden', textOverflow:'ellipsis', WebkitLineClamp:2, WebkitBoxOrient:'vertical', display:'-webkit-box' }}>
                        {item.description}
                      </Typography>
                    )}
                    <Box sx={{ mt:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', pt:1.5,
                      borderTop:`1px solid ${C.border}` }}>
                      <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:'1.25rem', color:C.forest }}>
                        R {(item.price||0).toFixed(2)}
                      </Typography>
                      <Button variant="contained" size="small" onClick={()=>handleAdd(item)}
                        startIcon={inCart ? <CheckIcon fontSize="small"/> : <AddShoppingCartIcon fontSize="small"/>}
                        sx={{
                          borderRadius:'8px', fontWeight:600, fontSize:'0.78rem',
                          background: inCart ? '#15803D' : `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
                          transition:'all 0.2s', minWidth:110,
                        }}>
                        {inCart ? 'Added!' : 'Add to Cart'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <Tooltip title="View Cart">
          <Fab component={Link} to="/cart" size="medium"
            sx={{ position:'fixed', bottom:24, right:24, background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, color:'#fff',
              boxShadow:`0 8px 24px rgba(27,58,45,0.35)` }}>
            <Badge badgeContent={cartCount} color="warning">
              <ShoppingCartIcon />
            </Badge>
          </Fab>
        </Tooltip>
      )}

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={()=>setSnack('')}
        message={snack} anchorOrigin={{ vertical:'bottom', horizontal:'left' }} />
    </Box>
  );
}
