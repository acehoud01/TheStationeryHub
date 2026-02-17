import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid, Card, CardContent,
  Alert, CircularProgress, Divider,
} from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const C = {
  forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#F5EDD8',
  cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4', ink:'#1C1814', stone:'#8C8070',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_ENDPOINTS.USERS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success && res.data.user) {
          const u = res.data.user;
          setProfile({
            fullName: u.fullName || '',
            email: u.email || '',
            phoneNumber: u.phoneNumber || '',
          });
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    setError('');
    setSuccess('');
    if (!profile.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        {
          fullName: profile.fullName.trim(),
          phoneNumber: profile.phoneNumber.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success && res.data.user) {
        updateUser({ ...user, ...res.data.user });
        setSuccess('Profile updated successfully');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setError('');
    setSuccess('');
    if (!passwords.currentPassword || !passwords.newPassword) {
      setError('All password fields are required');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('Password updated successfully');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', py:5 }}>
      <Container maxWidth="md">
        <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:{xs:'2.2rem',md:'2.8rem'}, fontWeight:700, color:C.forest, mb:1 }}>
          My Profile
        </Typography>
        <Typography sx={{ color:C.stone, mb:4 }}>Update your personal details and password.</Typography>

        {success && <Alert severity="success" sx={{ mb:3, borderRadius:'10px' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb:3, borderRadius:'10px' }} onClose={() => setError('')}>{error}</Alert>}

        <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}`, mb:4 }}>
          <CardContent sx={{ p:3 }}>
            <Typography variant="h6" sx={{ fontWeight:700, color:C.ink, mb:2 }}>Profile Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={profile.email}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box sx={{ display:'flex', justifyContent:'flex-end', mt:3 }}>
              <Button
                variant="contained"
                onClick={handleProfileSave}
                disabled={saving}
                sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, fontWeight:700 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius:'18px', border:`1px solid ${C.border}` }}>
          <CardContent sx={{ p:3 }}>
            <Typography variant="h6" sx={{ fontWeight:700, color:C.ink, mb:2 }}>Change Password</Typography>
            <Divider sx={{ mb:3, borderColor:C.border }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="New Password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box sx={{ display:'flex', justifyContent:'flex-end', mt:3 }}>
              <Button
                variant="outlined"
                onClick={handlePasswordSave}
                disabled={passwordSaving}
                sx={{ borderColor:C.border, color:C.ink, fontWeight:700 }}
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
