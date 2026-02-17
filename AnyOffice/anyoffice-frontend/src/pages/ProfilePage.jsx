import React, { useState } from 'react';
import {
  Container, Typography, Card, CardContent, Grid, TextField,
  Button, Box, Divider, Alert, CircularProgress, Avatar, Chip
} from '@mui/material';
import { Person } from '@mui/icons-material';
import apiClient from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import API from '../config/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const res = await apiClient.put(API.USERS.ME, profileForm);
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileSuccess('Profile updated successfully');
      }
    } catch (err) { setProfileError(err.response?.data?.message || 'Update failed'); }
    finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { setPwdError('Passwords do not match'); return; }
    setPwdError('');
    setPwdSuccess('');
    setPwdLoading(true);
    try {
      await apiClient.post(API.USERS.CHANGE_PASSWORD, {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
        confirmPassword: pwdForm.confirmPassword,
      });
      setPwdSuccess('Password changed successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwdError(err.response?.data?.message || 'Password change failed'); }
    finally { setPwdLoading(false); }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Profile overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.6rem' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{user?.firstName} {user?.lastName}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
                <Chip label={user?.role?.replace(/_/g, ' ')} color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Personal Details</Typography>
              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
              <form onSubmit={handleProfileSave}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="First Name" fullWidth required value={profileForm.firstName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} />
                  <TextField label="Last Name" fullWidth required value={profileForm.lastName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} />
                </Box>
                <TextField label="Phone Number" fullWidth value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phoneNumber: e.target.value }))} sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" disabled={profileLoading}>
                  {profileLoading ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Change password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
              {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}
              {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
              <form onSubmit={handlePasswordChange}>
                <TextField label="Current Password" type="password" fullWidth required value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))} sx={{ mb: 2 }} />
                <TextField label="New Password" type="password" fullWidth required value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))} sx={{ mb: 2 }} helperText="Min 6 characters" />
                <TextField label="Confirm New Password" type="password" fullWidth required value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))} sx={{ mb: 2 }} />
                <Button type="submit" variant="outlined" disabled={pwdLoading}>
                  {pwdLoading ? <CircularProgress size={18} color="inherit" /> : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Read-only company info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Organisation Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Company ID</Typography>
                  <Typography variant="body1" fontWeight={500}>{user?.companyId ?? 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Department ID</Typography>
                  <Typography variant="body1" fontWeight={500}>{user?.departmentId ?? 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Role</Typography>
                  <Typography variant="body1" fontWeight={500}>{user?.role?.replace(/_/g, ' ')}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
