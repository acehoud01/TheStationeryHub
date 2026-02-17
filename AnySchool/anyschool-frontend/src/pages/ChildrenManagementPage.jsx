import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Typography, Container, Button, TextField, MenuItem,
  Grid, Card, CardContent, CardActions, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, CircularProgress,
  Avatar, Autocomplete, Divider, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ClassIcon from '@mui/icons-material/Class';
import CakeIcon from '@mui/icons-material/Cake';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const C = { forest:'#1B3A2D', forestMid:'#2D5C47', gold:'#C8A45C', goldPale:'#FBF5E8', cream:'#FAF7F2', border:'#E5DED4', stone:'#8C8070', ink:'#1C1814', white:'#FFFFFF' };

const STATUS_MAP = {
  VERIFIED: { label:'Verified',        color:'#15803D', bg:'#DCFCE7', icon:<VerifiedIcon     sx={{fontSize:14}}/> },
  APPROVED: { label:'Approved',        color:'#15803D', bg:'#DCFCE7', icon:<VerifiedIcon     sx={{fontSize:14}}/> },
  PENDING:  { label:'Pending',         color:'#92400E', bg:'#FEF3C7', icon:<PendingIcon      sx={{fontSize:14}}/> },
  REJECTED: { label:'Rejected',        color:'#B91C1C', bg:'#FEE2E2', icon:<PendingIcon      sx={{fontSize:14}}/> },
  UNLINKED: { label:'Unlisted School', color:'#1D4ED8', bg:'#DBEAFE', icon:<HelpOutlineIcon sx={{fontSize:14}}/> },
};

const EMPTY = { name:'', grade:'', dateOfBirth:'', school:null, requestedSchoolName:'' };

