import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, Typography, IconButton,
  Avatar, Menu, MenuItem, Divider, Chip, Drawer,
  List, ListItemButton, ListItemText, ListItemIcon, useMediaQuery, Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const C = {
  forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C',
  cream:'#FAF7F2', border:'#E5DED4', ink:'#1C1814',
};

const ROLE_COLORS = {
  PARENT:       { bg:'#DCFCE7', color:'#15803D',  label:'Parent'       },
  DONOR:        { bg:'#DBEAFE', color:'#1D4ED8',  label:'Donor'        },
  SCHOOL_ADMIN: { bg:'#FEF3C7', color:'#92400E',  label:'School Admin' },
  PURCHASING_ADMIN: { bg:'#F3E8FF', color:'#7E22CE', label:'Purchasing Admin' },
  SUPER_ADMIN:  { bg:'#F3E8FF', color:'#7E22CE',  label:'Super Admin'  },
};

const NAV_LINKS = {
  PARENT: [
    { label:'Dashboard',  path:'/parent/dashboard', icon:<DashboardIcon fontSize="small"/> },
    { label:'My Children', path:'/children',      icon:<ChildCareIcon fontSize="small"/> },
    { label:'Catalog',     path:'/stationery',    icon:<AutoStoriesIcon fontSize="small"/> },
    { label:'Orders',      path:'/orders',        icon:<ShoppingCartIcon fontSize="small"/> },
    { label:'Messages',    path:'/communications',icon:<MessageIcon fontSize="small"/> },
  ],
  DONOR: [
    { label:'Dashboard', path:'/donor/dashboard', icon:<DashboardIcon fontSize="small"/> },
    { label:'Catalog',   path:'/stationery',      icon:<AutoStoriesIcon fontSize="small"/> },
    { label:'Schools',   path:'/schools',         icon:<SchoolIcon fontSize="small"/> },
  ],
  SCHOOL_ADMIN: [
    { label:'Dashboard', path:'/school/dashboard',       icon:<DashboardIcon fontSize="small"/> },
    { label:'Onboarding', path:'/school/onboarding',     icon:<SchoolIcon fontSize="small"/> },
    { label:'Catalog',   path:'/stationery',             icon:<AutoStoriesIcon fontSize="small"/> },
    { label:'Messages',  path:'/school/communications',  icon:<MessageIcon fontSize="small"/> },
  ],
  PURCHASING_ADMIN: [
    { label:'Dashboard', path:'/purchasing/dashboard', icon:<DashboardIcon fontSize="small"/> },
    { label:'Orders',    path:'/purchasing/dashboard', icon:<ShoppingCartIcon fontSize="small"/> },
  ],
  SUPER_ADMIN: [
    { label:'Admin Panel', path:'/admin',       icon:<AdminPanelSettingsIcon fontSize="small"/> },
    { label:'Suppliers',   path:'/admin/suppliers', icon:<BusinessIcon fontSize="small"/> },
    { label:'Analytics',   path:'/admin/analytics', icon:<AssessmentIcon fontSize="small"/> },
    { label:'Proposals',   path:'/admin/proposal-generator', icon:<EmailIcon fontSize="small"/> },
    { label:'Schools',     path:'/schools',     icon:<SchoolIcon fontSize="small"/> },
    { label:'Catalog',     path:'/stationery',  icon:<AutoStoriesIcon fontSize="small"/> },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isMobile  = useMediaQuery('(max-width:768px)');
  const [anchorEl, setAnchorEl]   = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Calculate unread messages count
  useEffect(() => {
    if (!user || !isAuthenticated) return;
    const readMessages = JSON.parse(localStorage.getItem(`readMessages_${user.id}`) || '[]');
    const allMessageIds = JSON.parse(localStorage.getItem(`allMessages_${user.id}`) || '[]');
    const unread = allMessageIds.filter(id => !readMessages.includes(id)).length;
    setUnreadCount(unread);
  }, [user, isAuthenticated, location.pathname]);

  const role     = user?.role || null;
  const roleInfo = ROLE_COLORS[role] || null;
  const navLinks = NAV_LINKS[role]   || [
    { label:'Catalog', path:'/stationery', icon:<AutoStoriesIcon fontSize="small"/> },
    { label:'Schools', path:'/schools',    icon:<SchoolIcon fontSize="small"/> },
  ];
  const cartCount = cartItems?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
  const initials  = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getDashboard = () => {
    if (role === 'SCHOOL_ADMIN' && !user?.schoolId) return '/school/onboarding';
    return ({
      PARENT:'/parent/dashboard',
      DONOR:'/donor/dashboard',
      SCHOOL_ADMIN:'/school/dashboard',
      PURCHASING_ADMIN:'/purchasing/dashboard',
      SUPER_ADMIN:'/admin'
    })[role] || '/';
  };

  const handleLogout = () => { setAnchorEl(null); logout(); navigate('/'); };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        background:'rgba(250,247,242,0.95)', backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${C.border}`, color:C.ink, zIndex:1100,
      }}>
        <Toolbar sx={{ minHeight:'68px !important', px:{xs:2,md:4}, gap:2 }}>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display:'flex', alignItems:'center', gap:1.5, textDecoration:'none', flexShrink:0 }}>
            <Box sx={{
              width:36, height:36, borderRadius:'10px',
              background:`linear-gradient(135deg, ${C.forest} 0%, #3D7A60 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <SchoolIcon sx={{ color:C.gold, fontSize:20 }} />
            </Box>
            <Typography sx={{
              fontFamily:'"Cormorant Garamond", serif', fontWeight:700,
              fontSize:'1.35rem', color:C.forest, letterSpacing:'-0.01em',
              display:{xs:'none',sm:'block'},
            }}>AnySchool</Typography>
          </Box>

          {/* Desktop nav */}
          {!isMobile && isAuthenticated && (
            <Box sx={{ display:'flex', gap:0.5, ml:2, flex:1 }}>
              {navLinks.map(link => {
                const showBadge = (link.label === 'Messages' || link.label === 'Communications') && unreadCount > 0;
                return (
                  <Badge key={link.path} badgeContent={showBadge ? unreadCount : 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        background: '#DC2626',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px'
                      }
                    }}>
                    <Button component={Link} to={link.path} size="small" startIcon={link.icon}
                      sx={{
                        color: isActive(link.path) ? C.forest : '#5a5046',
                        fontWeight: isActive(link.path) ? 700 : 500,
                        fontSize:'0.875rem', px:1.5, py:0.75, borderRadius:'8px',
                        background: isActive(link.path) ? 'rgba(27,58,45,0.08)' : 'transparent',
                        '&:hover':{ background:'rgba(27,58,45,0.06)', color:C.forest },
                      }}
                    >{link.label}</Button>
                  </Badge>
                );
              })}
            </Box>
          )}

          <Box sx={{ flex:1 }} />

          {/* Right side */}
          {isAuthenticated ? (
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
              {role !== 'SUPER_ADMIN' && role !== 'PURCHASING_ADMIN' && (
                <IconButton component={Link} to="/cart" sx={{ color:C.forest, position:'relative' }}>
                  <ShoppingCartIcon fontSize="small" />
                  {cartCount > 0 && (
                    <Box sx={{
                      position:'absolute', top:4, right:4,
                      width:16, height:16, borderRadius:'50%',
                      background:C.gold, color:C.forest, fontSize:'0.65rem',
                      fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
                    }}>{cartCount}</Box>
                  )}
                </IconButton>
              )}
              {!isMobile && roleInfo && (
                <Chip label={roleInfo.label} size="small"
                  sx={{ background:roleInfo.bg, color:roleInfo.color, fontWeight:700, height:26 }} />
              )}
              <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p:0.5 }}>
                <Avatar sx={{
                  width:36, height:36, fontSize:'0.85rem', fontWeight:700,
                  background:`linear-gradient(135deg, ${C.forest} 0%, #3D7A60 100%)`,
                  border:`2px solid ${C.gold}`,
                }}>{initials}</Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                PaperProps={{ sx:{ borderRadius:'14px', border:`1px solid ${C.border}`,
                  boxShadow:'0 16px 48px rgba(27,58,45,0.18)', minWidth:220, mt:1 } }}
              >
                <Box sx={{ px:2.5, py:1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} color={C.forest}>{user?.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
                <Divider sx={{ borderColor:C.border }} />
                <MenuItem onClick={() => { setAnchorEl(null); navigate(getDashboard()); }}
                  sx={{ gap:1.5, py:1.25, '&:hover':{ background:'rgba(27,58,45,0.05)' } }}>
                  <DashboardIcon fontSize="small" sx={{ color:C.forest }} />
                  <Typography variant="body2" fontWeight={500}>My Dashboard</Typography>
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                  sx={{ gap:1.5, py:1.25, '&:hover':{ background:'rgba(27,58,45,0.05)' } }}>
                  <PersonIcon fontSize="small" sx={{ color:C.forest }} />
                  <Typography variant="body2" fontWeight={500}>My Profile</Typography>
                </MenuItem>
                <Divider sx={{ borderColor:C.border }} />
                <MenuItem onClick={handleLogout}
                  sx={{ gap:1.5, py:1.25, color:'#B91C1C', '&:hover':{ background:'#FEF2F2' } }}>
                  <LogoutIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>Sign Out</Typography>
                </MenuItem>
              </Menu>
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color:C.forest }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          ) : (
            <Box sx={{ display:'flex', gap:1.5 }}>
              <Button component={Link} to="/login" variant="outlined" size="small"
                sx={{ borderColor:C.forest, color:C.forest }}>Sign In</Button>
              <Button component={Link} to="/register" variant="contained" size="small">
                Get Started
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx:{ width:280, background:C.cream, borderLeft:`1px solid ${C.border}` } }}>
        <Box sx={{ p:3 }}>
          <Typography sx={{ fontFamily:'"Cormorant Garamond", serif', fontWeight:700, fontSize:'1.35rem', color:C.forest, mb:2 }}>
            AnySchool
          </Typography>
          {isAuthenticated && (
            <>
              <Box sx={{ p:2, background:'rgba(27,58,45,0.06)', borderRadius:'12px', mb:2 }}>
                <Typography variant="subtitle2" fontWeight={700}>{user?.fullName}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{user?.email}</Typography>
                {roleInfo && <Chip label={roleInfo.label} size="small" sx={{ mt:0.5, background:roleInfo.bg, color:roleInfo.color, fontWeight:700 }} />}
              </Box>
              <List dense>
                {navLinks.map(link => {
                  const showBadge = (link.label === 'Messages' || link.label === 'Communications') && unreadCount > 0;
                  return (
                    <ListItemButton key={link.path} component={Link} to={link.path}
                      onClick={() => setDrawerOpen(false)} selected={isActive(link.path)}
                      sx={{ borderRadius:'8px', mb:0.5, '&.Mui-selected':{ background:'rgba(27,58,45,0.1)' } }}>
                      <ListItemIcon sx={{ minWidth:36, color:C.forest }}>
                        {showBadge ? (
                          <Badge badgeContent={unreadCount} 
                            sx={{ '& .MuiBadge-badge': { background:'#DC2626', color:'#fff', fontSize:'0.65rem', fontWeight:700 } }}>
                            {link.icon}
                          </Badge>
                        ) : link.icon}
                      </ListItemIcon>
                      <ListItemText primary={link.label} primaryTypographyProps={{ fontSize:'0.9rem', fontWeight:500 }} />
                    </ListItemButton>
                  );
                })}
                <ListItemButton component={Link} to="/profile" onClick={() => setDrawerOpen(false)}
                  sx={{ borderRadius:'8px', mb:0.5 }}>
                  <ListItemIcon sx={{ minWidth:36, color:C.forest }}><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize:'0.9rem', fontWeight:500 }} />
                </ListItemButton>
                <Divider sx={{ my:1, borderColor:C.border }} />
                <ListItemButton onClick={() => { setDrawerOpen(false); handleLogout(); }}
                  sx={{ borderRadius:'8px', color:'#B91C1C' }}>
                  <ListItemIcon sx={{ minWidth:36, color:'#B91C1C' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize:'0.9rem' }} />
                </ListItemButton>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
