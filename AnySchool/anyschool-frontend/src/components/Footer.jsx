import React from 'react';
import { Box, Container, Typography, Grid, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';

const C = { forest:'#1B3A2D', gold:'#C8A45C', ink:'#1C1814', stone:'#8C8070', border:'#E5DED4' };

export default function Footer() {
  return (
    <Box sx={{ background:C.ink, color:'rgba(255,255,255,0.6)', borderTop:`1px solid rgba(255,255,255,0.06)` }}>
      <Container maxWidth="lg" sx={{ py:{ xs:5, md:7 } }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
              <Box sx={{ width:32, height:32, borderRadius:'8px',
                background:`linear-gradient(135deg, ${C.forest} 0%, #3D7A60 100%)`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <SchoolIcon sx={{ color:C.gold, fontSize:17 }} />
              </Box>
              <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'rgba(255,255,255,0.9)', fontSize:'1.2rem' }}>
                AnySchool
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight:1.8, maxWidth:280 }}>
              Connecting South African families, schools and donors to ensure every child has the supplies they need.
            </Typography>
          </Grid>
          {[
            { title:'Platform', links:[['Home','/'],['Schools','/schools'],['Catalog','/stationery'],['Login','/login'],['Register','/register']] },
            { title:'Roles',    links:[['For Parents','/register'],['For Donors','/register'],['For Schools','/register']] },
          ].map(col => (
            <Grid item xs={6} md={2} key={col.title}>
              <Typography variant="caption" sx={{ color:C.gold, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', fontSize:'0.72rem', mb:2, display:'block' }}>
                {col.title}
              </Typography>
              <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
                {col.links.map(([label, to]) => (
                  <MuiLink key={label} component={Link} to={to}
                    sx={{ color:'rgba(255,255,255,0.55)', fontSize:'0.875rem', textDecoration:'none', transition:'color 0.2s',
                          '&:hover':{ color:'rgba(255,255,255,0.9)' } }}>
                    {label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt:6, pt:4, borderTop:`1px solid rgba(255,255,255,0.08)`, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:2 }}>
          <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.3)' }}>
            © 2025 AnySchool · Building brighter futures, one pencil at a time.
          </Typography>
          <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.3)' }}>
            Made with ❤️ for South African education
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