export default function ChildrenManagementPage() {
  const [children, setChildren]     = useState([]);
  const [schools,  setSchools]      = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [saving,   setSaving]       = useState(false);
  const [error,    setError]        = useState('');
  const [success,  setSuccess]      = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [schoolMode, setSchoolMode] = useState('existing');
  const [schoolGrades, setSchoolGrades] = useState([]);
  const [form, setForm]             = useState(EMPTY);
  const token   = localStorage.getItem('token');
  const headers = { Authorization:`Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get(API_ENDPOINTS.CHILDREN.LIST, { headers }),
      axios.get(API_ENDPOINTS.SCHOOLS.LIST),
    ]).then(([cr, sr]) => {
      if (cr.data.success) setChildren(cr.data.children || []);
      if (sr.data.success) setSchools(sr.data.schools  || []);
    }).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.school?.grades) setSchoolGrades(form.school.grades.split(',').map(g => g.trim()).filter(Boolean));
    else setSchoolGrades([]);
    setForm(p => ({ ...p, grade:'' }));
  }, [form.school]);

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setSchoolMode('existing'); setDialogOpen(true); setError(''); };
  const openEdit = (child) => {
    setEditingId(child.id);
    setSchoolMode(!child.school && child.requestedSchoolName ? 'requested' : 'existing');
    setForm({ name:child.name||'', grade:child.grade||'', dateOfBirth:child.dateOfBirth||'', school:child.school||null, requestedSchoolName:child.requestedSchoolName||'' });
    setDialogOpen(true); setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim())  { setError('Name is required'); return; }
    if (!form.grade.trim()) { setError('Grade is required'); return; }
    if (schoolMode === 'existing'  && !form.school)                        { setError('Please select a school'); return; }
    if (schoolMode === 'requested' && !form.requestedSchoolName.trim())    { setError('Please enter the school name'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), grade: form.grade.trim(),
      ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
      ...(schoolMode === 'existing' ? { schoolId: form.school.id } : { requestedSchoolName: form.requestedSchoolName.trim() }),
    };
    try {
      if (editingId) {
        const res = await axios.put(API_ENDPOINTS.CHILDREN.UPDATE(editingId), payload, { headers });
        if (res.data.success) { setChildren(p => p.map(c => c.id===editingId ? res.data.child : c)); setSuccess('Child updated'); }
      } else {
        const res = await axios.post(API_ENDPOINTS.CHILDREN.ADD, payload, { headers });
        if (res.data.success) { setChildren(p => [...p, res.data.child]); setSuccess('Child added'); }
      }
      setDialogOpen(false);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(API_ENDPOINTS.CHILDREN.DELETE(id), { headers }); setChildren(p => p.filter(c => c.id!==id)); setDeleteTarget(null); setSuccess('Child removed'); }
    catch { setError('Failed to delete'); }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><CircularProgress sx={{ color:C.forest }} /></Box>;

  return (
    <Box sx={{ background:C.cream, minHeight:'calc(100vh - 68px)', py:5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', mb:5, flexWrap:'wrap', gap:2 }}>
          <Box>
            <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:{xs:'2rem',md:'2.8rem'}, fontWeight:700, color:C.forest, lineHeight:1.1, mb:0.5 }}>
              My Children
            </Typography>
            <Typography sx={{ color:C.stone }}>Manage profiles, school details, and supply orders</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon/>} onClick={openAdd}
            sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px:3, py:1.25, borderRadius:'10px', fontWeight:700 }}>
            Add Child
          </Button>
        </Box>

        {success && <Alert severity="success" sx={{ mb:3, borderRadius:'10px' }} onClose={()=>setSuccess('')}>{success}</Alert>}
        {error && !dialogOpen && <Alert severity="error" sx={{ mb:3, borderRadius:'10px' }} onClose={()=>setError('')}>{error}</Alert>}

        {children.length === 0 ? (
          <Box sx={{ textAlign:'center', py:10 }}>
            <Box sx={{ width:80, height:80, borderRadius:'20px', background:C.goldPale, display:'flex', alignItems:'center', justifyContent:'center', mx:'auto', mb:3 }}>
              <ChildCareIcon sx={{ fontSize:40, color:C.gold }} />
            </Box>
            <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'1.8rem', fontWeight:600, color:C.forest, mb:1 }}>No children yet</Typography>
            <Typography sx={{ color:C.stone, mb:3 }}>Add your children to start ordering school supplies</Typography>
            <Button variant="contained" startIcon={<AddIcon/>} onClick={openAdd}
              sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
              Add Your First Child
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {children.map(child => {
              const st = STATUS_MAP[child.verificationStatus] || STATUS_MAP.PENDING;
              const initials = child.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
              const schoolName = child.school ? child.school.name : child.requestedSchoolName ? `${child.requestedSchoolName} (unlisted)` : '—';
              return (
                <Grid item xs={12} sm={6} lg={4} key={child.id}>
                  <Card sx={{ borderRadius:'16px', border:`1px solid ${C.border}`, boxShadow:'none', overflow:'hidden', display:'flex', flexDirection:'column', background:C.white }}>
                    <Box sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, p:2.5, display:'flex', alignItems:'center', gap:2 }}>
                      <Avatar sx={{ width:48, height:48, fontWeight:700, fontSize:'1.1rem', background:'rgba(200,164,92,0.25)', border:'2px solid rgba(200,164,92,0.5)', color:C.gold }}>
                        {initials}
                      </Avatar>
                      <Box sx={{ flex:1 }}>
                        <Typography sx={{ color:'#fff', fontWeight:700, fontSize:'1rem' }}>{child.name}</Typography>
                        <Chip icon={React.cloneElement(st.icon, {style:{color:st.color}})} label={st.label} size="small"
                          sx={{ background:st.bg, color:st.color, fontWeight:700, height:22, fontSize:'0.7rem', mt:0.3 }} />
                      </Box>
                    </Box>
                    <CardContent sx={{ p:2.5, flex:1 }}>
                      <Box sx={{ display:'flex', flexDirection:'column', gap:1.2 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.25 }}>
                          <ClassIcon sx={{ fontSize:16, color:C.gold }} />
                          <Typography sx={{ fontSize:'0.875rem', color:C.stone }}>Grade <strong style={{color:C.ink}}>{child.grade}</strong></Typography>
                        </Box>
                        {child.dateOfBirth && (
                          <Box sx={{ display:'flex', alignItems:'center', gap:1.25 }}>
                            <CakeIcon sx={{ fontSize:16, color:C.gold }} />
                            <Typography sx={{ fontSize:'0.875rem', color:C.stone }}>
                              {new Date(child.dateOfBirth).toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'})}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display:'flex', alignItems:'flex-start', gap:1.25 }}>
                          <SchoolIcon sx={{ fontSize:16, color:C.gold, mt:'2px' }} />
                          <Typography sx={{ fontSize:'0.875rem', color:C.stone, lineHeight:1.4 }}>{schoolName}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <Divider sx={{ borderColor:C.border }} />
                    <CardActions sx={{ px:2, py:1.25, gap:0.5 }}>
                      <Button component={Link} to={`/children/${child.id}`} size="small" startIcon={<VisibilityIcon/>}
                        sx={{ color:C.forestMid, fontWeight:600, fontSize:'0.8rem', flex:1 }}>View Profile</Button>
                      <Tooltip title="Edit"><IconButton size="small" onClick={()=>openEdit(child)} sx={{color:C.stone}}><EditIcon fontSize="small"/></IconButton></Tooltip>
                      <Tooltip title="Remove"><IconButton size="small" onClick={()=>setDeleteTarget(child)} sx={{color:'#ef4444'}}><DeleteIcon fontSize="small"/></IconButton></Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{sx:{borderRadius:'20px', border:`1px solid ${C.border}`}}}>
        <DialogTitle sx={{p:3, pb:2, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Typography sx={{fontFamily:'"Cormorant Garamond",serif', fontSize:'1.6rem', fontWeight:600, color:C.forest}}>
            {editingId ? 'Edit Child' : 'Add Child'}
          </Typography>
          <IconButton size="small" onClick={()=>setDialogOpen(false)}><CloseIcon/></IconButton>
        </DialogTitle>
        <DialogContent sx={{px:3}}>
          {error && <Alert severity="error" sx={{mb:2.5, borderRadius:'10px'}}>{error}</Alert>}
          <Box sx={{display:'flex', flexDirection:'column', gap:2.5, pt:0.5}}>
            <TextField label="Child's full name" required fullWidth value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <TextField label="Date of birth" type="date" fullWidth value={form.dateOfBirth}
              onChange={e=>setForm({...form,dateOfBirth:e.target.value})}
              InputLabelProps={{shrink:true}} helperText="Optional — shown in profile" />
            <Box>
              {schoolMode === 'existing' ? (
                <Autocomplete options={schools} getOptionLabel={o=>`${o.name}${o.district ? ` — ${o.district}`:''}`}
                  value={form.school} onChange={(_,v)=>setForm({...form,school:v})}
                  renderInput={p=><TextField {...p} label="School" required />}
                  renderOption={(p,o)=>(
                    <Box component="li" {...p}>
                      <Box><Typography variant="body2" fontWeight={600}>{o.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[o.district,o.province].filter(Boolean).join(', ')}{o.grades?` · Grades: ${o.grades}`:''}
                        </Typography>
                      </Box>
                    </Box>
                  )} />
              ) : (
                <TextField label="School name" required fullWidth value={form.requestedSchoolName}
                  onChange={e=>setForm({...form,requestedSchoolName:e.target.value})}
                  helperText="Will be listed as unlisted until verified" />
              )}
              <Typography variant="caption"
                onClick={()=>setSchoolMode(m=>m==='existing'?'requested':'existing')}
                sx={{color:C.forestMid, cursor:'pointer', fontWeight:600, mt:0.75, display:'block', '&:hover':{textDecoration:'underline'}}}>
                {schoolMode==='existing' ? 'School not in the list? Enter it manually →' : '← Choose from existing schools'}
              </Typography>
            </Box>
            {schoolMode === 'existing' ? (
              <TextField select label="Grade" required fullWidth value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}
                disabled={!form.school} helperText={!form.school?'Select a school first':schoolGrades.length>0?`Available: ${schoolGrades.join(', ')}`:'All grades'}>
                {(schoolGrades.length>0?schoolGrades:['R','1','2','3','4','5','6','7','8','9','10','11','12']).map(g=>(
                  <MenuItem key={g} value={g}>Grade {g}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField label="Grade" required fullWidth value={form.grade}
                onChange={e=>setForm({...form,grade:e.target.value})} placeholder="e.g. 5 or Grade R" />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{px:3, pb:3, gap:1.5}}>
          <Button onClick={()=>setDialogOpen(false)} variant="outlined" sx={{borderColor:C.border,color:C.stone}}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}
            startIcon={saving&&<CircularProgress size={16} color="inherit"/>}
            sx={{background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px:3}}>
            {saving?'Saving…':editingId?'Save Changes':'Add Child'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{sx:{borderRadius:'16px'}}}>
        <DialogTitle sx={{fontFamily:'"Cormorant Garamond",serif', fontSize:'1.5rem', fontWeight:600, color:C.forest, pb:1}}>Remove Child</DialogTitle>
        <DialogContent>
          <Typography sx={{color:C.stone}}>Remove <strong>{deleteTarget?.name}</strong> from your account? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{px:3, pb:3, gap:1.5}}>
          <Button onClick={()=>setDeleteTarget(null)} variant="outlined" sx={{borderColor:C.border,color:C.stone}}>Cancel</Button>
          <Button onClick={()=>handleDelete(deleteTarget.id)} variant="contained" color="error">Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
