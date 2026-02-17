import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Box,
  Menu, MenuItem, Avatar, Divider, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard, Category, ShoppingCart, ListAlt, CheckCircle,
  AccountBalance, People, Store, Inventory, BarChart,
  AccountCircle, Logout, Menu as MenuIcon, AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

const NavLink = ({ to, icon, label, active }) => (
  <Button
    component={Link}
    to={to}
    startIcon={icon}
    sx={{
      color: active ? 'secondary.main' : 'rgba(255,255,255,0.85)',
      borderBottom: active ? '2px solid' : '2px solid transparent',
      borderColor: active ? 'secondary.main' : 'transparent',
      borderRadius: 0,
      px: 1.5,
      py: 1,
      mr: 0.5,
      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
    }}
  >
    {label}
  </Button>
);

const getNavLinks = (role) => {
  const base = [
    { to: '/dashboard', icon: <Dashboard fontSize="small" />, label: 'Dashboard' },
    { to: '/catalog', icon: <Category fontSize="small" />, label: 'Catalog' },
    { to: '/cart', icon: null, label: 'Cart' },
    { to: '/orders', icon: <ListAlt fontSize="small" />, label: 'Orders' },
  ];
  const managerLinks = [
    { to: '/approvals', icon: <CheckCircle fontSize="small" />, label: 'Approvals' },
    { to: '/budget', icon: <AccountBalance fontSize="small" />, label: 'Budget' },
  ];
  const procurementLinks = [
    { to: '/inventory', icon: <Inventory fontSize="small" />, label: 'Inventory' },
    { to: '/analytics', icon: <BarChart fontSize="small" />, label: 'Analytics' },
  ];
  const adminLinks = [
    { to: '/departments', icon: <Store fontSize="small" />, label: 'Departments' },
    { to: '/employees', icon: <People fontSize="small" />, label: 'Employees' },
  ];
  const superAdminLinks = [
    { to: '/admin', icon: <AdminPanelSettings fontSize="small" />, label: 'Admin' },
  ];

  let links = [...base];
  if (['DEPARTMENT_MANAGER', 'PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(role)) {
    links = [...links, ...managerLinks];
  }
  if (['PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(role)) {
    links = [...links, ...procurementLinks];
  }
  if (['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(role)) {
    links = [...links, ...adminLinks];
  }
  if (role === 'SUPER_ADMIN') {
    links = [...links, ...superAdminLinks];
  }
  return links;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = getNavLinks(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const renderDesktopLinks = () =>
    navLinks.map((link) =>
      link.to === '/cart' ? (
        <IconButton
          key="/cart"
          component={Link}
          to="/cart"
          sx={{ color: 'white', mx: 0.5 }}
        >
          <Badge badgeContent={cartCount} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>
      ) : (
        <NavLink key={link.to} to={link.to} icon={link.icon} label={link.label}
          active={location.pathname === link.to} />
      )
    );

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{ textDecoration: 'none', color: 'white', fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.4rem', flexShrink: 0, mr: 3 }}
        >
          AnyOffice
        </Typography>

        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton component={Link} to="/cart" sx={{ color: 'white' }}>
              <Badge badgeContent={cartCount} color="secondary"><ShoppingCart /></Badge>
            </IconButton>
            <NotificationBell />
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {renderDesktopLinks()}
            </Box>
            <NotificationBell />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.9rem' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </>
        )}
      </Toolbar>

      {/* User menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.firstName} {user?.lastName} · {user?.role?.replace('_', ' ')}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
          <AccountCircle fontSize="small" sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation">
          <List>
            {navLinks.filter((l) => l.to !== '/cart').map((link) => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.to}
                  selected={location.pathname === link.to}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile" onClick={() => setDrawerOpen(false)}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
