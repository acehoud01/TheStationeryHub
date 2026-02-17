import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Chip, Alert,
  CircularProgress, Tabs, Tab, Avatar, Grid,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import ChatIcon from '@mui/icons-material/Chat';
import SchoolIcon from '@mui/icons-material/School';
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

const TYPE_CONFIG = {
  ANNOUNCEMENT: { icon: <CampaignIcon />, label: 'Announcement', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  EVENT:        { icon: <EventIcon />,    label: 'Event',        bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  REMINDER:     { icon: <WarningIcon />,  label: 'Reminder',     bg: '#FEF9C3', color: '#854D0E', border: '#FDE68A' },
  URGENT:       { icon: <WarningIcon />,  label: 'Urgent',       bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  GENERAL:      { icon: <ChatIcon />,     label: 'General',      bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' },
};

// ── Loading skeleton ─────────────────────────────────────────────────────────
function MessageSkeleton() {
  return (
    <Box sx={{ background: '#fff', borderRadius: '18px', border: `1px solid ${C.border}`, p: 3 }}>
      {[1, 2, 3].map(i => (
        <Box key={i} sx={{ display: 'flex', gap: 2, mb: i < 3 ? 3 : 0 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: C.parchment, flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ height: 14, borderRadius: 4, background: C.parchment, mb: 1.5, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <Box sx={{ height: 12, borderRadius: 4, background: C.parchment, mb: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <Box sx={{ height: 12, borderRadius: 4, background: C.parchment, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </Box>
        </Box>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </Box>
  );
}

export default function ParentCommunicationsPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [commsBySchool, setCommsBySchool] = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tabIdx,  setTabIdx]  = useState(0);
  const [readMessages, setReadMessages] = useState([]);

  useEffect(() => {
    if (user?.role !== 'PARENT') { navigate('/'); return; }
    // Load read messages from localStorage
    const read = JSON.parse(localStorage.getItem(`readMessages_${user.id}`) || '[]');
    setReadMessages(read);
    fetchComms();
  }, [user, navigate]);

  const fetchComms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.COMMUNICATIONS.PARENT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const comms = res.data.communicationsBySchool || {};
        setCommsBySchool(comms);
        // Store all message IDs for unread count calculation
        const allIds = Object.values(comms).flat().map(c => c.id);
        localStorage.setItem(`allMessages_${user.id}`, JSON.stringify(allIds));
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to load messages'); }
    finally { setLoading(false); }
  };
  
  const markAsRead = (messageId) => {
    if (!readMessages.includes(messageId)) {
      const updated = [...readMessages, messageId];
      setReadMessages(updated);
      localStorage.setItem(`readMessages_${user.id}`, JSON.stringify(updated));
    }
  };

  const schools      = Object.keys(commsBySchool);
  const activeSchool = schools[tabIdx] || null;
  const comms        = activeSchool ? (commsBySchool[activeSchool] || []) : [];
  const totalCount   = Object.values(commsBySchool).reduce((s, a) => s + a.length, 0);

  // Type breakdown for stats
  const urgentCount = Object.values(commsBySchool).flat().filter(c => c.type === 'URGENT').length;

  return (
    <Box sx={{ background: C.cream, minHeight: '100vh', pb: 12 }}>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <Box sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, pt: { xs: 7, md: 10 }, pb: { xs: 5, md: 7 }, mb: 5 }}>
        <Container maxWidth="lg">
          <Chip label="✦ SCHOOL NOTICES"
            sx={{ background: 'rgba(200,164,92,0.2)', color: C.gold, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', mb: 2, border: '1px solid rgba(200,164,92,0.3)' }} />
          <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: '#fff', fontSize: { xs: '2.4rem', md: '3.6rem' }, mb: 1.5 }}>
            School Messages
          </Typography>

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
            {[
              { value: totalCount,       label: 'Total messages' },
              { value: schools.length,   label: `School${schools.length !== 1 ? 's' : ''}` },
              { value: urgentCount || 0, label: 'Urgent notices', warn: urgentCount > 0 },
            ].map(({ value, label, warn }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, fontSize: '2rem', color: warn ? '#FCA5A5' : C.gold, lineHeight: 1 }}>
                  {value}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {!loading && schools.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Box sx={{ width: 96, height: 96, borderRadius: '50%', background: C.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, border: `2px solid ${C.border}` }}>
              <InboxIcon sx={{ fontSize: 46, color: C.border }} />
            </Box>
            <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.stone, mb: 1.5 }}>
              No messages yet
            </Typography>
            <Typography sx={{ color: C.stone, maxWidth: 360, mx: 'auto', lineHeight: 1.8 }}>
              Messages and notices from your children's schools will appear here once they're sent.
            </Typography>
          </Box>
        )}

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {loading && (
          <Box>
            <Box sx={{ height: 52, background: '#fff', borderRadius: '16px', border: `1px solid ${C.border}`, mb: 4 }} />
            <MessageSkeleton />
          </Box>
        )}

        {/* ── Content ──────────────────────────────────────────────────── */}
        {!loading && schools.length > 0 && (
          <>
            {/* School tabs */}
            <Box sx={{ background: '#fff', borderRadius: '16px', border: `1px solid ${C.border}`, mb: 4, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,58,45,0.06)' }}>
              <Tabs
                value={tabIdx}
                onChange={(_, v) => setTabIdx(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 1,
                  '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 54, fontSize: '0.9rem' },
                  '& .Mui-selected': { color: C.forest },
                  '& .MuiTabs-indicator': { background: C.forest, height: 3, borderRadius: '3px 3px 0 0' },
                }}>
                {schools.map((school) => (
                  <Tab key={school} label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon sx={{ fontSize: 16 }} />
                      <span>{school}</span>
                      <Chip
                        label={commsBySchool[school]?.length || 0}
                        size="small"
                        sx={{ height: 18, minWidth: 18, background: C.goldPale, color: C.forest, fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </Box>
                  } />
                ))}
              </Tabs>
            </Box>

            {/* Messages list */}
            {comms.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: C.stone }}>No messages from this school yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {comms.map(comm => {
                  const tc = TYPE_CONFIG[comm.type] || TYPE_CONFIG.GENERAL;
                  const isUnread = !readMessages.includes(comm.id);
                  return (
                    <Card key={comm.id} elevation={0} 
                      onClick={() => markAsRead(comm.id)}
                      sx={{
                        borderRadius: '18px', 
                        border: isUnread ? `2px solid ${tc.color}` : `1px solid ${tc.border}`,
                        background: tc.bg, 
                        boxShadow: isUnread ? '0 4px 16px rgba(27,58,45,0.12)' : '0 2px 8px rgba(27,58,45,0.05)',
                        transition: 'all 0.2s',
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: '0 8px 28px rgba(27,58,45,0.11)', transform: 'translateY(-1px)' },
                      }}>
                      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        {isUnread && (
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#DC2626',
                            border: '2px solid #fff',
                            boxShadow: '0 0 8px rgba(220, 38, 38, 0.5)',
                            animation: 'pulse 2s ease-in-out infinite',
                          }} />
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>

                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                            <Avatar sx={{ width: 44, height: 44, borderRadius: '12px', background: tc.color + '22', flexShrink: 0 }}>
                              {React.cloneElement(tc.icon, { sx: { color: tc.color, fontSize: 22 } })}
                            </Avatar>
                            <Box>
                              {/* Subject + badges */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                                <Typography fontWeight={700} color={C.ink}>{comm.subject || comm.title || 'School Notice'}</Typography>
                                <Chip label={tc.label} size="small"
                                  sx={{ background: tc.color + '22', color: tc.color, fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                                {comm.targetGrades && (
                                  <Chip label={`Gr ${comm.targetGrades}`} size="small"
                                    sx={{ background: C.goldPale, color: C.forest, fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                                )}
                              </Box>

                              {/* Body */}
                              <Typography variant="body2" sx={{ color: C.ink + 'DD', lineHeight: 1.75 }}>
                                {comm.message || comm.content}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Date */}
                          <Typography variant="caption" sx={{ color: tc.color, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, mt: 0.5 }}>
                            {formatDate(comm.createdAt)}
                          </Typography>

                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Container>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
}
