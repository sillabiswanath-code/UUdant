"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Truck, Sprout, Building2, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('producer');
  const [lang, setLang] = useState('eng'); // eng, hin, tel, kan

  const handleMockLogin = (method) => {
    setLoading(true);
    document.cookie = `udant_role=${selectedRole}; path=/`;
    
    setTimeout(() => {
      if (selectedRole === 'producer') router.push('/producer/dashboard');
      else if (selectedRole === 'consumer') router.push('/consumer/dashboard');
      else if (selectedRole === 'udant_admin') router.push('/udant/dashboard');
      else if (selectedRole === 'dpworld_admin') router.push('/dpworld/dashboard');
    }, 1200);
  };

  const t = (eng, hin, tel, kan) => {
    switch (lang) {
      case 'hin': return hin;
      case 'tel': return tel;
      case 'kan': return kan;
      default: return eng;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      {/* Language Toggle Absolute Top Right */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '0.25rem', background: '#1e293b', borderRadius: '4px', padding: '4px' }}>
        {['eng', 'hin', 'tel', 'kan'].map(l => (
          <button 
            key={l}
            className={lang === l ? 'btn btn-primary' : 'btn'} 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: lang === l ? '#e11d48' : 'transparent', color: lang === l ? 'white' : '#94a3b8', border: 'none' }}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', gap: '3rem', alignItems: 'flex-start' }} className="animate-fade-in">
        
        {/* Left Side: Role Selector */}
        <div style={{ flex: 1.2 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white', letterSpacing: '-0.025em' }}>
              UDANT<span style={{ color: '#e11d48' }}>.</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              {t("Select your environment architecture before initializing login.", "लॉगिन प्रारंभ करने से पहले अपने सिस्टम का चयन करें।", "లాగిన్‌ను ప్రారంభించే ముందు మీ వాతావరణాన్ని ఎంచుకోండి.", "ಲಾಗಿನ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಪರಿಸರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.")}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <button 
              onClick={() => setSelectedRole('producer')}
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', background: selectedRole === 'producer' ? 'rgba(225, 29, 72, 0.1)' : '#1e293b', border: selectedRole === 'producer' ? '2px solid #e11d48' : '2px solid #334155', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ color: selectedRole === 'producer' ? '#e11d48' : '#94a3b8' }}>
                <Sprout size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>{t("Producer Portal", "निर्माता पोर्टल", "నిర్మాత పోర్టల్", "ನಿರ್ಮಾಪಕ ಪೋರ್ಟಲ್")}</h3>
              </div>
            </button>

            <button 
              onClick={() => setSelectedRole('consumer')}
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', background: selectedRole === 'consumer' ? 'rgba(225, 29, 72, 0.1)' : '#1e293b', border: selectedRole === 'consumer' ? '2px solid #e11d48' : '2px solid #334155', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ color: selectedRole === 'consumer' ? '#e11d48' : '#94a3b8' }}>
                <Building2 size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>{t("Procurement", "खरीद-फ़रोख़्त", "సేకరణ", "ಖರೀದಿ")}</h3>
              </div>
            </button>

            <button 
              onClick={() => setSelectedRole('udant_admin')}
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', background: selectedRole === 'udant_admin' ? 'rgba(225, 29, 72, 0.1)' : '#1e293b', border: selectedRole === 'udant_admin' ? '2px solid #e11d48' : '2px solid #334155', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ color: selectedRole === 'udant_admin' ? '#e11d48' : '#94a3b8' }}>
                <Shield size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>{t("Udant Admin", "उड़ान व्यवस्थापक", "ఉడాన్ అడ్మిన్", "ಉಡಾನ್ ನಿರ್ವಾಹಕ")}</h3>
              </div>
            </button>

            <button 
              onClick={() => setSelectedRole('dpworld_admin')}
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', background: selectedRole === 'dpworld_admin' ? 'rgba(225, 29, 72, 0.1)' : '#1e293b', border: selectedRole === 'dpworld_admin' ? '2px solid #e11d48' : '2px solid #334155', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ color: selectedRole === 'dpworld_admin' ? '#e11d48' : '#94a3b8' }}>
                <Truck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>{t("DP World Tower", "डीपी वर्ल्ड टावर", "డిపి వరల్డ్ టవర్", "ಡಿಪಿ ವರ್ಲ್ಡ್ ಟವರ್")}</h3>
              </div>
            </button>

          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div style={{ flex: 1 }} className="card">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a' }}>{t("Login Credentials", "लॉगिन विवरण", "లాగిన్ ఆధారాలు", "ಲಾಗಿನ್ ವಿವರಗಳು")}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">{t("Phone Number", "फ़ोन नंबर", "ఫోన్ నంబర్", "ಫೋನ್ ಸಂಖ್ಯೆ")}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" className="input-field" placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
              </div>
            </div>
            
            <div>
              <label className="label">{t("Password (Optional)", "पासवर्ड (वैकल्पिक)", "పాస్‌వర్డ్ (ఐచ్ఛికం)", "ಪಾಸ್ವರ್ಡ್ (ಐಚ್ಛಿಕ)")}</label>
              <input type="password" className="input-field" placeholder="••••••••" defaultValue="password" />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', margin: '0.5rem 0' }}>
              <input type="checkbox" defaultChecked /> {t("Always trust this device", "हमेशा इस डिवाइस पर भरोसा करें", "ఎల్లప్పుడూ ఈ పరికరాన్ని నమ్మండి", "ಯಾವಾಗಲೂ ಈ ಸಾಧನವನ್ನು ನಂಬಿ")}
            </label>

            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', minHeight: '3rem' }} onClick={() => handleMockLogin('phone')}>
              {loading ? (
                <span>{t("Authenticating Enclave...", "प्रमाणीकरण हो रहा है...", "ప్రామాణీకరిస్తోంది...", "ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...")}</span>
              ) : (
                <>{t("Secure Log In", "सुरक्षित लॉगिन", "సురక్షిత లాగిన్", "ಸುರಕ್ಷಿತ ಲಾಗಿನ್")}</>
              )}
            </button>

            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{t("or", "या", "లేదా", "ಅಥವಾ")}</div>

            <button className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', minHeight: '3rem' }} onClick={() => handleMockLogin('google')}>
               <Globe size={18}/> {t("Sign in with Google", "Google से साइन इन करें", "Google తో సైన్ ఇన్ చేయండి", "Google ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
