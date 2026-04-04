"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Truck, Sprout, Building2, Globe, ArrowRight, Loader2 } from 'lucide-react';

const ROLES = [
  { id: 'producer',     icon: Sprout,    label: { eng: 'Producer Portal',  hin: 'निर्माता पोर्टल',      tel: 'నిర్మాత పోర్టల్',  kan: 'ನಿರ್ಮಾಪಕ ಪೋರ್ಟಲ್' }, desc: 'List crops, track payments, manage harvests' },
  { id: 'consumer',     icon: Building2, label: { eng: 'Procurement',       hin: 'खरीद-फ़रोख़्त',         tel: 'సేకరణ',             kan: 'ಖರೀದಿ'               }, desc: 'Bid on listings, fund escrow, track delivery' },
  { id: 'udant_admin',  icon: Shield,    label: { eng: 'Udant Admin',       hin: 'उड़ान व्यवस्थापक',       tel: 'ఉడాన్ అడ్మిన్',     kan: 'ಉಡಾನ್ ನಿರ್ವಾಹಕ'    }, desc: 'Verify producers, manage FPO aggregation' },
  { id: 'dpworld_admin',icon: Truck,     label: { eng: 'DP World Tower',    hin: 'डीपी वर्ल्ड टावर',      tel: 'డిపి వరల్డ్ టవర్',  kan: 'ಡಿಪಿ ವರ್ಲ್ಡ್ ಟವರ್'  }, desc: 'Control fleet, assign loads, track telemetry' },
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading]           = useState(false);
  const [selectedRole, setSelectedRole] = useState('producer');
  const [lang, setLang]                 = useState('eng');

  const handleLogin = () => {
    setLoading(true);
    document.cookie = `udant_role=${selectedRole}; path=/`;
    setTimeout(() => {
      if      (selectedRole === 'producer')     router.push('/producer/dashboard');
      else if (selectedRole === 'consumer')     router.push('/consumer/dashboard');
      else if (selectedRole === 'udant_admin')  router.push('/udant/dashboard');
      else if (selectedRole === 'dpworld_admin')router.push('/dpworld/dashboard');
    }, 1100);
  };

  const t = (key) => key[lang] || key.eng;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc', color:'#0f172a', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>

      {/* Animated background blobs */}
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%)', pointerEvents:'none', animation:'blobDrift 8s ease-in-out infinite alternate' }}/>
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%)', pointerEvents:'none', animation:'blobDrift 10s ease-in-out infinite alternate-reverse' }}/>

      {/* Language toggle — top right */}
      <div style={{ position:'absolute', top:'1.5rem', right:'1.5rem' }} className="lang-toggle">
        {['eng','hin','tel','kan'].map(l => (
          <button key={l} className={`lang-btn ${lang===l?'active':''}`} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ maxWidth:'820px', width:'100%', display:'flex', gap:'2.5rem', alignItems:'stretch', zIndex:1 }} className="animate-fade-in">

        {/* ── Left: Role selector ── */}
        <div style={{ flex:'1.3', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <h1 style={{ fontSize:'2.75rem', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:'0.5rem' }}>
              UDANT<span style={{ color:'#e11d48' }}>.</span>
            </h1>
            <p style={{ color:'#64748b', fontSize:'0.9rem', lineHeight:1.6 }}>
              {lang==='hin' ? 'लॉगिन प्रारंभ करने से पहले अपना पोर्टल चुनें।' :
               lang==='tel' ? 'లాగిన్ ప్రారంభించే ముందు మీ పోర్టల్ ఎంచుకోండి.' :
               lang==='kan' ? 'ಲಾಗಿನ್ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆ ಮಾಡಿ.' :
               'Agricultural First-Mile Logistics OS · Select your portal to continue.'}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            {ROLES.map((role, i) => {
              const Icon  = role.icon;
              const sel   = selectedRole === role.id;
              return (
                 <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    padding:'1.1rem', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.75rem',
                    background: sel ? 'var(--accent-light)' : '#ffffff',
                    border: sel ? '2px solid #e11d48' : '2px solid #e2e8f0',
                    borderRadius:'12px', textAlign:'left', cursor:'pointer',
                    transition:'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: sel ? '0 0 24px rgba(225,29,72,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
                    transform: sel ? 'scale(1.01)' : 'scale(1)',
                    animation: `cardEntry 0.4s ${i*0.06}s cubic-bezier(0.4,0,0.2,1) both`,
                  }}
                >
                  <div style={{ width:'38px', height:'38px', borderRadius:'10px', background: sel ? 'rgba(225,29,72,0.10)' : '#f1f5f9', border:`1px solid ${sel?'#e11d48':'#e2e8f0'}`, display:'flex', alignItems:'center', justifyContent:'center', color: sel ? '#e11d48' : '#475569', transition:'all 0.2s' }}>
                    <Icon size={20}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.95rem', color: sel ? '#e11d48' : '#0f172a', marginBottom:'0.2rem' }}>
                      {t(role.label)}
                    </div>
                    <div style={{ fontSize:'0.72rem', color: sel ? '#94a3b8' : '#475569', lineHeight:1.4 }}>
                      {role.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status strip */}
          <div style={{ display:'flex', gap:'1.5rem', padding:'0.75rem 1rem', background:'#ffffff', borderRadius:'8px', border:'1px solid #e2e8f0', marginTop:'auto', boxShadow:'0 1px 2px rgba(0,0,0,0.02)' }}>
            {['Logistics Engine','Escrow Layer','Fleet OS'].map(s => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span className="live-dot"/>
                <span style={{ fontSize:'0.72rem', color:'#64748b', fontWeight:600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Auth card ── */}
        <div style={{ flex:1, background:'#ffffff', borderRadius:'16px', padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem', boxShadow:'0 24px 48px rgba(0,0,0,0.3)', animation:'cardEntry 0.4s 0.15s both' }}>
          <div>
            <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'0.4rem' }}>Login Credentials</div>
            <h2 style={{ fontSize:'1.35rem', fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
              {lang==='hin'?'लॉगिन विवरण':lang==='tel'?'లాగిన్ ఆధారాలు':lang==='kan'?'ಲಾಗಿನ್ ವಿವರಗಳು':'Sign in to UDANT'}
            </h2>
          </div>

          <div style={{ height:'1px', background:'#f1f5f9' }}/>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            <div>
              <label className="label">{lang==='hin'?'फ़ोन नंबर':lang==='tel'?'ఫోన్ నంబర్':lang==='kan'?'ಫೋನ್ ಸಂಖ್ಯೆ':'Phone Number'}</label>
              <input type="text" className="input-field" defaultValue="+91 98765 43210" />
            </div>
            <div>
              <label className="label">{lang==='hin'?'पासवर्ड (वैकल्पिक)':lang==='tel'?'పాస్‌వర్డ్ (ఐచ్ఛికం)':lang==='kan'?'ಪಾಸ್‌ವರ್ಡ್ (ಐಚ್ಛಿಕ)':'Password (Optional)'}</label>
              <input type="password" className="input-field" defaultValue="password" />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#64748b', fontSize:'0.8rem', cursor:'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor:'#e11d48' }}/>
              {lang==='hin'?'इस डिवाइस पर भरोसा करें':lang==='tel'?'ఈ పరికరాన్ని నమ్మండి':lang==='kan'?'ಈ ಸಾಧನವನ್ನು ನಂಬಿ':'Trust this device'}
            </label>
          </div>

          <button className="btn btn-primary" style={{ width:'100%', height:'2.75rem', fontSize:'0.9rem', fontWeight:700, borderRadius:'8px', marginTop:'0.25rem' }} onClick={handleLogin} disabled={loading}>
            {loading
              ? <><Loader2 size={16} style={{ animation:'spin 0.8s linear infinite' }}/> Authenticating…</>
              : <>{lang==='hin'?'सुरक्षित लॉगिन':lang==='tel'?'సురక్షిత లాగిన్':lang==='kan'?'ಸುರಕ್ಷಿತ ಲಾಗಿನ್':'Secure Log In'} <ArrowRight size={16}/></>
            }
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', color:'#cbd5e1', fontSize:'0.8rem' }}>
            <div style={{ flex:1, height:'1px', background:'#f1f5f9' }}/> {lang==='hin'?'या':lang==='tel'?'లేదా':lang==='kan'?'ಅಥವಾ':'or'} <div style={{ flex:1, height:'1px', background:'#f1f5f9' }}/>
          </div>

          <button className="btn btn-outline" style={{ width:'100%', height:'2.75rem', borderRadius:'8px', color:'#475569', fontSize:'0.875rem' }} onClick={handleLogin}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {lang==='hin'?'Google से साइन इन':lang==='tel'?'Google తో సైన్ ఇన్':lang==='kan'?'Google ನೊಂದಿಗೆ ಸೈನ್ ಇನ್':'Sign in with Google'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blobDrift { from { transform: translate(0,0) scale(1); } to { transform: translate(3%,4%) scale(1.08); } }
        @keyframes cardEntry { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
