import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Card, CardContent, IconButton, Chip,
  Alert, CircularProgress, Dialog, DialogContent, DialogActions,
  TextField, Avatar, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { formatDate } from '../utils/dateHelpers';

const C = {
  forest: '#1B3A2D', forestMid: '#2D5C47', gold: '#C8A45C',
  goldPale: '#F5EDD8', cream: '#FAF7F2', parchment: '#F0EBE0',
  border: '#E5DED4', ink: '#1C1814', stone: '#8C8070',
};

const TYPES = ['ANNOUNCEMENT', 'EVENT', 'REMINDER', 'URGENT', 'GENERAL'];
const TYPE_CONFIG = {
  ANNOUNCEMENT: { icon: <CampaignIcon />, label: 'Announcement', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  EVENT:        { icon: <EventIcon />,    label: 'Event',        bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  REMINDER:     { icon: <WarningIcon />,  label: 'Reminder',     bg: '#FEF9C3', color: '#854D0E', border: '#FDE68A' },
  URGENT:       { icon: <WarningIcon />,  label: 'Urgent',       bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  GENERAL:      { icon: <ChatIcon />,     label: 'General',      bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' },
};

const INIT_FORM = { 
  subject: '', 
  message: '', 
  type: 'ANNOUNCEMENT', 
  targetAudience: 'ALL',
  targetGrades: [],
  targetChildId: null
};

export default function SchoolCommunicationsPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [comms,      setComms]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating,   setCreating]   = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [form,       setForm]       = useState(INIT_FORM);
  
  // Additional states for dropdowns
  const [children,      setChildren]      = useState([]);
  const [schools,       setSchools]       = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchSchools();
    } else if (user?.role !== 'SCHOOL_ADMIN') { 
      navigate('/'); 
      return; 
    } else {
      // School admin - fetch their school's children
      setSelectedSchoolId(user.schoolId);
      fetchChildrenForSchool(user.schoolId);
    }
    fetchComms();
  }, [user, navigate]);

  const fetchSchools = async () => {
    setLoadingSchools(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching schools from:', API_ENDPOINTS.SCHOOLS.LIST);
      const res = await axios.get(API_ENDPOINTS.SCHOOLS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Schools response:', res.data);
      if (res.data?.schools && res.data.schools.length > 0) {
        setSchools(res.data.schools);
        setSelectedSchoolId(res.data.schools[0].id);
        setForm(INIT_FORM);
        fetchChildrenForSchool(res.data.schools[0].id);
      } else {
        console.warn('No schools found in response or response.schools is empty');
        setSchools([]);
      }
    } catch (e) {
      console.error('Failed to load schools:', e.response?.data || e.message);
      setError('Unable to load schools. Please try again.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const fetchChildrenForSchool = async (schoolId) => {
    if (!schoolId) return;
    setLoadingChildren(true);
    try {
      const token = localStorage.getItem('token');
      // Use the children endpoint - the backend should filter based on the school context
      const res = await axios.get(API_ENDPOINTS.CHILDREN.LIST, {
        headers: { Authorization: `Bearer ${token}` },
        params: { schoolId: user?.role === 'SUPER_ADMIN' ? schoolId : undefined }
      });
      if (res.data?.success && res.data.children) {
        // Filter children by the selected school if needed
        let filteredChildren = res.data.children;
        if (user?.role === 'SUPER_ADMIN' && schoolId) {
          filteredChildren = res.data.children.filter(c => c.schoolId === schoolId);
        }
        setChildren(filteredChildren);
        // Extract unique grades from children
        const grades = [...new Set(filteredChildren.map(c => c.grade).filter(Boolean))].sort();
        
        // If no grades from children, fall back to school's grades
        if (grades.length === 0) {
          const school = schools.find(s => s.id === schoolId);
          if (school?.grades) {
            const schoolGrades = school.grades.split(',').map(g => g.trim()).filter(Boolean);
            setAvailableGrades(schoolGrades);
          } else {
            setAvailableGrades([]);
          }
        } else {
          setAvailableGrades(grades);
        }
      } else if (Array.isArray(res.data)) {
        // Handle if response is directly an array
        setChildren(res.data);
        const grades = [...new Set(res.data.map(c => c.grade).filter(Boolean))].sort();
        
        // If no grades from children, fall back to school's grades
        if (grades.length === 0 && schoolId) {
          const school = schools.find(s => s.id === schoolId);
          if (school?.grades) {
            const schoolGrades = school.grades.split(',').map(g => g.trim()).filter(Boolean);
            setAvailableGrades(schoolGrades);
          } else {
            setAvailableGrades([]);
          }
        } else {
          setAvailableGrades(grades);
        }
      }
    } catch (e) {
      console.error('Failed to load children:', e);
      setChildren([]);
      // Try to get grades from school as fallback
      if (schoolId) {
        const school = schools.find(s => s.id === schoolId);
        if (school?.grades) {
          const schoolGrades = school.grades.split(',').map(g => g.trim()).filter(Boolean);
          setAvailableGrades(schoolGrades);
        } else {
          setAvailableGrades([]);
        }
      } else {
        setAvailableGrades([]);
      }
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchoolId(schoolId);
    setForm(INIT_FORM);
    fetchChildrenForSchool(schoolId);
  };

  const fetchComms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.COMMUNICATIONS.SCHOOL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setComms(res.data.communications || []);
    } catch (e) { setError(e.response?.data?.message || 'Failed to load messages'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.message.trim()) { 
      setError('Subject and message are required'); 
      return; 
    }

    // Super Admin must select a school first
    if (user?.role === 'SUPER_ADMIN' && !selectedSchoolId) {
      setError('Please select a school first');
      return;
    }
    
    if (form.targetAudience === 'SPECIFIC_GRADES' && (!Array.isArray(form.targetGrades) || form.targetGrades.length === 0)) {
      setError('Please select at least one grade');
      return;
    }

    if (form.targetAudience === 'SPECIFIC_CHILD' && !form.targetChildId) {
      setError('Please select a child');
      return;
    }

    setCreating(true); 
    setError('');
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        title: form.subject.trim(),
        message: form.message.trim(),
        type: form.type,
        targetAudience: form.targetAudience,
        targetGrades: form.targetAudience === 'SPECIFIC_GRADES' && Array.isArray(form.targetGrades) 
          ? form.targetGrades.join(',') 
          : form.targetAudience === 'SPECIFIC_GRADES' ? form.targetGrades : null,
        targetChildId: form.targetAudience === 'SPECIFIC_CHILD' ? form.targetChildId : null,
        schoolId: user?.role === 'SUPER_ADMIN' ? selectedSchoolId : undefined,
      };
      const res = await axios.post(API_ENDPOINTS.COMMUNICATIONS.CREATE, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        let targetText = '';
        const schoolName = schools.find(s => s.id === selectedSchoolId)?.name || 'selected school';
        if (form.targetAudience === 'ALL') {
          targetText = user?.role === 'SUPER_ADMIN' ? `all parents at ${schoolName}` : 'all parents';
        } else if (form.targetAudience === 'SPECIFIC_GRADES') {
          const gradeDisplay = Array.isArray(form.targetGrades) ? form.targetGrades.join(', ') : form.targetGrades;
          targetText = user?.role === 'SUPER_ADMIN' 
            ? `parents of grades ${gradeDisplay} at ${schoolName}` 
            : `parents of grades ${gradeDisplay}`;
        } else {
          const childName = children.find(c => c.id === form.targetChildId)?.name || `#${form.targetChildId}`;
          targetText = `${childName}`;
        }
        setSuccess(`Message sent to ${targetText}!`);
        setDialogOpen(false); 
        setForm(INIT_FORM); 
        fetchComms();
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to send message'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.COMMUNICATIONS.BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Message deleted');
      fetchComms();
    } catch (e) { setError(e.response?.data?.message || 'Failed to delete'); }
    finally { setDeleting(null); }
  };

  const openDialog = () => { setError(''); setForm(INIT_FORM); setDialogOpen(true); };

  const selectedTC = TYPE_CONFIG[form.type] || TYPE_CONFIG.ANNOUNCEMENT;

  const getTargetLabel = (comm) => {
    switch (comm.targetAudience) {
      case 'SPECIFIC_GRADES':
        return `Grade${comm.targetGrades.includes(',') ? 's' : ''} ${comm.targetGrades}`;
      case 'SPECIFIC_CHILD':
        return `Child #${comm.targetChildId}`;
      case 'ALL':
      default:
        return 'All grades';
    }
  };

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ background: C.cream, minHeight: '100vh' }}>
      <Box sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, pt: { xs: 7, md: 10 }, pb: { xs: 5, md: 7 }, mb: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ height: 28, width: 160, borderRadius: 4, background: 'rgba(255,255,255,0.15)', mb: 2 }} />
          <Box sx={{ height: 52, width: 320, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
        </Container>
      </Box>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: C.forestMid }} /></Box>
      </Container>
    </Box>
  );

  // ── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ background: C.cream, minHeight: '100vh', pb: 12 }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Box sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, pt: { xs: 7, md: 10 }, pb: { xs: 5, md: 7 }, mb: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Chip label="✦ SCHOOL COMMUNICATIONS"
                sx={{ background: 'rgba(200,164,92,0.2)', color: C.gold, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', mb: 2, border: '1px solid rgba(200,164,92,0.3)' }} />
              <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: '#fff', fontSize: { xs: '2.4rem', md: '3.6rem' }, mb: 1.5 }}>
                Messages & Notices
              </Typography>

              {/* Stats row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {[
                  { value: comms.length, label: `message${comms.length !== 1 ? 's' : ''} sent` },
                  { value: comms.filter(c => c.type === 'URGENT').length, label: 'urgent notices' },
                  { value: comms.filter(c => c.targetAudience === 'ALL').length, label: 'school-wide' },
                ].map(({ value, label }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, fontSize: '2rem', color: C.gold, lineHeight: 1 }}>
                      {value}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openDialog}
              sx={{
                background: `linear-gradient(135deg, ${C.gold} 0%, #E2C07A 100%)`,
                color: C.forest, fontWeight: 700, px: 3, py: 1.25,
                boxShadow: '0 4px 16px rgba(200,164,92,0.4)',
                '&:hover': { background: `linear-gradient(135deg, #E2C07A 0%, ${C.gold} 100%)` },
              }}>
              New Message
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {comms.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Box sx={{ width: 96, height: 96, borderRadius: '50%', background: C.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, border: `2px solid ${C.border}` }}>
              <InboxIcon sx={{ fontSize: 46, color: C.border }} />
            </Box>
            <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.stone, mb: 1.5 }}>
              No messages yet
            </Typography>
            <Typography sx={{ color: C.stone, mb: 4, maxWidth: 360, mx: 'auto', lineHeight: 1.8 }}>
              Send your first notice to parents — announcements, events, reminders, and more.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog}
              sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px: 4, py: 1.25 }}>
              Create First Message
            </Button>
          </Box>
        )}

        {/* ── Messages list ────────────────────────────────────────────── */}
        {comms.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {comms.map(comm => {
              const tc = TYPE_CONFIG[comm.type] || TYPE_CONFIG.GENERAL;
              return (
                <Card key={comm.id} elevation={0} sx={{
                  borderRadius: '20px', border: `1px solid ${tc.border}`,
                  background: tc.bg, boxShadow: '0 2px 8px rgba(27,58,45,0.05)',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 8px 28px rgba(27,58,45,0.11)', transform: 'translateY(-1px)' },
                }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                        <Avatar sx={{ width: 44, height: 44, borderRadius: '12px', background: tc.color + '22', flexShrink: 0 }}>
                          {React.cloneElement(tc.icon, { sx: { color: tc.color, fontSize: 22 } })}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          {/* Subject + badges */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                            <Typography fontWeight={700} color={C.ink}>{comm.title}</Typography>
                            <Chip label={tc.label} size="small"
                              sx={{ background: tc.color + '22', color: tc.color, fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                            <Chip
                              icon={<PeopleIcon sx={{ fontSize: '11px !important' }} />}
                              label={getTargetLabel(comm)}
                              size="small"
                              sx={{ background: C.goldPale, color: C.forest, fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                          </Box>

                          {/* Body */}
                          <Typography variant="body2" sx={{ color: C.ink + 'CC', lineHeight: 1.75, mb: 1 }}>
                            {comm.message}
                          </Typography>

                          {/* Date */}
                          <Typography variant="caption" sx={{ color: tc.color, fontWeight: 600 }}>
                            Sent {formatDate(comm.createdAt)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Delete */}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(comm.id)}
                        disabled={deleting === comm.id}
                        sx={{ color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: '8px', flexShrink: 0, opacity: 0.75, '&:hover': { opacity: 1, background: '#FEF2F2' } }}>
                        {deleting === comm.id
                          ? <CircularProgress size={16} sx={{ color: '#EF4444' }} />
                          : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>

      {/* ══════════════════════════════════════════════════════════════════
          DIALOG: Compose new message
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', border: `1px solid ${C.border}`, boxShadow: '0 24px 64px rgba(27,58,45,0.18)', overflow: 'hidden' } }}>

        {/* Gradient header */}
        <Box sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(200,164,92,0.25)', border: '1px solid rgba(200,164,92,0.3)' }}>
            <SendIcon sx={{ color: C.gold, fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              New School Message
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Target specific groups or send school-wide
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* School selector for SUPER_ADMIN */}
            {user?.role === 'SUPER_ADMIN' && (
              <Box>
                <FormControl fullWidth disabled={loadingSchools}>
                  <InputLabel>Select School</InputLabel>
                  <Select
                    value={selectedSchoolId || ''}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    label="Select School"
                  >
                    {schools.length === 0 && !loadingSchools && (
                      <MenuItem disabled>No schools available</MenuItem>
                    )}
                    {schools.map(school => (
                      <MenuItem key={school.id} value={school.id}>
                        {school.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {loadingSchools && (
                  <Typography variant="caption" sx={{ color: C.stone, mt: 1, display: 'block' }}>
                    Loading schools...
                  </Typography>
                )}
              </Box>
            )}

            {/* Message type */}
            <Box>
              <Typography variant="caption" sx={{ color: C.stone, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                Message Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {TYPES.map(t => {
                  const tc = TYPE_CONFIG[t];
                  const active = form.type === t;
                  return (
                    <Chip
                      key={t}
                      label={tc.label}
                      icon={React.cloneElement(tc.icon, { sx: { fontSize: '13px !important', color: `${active ? '#fff' : tc.color} !important` } })}
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      sx={{
                        cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s',
                        background: active ? tc.color : tc.bg,
                        color: active ? '#fff' : tc.color,
                        border: `1px solid ${active ? tc.color : tc.border}`,
                        boxShadow: active ? `0 4px 12px ${tc.color}44` : 'none',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Subject */}
            <TextField
              label="Subject"
              value={form.subject}
              required
              fullWidth
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="e.g. Parent evening this Thursday"
            />

            {/* Message body */}
            <TextField
              label="Message"
              value={form.message}
              required
              fullWidth
              multiline
              rows={5}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Write your message to parents here…"
            />

            {/* Target Audience Selection */}
            <Box>
              <Typography variant="caption" sx={{ color: C.stone, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                Send to (Target Audience)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(user?.role === 'SUPER_ADMIN' 
                  ? [
                      { value: 'ALL', label: 'Whole School', icon: '🏫' }
                    ]
                  : [
                      { value: 'ALL', label: 'Whole School', icon: '🏫' },
                      { value: 'SPECIFIC_GRADES', label: 'Specific Grades', icon: '📚' },
                      { value: 'SPECIFIC_CHILD', label: 'Individual Child', icon: '👤' }
                    ]
                ).map(opt => {
                  const active = form.targetAudience === opt.value;
                  return (
                    <Chip
                      key={opt.value}
                      label={`${opt.icon} ${opt.label}`}
                      onClick={() => setForm(p => ({ 
                        ...p, 
                        targetAudience: opt.value,
                        targetGrades: '',
                        targetChildId: null 
                      }))}
                      sx={{
                        cursor: 'pointer', 
                        fontWeight: 600, 
                        transition: 'all 0.15s',
                        background: active ? C.forest : 'transparent',
                        color: active ? '#fff' : C.forest,
                        border: `2px solid ${active ? C.forest : C.border}`,
                      }}
                    />
                  );
                })}
              </Box>
              {user?.role === 'SUPER_ADMIN' && (
                <Typography variant="caption" sx={{ color: C.stone, mt: 1, display: 'block' }}>
                  💡 Select a specific school above to send messages to that entire school
                </Typography>
              )}
            </Box>

            {/* Show grades selector if SPECIFIC_GRADES selected */}
            {form.targetAudience === 'SPECIFIC_GRADES' && (
              <Box>
                <Typography variant="caption" sx={{ color: C.stone, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
                  Select Grades
                </Typography>
                {loadingChildren ? (
                  <CircularProgress size={24} />
                ) : availableGrades.length === 0 ? (
                  <Typography variant="body2" sx={{ color: C.stone }}>No grades available</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {availableGrades.map(grade => (
                      <FormControlLabel
                        key={grade}
                        control={
                          <Checkbox
                            checked={form.targetGrades.includes(grade)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(p => ({ ...p, targetGrades: [...p.targetGrades, grade] }));
                              } else {
                                setForm(p => ({ ...p, targetGrades: p.targetGrades.filter(g => g !== grade) }));
                              }
                            }}
                          />
                        }
                        label={`Grade ${grade}`}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Show child selector if SPECIFIC_CHILD selected */}
            {form.targetAudience === 'SPECIFIC_CHILD' && (
              <FormControl fullWidth>
                <InputLabel>Select Child/Learner</InputLabel>
                <Select
                  value={form.targetChildId || ''}
                  onChange={(e) => setForm(p => ({ ...p, targetChildId: e.target.value }))}
                  label="Select Child/Learner"
                  disabled={loadingChildren || children.length === 0}
                >
                  {children.map(child => (
                    <MenuItem key={child.id} value={child.id}>
                      {child.name} (Grade {child.grade})
                    </MenuItem>
                  ))}
                </Select>
                {children.length === 0 && !loadingChildren && (
                  <Typography variant="caption" sx={{ color: C.stone, mt: 1 }}>
                    No learners available for this school
                  </Typography>
                )}
              </FormControl>
            )}

            {/* Preview badge */}
            {(form.subject || form.type) && (
              <Box sx={{ p: 2, background: selectedTC.bg, borderRadius: '12px', border: `1px solid ${selectedTC.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, borderRadius: '8px', background: selectedTC.color + '22' }}>
                  {React.cloneElement(selectedTC.icon, { sx: { color: selectedTC.color, fontSize: 16 } })}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700} color={C.ink}>
                    {form.subject || 'Your subject here'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: selectedTC.color, fontWeight: 600 }}>
                    {selectedTC.label} · {
                      form.targetAudience === 'ALL' ? 'All grades' :
                      form.targetAudience === 'SPECIFIC_GRADES' ? `Grade${Array.isArray(form.targetGrades) && form.targetGrades.length > 1 ? 's' : ''} ${Array.isArray(form.targetGrades) ? form.targetGrades.join(', ') : '(select)'}` :
                      form.targetAudience === 'SPECIFIC_CHILD' ? children.find(c => c.id === form.targetChildId)?.name || '(select learner)' : ''
                    }
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setDialogOpen(false); setForm(INIT_FORM); }} sx={{ color: C.stone }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={creating}
            startIcon={creating ? null : <SendIcon sx={{ fontSize: 16 }} />}
            sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px: 3, py: 1.1 }}>
            {creating ? <><CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} /> Sending…</> : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}