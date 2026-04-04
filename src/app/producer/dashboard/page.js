"use client";

import { useState, useEffect, useRef } from 'react';
import { useGlobalData } from '@/context/GlobalState';
import { Leaf, Plus, Phone, MessageSquare, CheckCircle, ShieldAlert, LogOut, X, Mic, RefreshCw, FileText, IndianRupee, Send, TrendingUp } from 'lucide-react';

const INITIAL_MESSAGES = [
  { from: 'udant', name: 'Udant Team', text: 'Please upload clear pictures of your Wheat stock so we can complete your verification process.' },
  { from: 'me', name: 'You', text: 'I have added the details. Let me know.' },
];

export default function ProducerDashboard() {
  const { users, listings, contracts, addListing, updateListing } = useGlobalData();
  const [lang, setLang] = useState('eng');
  const [farmer, setFarmer] = useState(null);
  const [activeTab, setActiveTab] = useState('crops');
  const [showAddListing, setShowAddListing] = useState(false);
  const [showCropDetails, setShowCropDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showIVR, setShowIVR] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [newListing, setNewListing] = useState({ crop_type: '', quantity_tonnes: '', quality_grade: 'Standard', price_band: '', harvest_date: '' });
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [msgInput, setMsgInput] = useState('');
  const msgEndRef = useRef(null);

  useEffect(() => {
    const userRole = document.cookie.includes('udant_role=producer');
    if (!userRole) { if (typeof window !== 'undefined') window.location.href = '/'; return; }
    setFarmer(users.find(u => u.id === 'usr_1'));
  }, [users]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleLogout = () => {
    document.cookie = "udant_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  const t = (eng, hin, tel, kan) => {
    switch (lang) { case 'hin': return hin; case 'tel': return tel; case 'kan': return kan; default: return eng; }
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, { from: 'me', name: 'You', text: msgInput.trim() }]);
    setMsgInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'udant', name: 'Udant Team', text: 'Got it! Our team will review and respond shortly.' }]);
    }, 1200);
  };

  const parseHindiVoice = (txt) => {
    let crop = "Misc Crop"; let quantity = "10"; let price = "2000";
    const lower = txt.toLowerCase();
    if (lower.includes('gehu') || lower.includes('wheat') || lower.includes('गेहूं')) crop = 'Wheat';
    if (lower.includes('chawal') || lower.includes('rice') || lower.includes('चावल')) crop = 'Rice';
    if (lower.includes('kapas') || lower.includes('cotton') || lower.includes('कपास')) crop = 'Cotton';
    if (lower.includes('tamatar') || lower.includes('tomato') || lower.includes('टमाटर')) crop = 'Tomato';
    if (lower.includes('ganna') || lower.includes('sugarcane') || lower.includes('गन्ना')) crop = 'Sugarcane';
    const numbers = txt.match(/\d+/g);
    if (numbers && numbers.length >= 1) quantity = numbers[0];
    if (numbers && numbers.length >= 2) price = numbers[1];
    return { crop, quantity, price };
  };

  const handleVoiceListing = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition not supported. Please use Chrome."); return;
    }
    setIsListening(true);
    setSpeechText(t("Listening... Say crop, volume, and price", "सुन रहा हूँ... फसल, मात्रा और कीमत बताएं", "వినడం... పంట, పరిమాణం మరియు ధర చెప్పండి", "ಆಲಿಸುತ್ತಿದೆ... ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಬೆಲೆಯನ್ನು ಹೇಳಿ"));
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setSpeechText(result); setIsListening(false);
      const parsed = parseHindiVoice(result);
      setNewListing({ crop_type: parsed.crop, quantity_tonnes: parsed.quantity, quality_grade: 'Premium', price_band: parsed.price, harvest_date: new Date().toISOString().split('T')[0] });
      setTimeout(() => { setShowIVR(false); setShowAddListing(true); }, 2000);
    };
    recognition.onerror = () => {
      setSpeechText(t("Error recognizing voice.", "आवाज़ पहचानने में त्रुटि।", "వాయిస్‌ని గుర్తించడంలో లోపం.", "ಧ್ವನಿಯನ್ನು ಗుರుತಿಸುವಲ್ಲಿ ದೋಷ."));
      setIsListening(false); setTimeout(() => setShowIVR(false), 2000);
    };
    recognition.start();
  };

  const startEditing = (listing) => { setEditForm({...listing}); setIsEditing(true); };
  const saveEdit = () => { updateListing(editForm.id, editForm); setShowCropDetails({...editForm}); setIsEditing(false); };

  const handleAddListing = () => {
    if (!newListing.crop_type.trim()) { alert('Please enter a crop type.'); return; }
    if (!newListing.quantity_tonnes || Number(newListing.quantity_tonnes) <= 0) { alert('Please enter a valid quantity.'); return; }
    if (!newListing.price_band || Number(newListing.price_band) <= 0) { alert('Please enter a valid price.'); return; }
    if (!newListing.harvest_date) { alert('Please select a harvest date.'); return; }
    addListing({ ...newListing, producer_id: farmer.id, location: { lat: farmer.lat || 20.0, lng: farmer.lng || 76.0 } });
    setShowAddListing(false);
    setNewListing({ crop_type: '', quantity_tonnes: '', quality_grade: 'Standard', price_band: '', harvest_date: '' });
  };

  if (!farmer) return (
    <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid #e2e8f0', borderTopColor:'#e11d48', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const myListings = listings.filter(l => l.producer_id === farmer?.id);
  const myFarmerContracts = contracts.filter(c => myListings.some(l => l.id === c.listing_id));
  const totalRevenue = myFarmerContracts.filter(c => c.status === 'delivered').reduce((acc, c) => acc + (c.bid_price * (myListings.find(l=>l.id===c.listing_id)?.quantity_tonnes||1)), 0);
  const lockedEscrow = myFarmerContracts.filter(c => c.status !== 'delivered').reduce((acc, c) => acc + (c.bid_price * (myListings.find(l=>l.id===c.listing_id)?.quantity_tonnes||1)), 0);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header" style={{ color: 'var(--accent-color)' }}>UDANT</div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab==='crops'?'active':''}`} onClick={()=>setActiveTab('crops')} style={{cursor:'pointer'}}><Leaf size={20}/> {t('My Crops','मेरी फसलें','నా పంటలు','ನನ್ನ ಬೆಳೆಗಳು')}</div>
          <div className={`nav-item ${activeTab==='orders'?'active':''}`} onClick={()=>setActiveTab('orders')} style={{cursor:'pointer'}}><FileText size={20}/> {t('Supply Orders','आपूर्ति आदेश','సరఫరా ఆర్డర్లు','ಪೂರೈಕೆ ಆದೇಶಗಳು')}</div>
          <div className={`nav-item ${activeTab==='ledger'?'active':''}`} onClick={()=>setActiveTab('ledger')} style={{cursor:'pointer'}}><IndianRupee size={20}/> {t('Payments Ledger','भुगतान बहीखाता','చెల్లింపుల లెడ్జర్','ಪಾವತಿ ಲೆಡ್ಜರ್')}</div>
          <div className={`nav-item ${activeTab==='messages'?'active':''}`} onClick={()=>setActiveTab('messages')} style={{cursor:'pointer'}}><MessageSquare size={20}/> {t('Messages','संदेश','సందేశాలు','ಸಂದೇಶಗಳು')}</div>
          <div className="nav-item" onClick={()=>setShowIVR(true)} style={{cursor:'pointer'}}><Phone size={20}/> {t('Call to List (IVR)','लिस्टिंग के लिए कॉल','జాబితా కోసం కాల్','ಪಟ್ಟಿ ಮಾಡಲು ಕರೆ')}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
            <h2 className="page-title" style={{marginBottom:0}}>
              {t('Producer Dashboard','निर्माता डैशबोर्ड','నిర్మాత డాష్బోర్డ్','ನಿರ್ಮಾಪಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್')}
            </h2>
            {farmer.verification_score >= 80 ? (
              <span className="badge badge-success" style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>
                <CheckCircle size={14}/> {t('Verified','सत्यापित','ధృవీకరించబడింది','ಪರಿಶೀಲಿಸಲಾಗಿದೆ')} ({farmer.verification_score})
              </span>
            ) : (
              <span className="badge badge-warning" style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>
                <ShieldAlert size={14}/> {t('Pending Verification','सत्यापन लंबित','ధృవీకరణ పెండింగ్','ಪರಿಶೀಲನೆ ಬಾಕಿ')} ({farmer.verification_score})
              </span>
            )}
          </div>
          <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
            <div className="lang-toggle">
              {['eng','hin','tel','kan'].map(l => (
                <button key={l} className={`lang-btn ${lang===l?'active':''}`} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={handleLogout} style={{padding:'0.5rem'}} title="Logout"><LogOut size={18}/></button>
          </div>
        </div>

        <div className="page-content animate-fade-in" style={{height:'calc(100vh - 64px)', overflowY:'auto'}}>

          {/* ── Crops Tab ── */}
          {activeTab === 'crops' && (
            <>
              {/* KPI Row */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem', marginBottom:'2rem'}}>
                {[
                  { label: t('Total Listings','कुल लिस्टिंग','మొత్తం జాబితాలు','ಒಟ್ಟು ಪಟ್ಟಿಗಳು'), value: myListings.length, color: 'var(--accent-color)' },
                  { label: t('Active Contracts','सक्रिय अनुबंध','చురుకైన ఒప్పందాలు','ಸಕ್ರಿಯ ಒಪ್ಪಂದಗಳು'), value: myFarmerContracts.filter(c=>c.status!=='delivered').length, color: 'var(--warning-color)' },
                  { label: t('Cleared Revenue','साफ़ राजस्व','క్లియర్ రెవెన్యూ','ತೆರವಾದ ರಾಜಸ್ವ'), value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'var(--success-color)' },
                ].map((kpi, i) => (
                  <div key={i} className="kpi-card" style={{animationDelay:`${i*0.08}s`}}>
                    <div style={{color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>{kpi.label}</div>
                    <div style={{fontSize:'2rem', fontWeight:800, color:kpi.color}}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                <h3 style={{fontSize:'1.125rem', fontWeight:600}}>{t('Available Stock & Future Harvests','उपलब्ध स्टॉक','అందుబాటులో ఉన్న స్టాక్','ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್')}</h3>
                <button className="btn btn-primary" onClick={()=>setShowAddListing(true)}><Plus size={18}/> {t('Add Listing','लिस्टिंग जोड़ें','కలుపుము','ಸೇರಿಸು')}</button>
              </div>

              {farmer.verification_score < 80 && (
                <div style={{background:'#fffbeb', borderLeft:'4px solid #f59e0b', padding:'1rem', marginBottom:'1.5rem', borderRadius:'6px', animation:'fadeSlideUp 0.4s both'}}>
                  <strong>{t('Verification Pending','सत्यापन लंबित','ధృవీకరణ పెండింగ్','ಪರಿಶೀಲನೆ ಬಾಕಿ')}</strong>
                  <p style={{fontSize:'0.875rem', marginTop:'0.25rem'}}>An Udant operations manager will review your profile shortly. Unverified listings may have limited visibility.</p>
                </div>
              )}

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.25rem'}}>
                {myListings.length === 0 && <p style={{color:'var(--text-secondary)'}}>No crops listed yet. Click "Add Listing" to get started.</p>}
                {myListings.map((listing, i) => (
                  <div key={listing.id} className="card card-hover listing-card" style={{animationDelay:`${i*0.07}s`, display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <h4 style={{fontSize:'1.1rem', fontWeight:700}}>{listing.crop_type}</h4>
                      <span className={`badge ${listing.status==='contracted'?'badge-success':'badge-neutral'}`}>{listing.status.toUpperCase()}</span>
                    </div>
                    <div style={{color:'var(--text-secondary)', fontSize:'0.875rem', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
                      <p><strong>{t('Quantity','मात्रा','పరిమాణం','ಪ್ರಮಾಣ')}:</strong> {listing.quantity_tonnes} T</p>
                      <p><strong>{t('Price','कीमत','ధర','ಬೆಲೆ')}:</strong> ₹{listing.price_band} / T</p>
                      <p><strong>{t('Harvest','फसल','కోత','ಕೊಯ್ಲು')}:</strong> {listing.harvest_date}</p>
                    </div>
                    <button className="btn btn-outline" style={{marginTop:'auto'}} onClick={()=>setShowCropDetails(listing)}>
                      {t('View & Edit','विवरण देखें','చూడండి & సవరించండి','ವೀಕ್ಷಿಸಿ & ಸಂಪಾದಿಸಿ')}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Orders Tab ── */}
          {activeTab === 'orders' && (
            <div style={{maxWidth:'900px'}}>
              <h3 style={{fontSize:'1.5rem', fontWeight:600, marginBottom:'2rem'}}>{t('Procurement Supply Tracker','खरीद आपूर्ति ट्रैकर','ప్రొక్యూర్‌మెంట్ సప్లై ట్రాకర్','ಖರೀದಿ ಪೂರೈಕೆ ಟ್ರ್ಯಾಕರ್')}</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                {myFarmerContracts.length === 0 && <p style={{color:'var(--text-secondary)'}}>No active supply orders yet.</p>}
                {myFarmerContracts.map((contract, i) => {
                  const linkedListing = myListings.find(l => l.id === contract.listing_id);
                  return (
                    <div key={contract.id} className="card card-hover animate-fade-in" style={{animationDelay:`${i*0.08}s`}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <div>
                          <h4 style={{fontWeight:600, fontSize:'1.1rem'}}>{linkedListing?.crop_type} ({linkedListing?.quantity_tonnes} T)</h4>
                          <span style={{fontSize:'0.875rem', color:'var(--text-secondary)'}}>Order ID: {contract.id} • Buyer: {users.find(u=>u.id===contract.buyer_id)?.name}</span>
                        </div>
                        <span className={`badge ${contract.status==='delivered'?'badge-success':'badge-warning'}`}>{contract.status.toUpperCase()}</span>
                      </div>
                      <div style={{background:'#f8fafc', padding:'1rem', borderRadius:'8px'}}>
                        <strong>Logistics Trace:</strong>
                        {contract.status === 'delivered' ? (
                          <p style={{fontSize:'0.875rem', color:'var(--text-secondary)', marginTop:'0.25rem'}}>Successfully transported and confirmed received by DP World.</p>
                        ) : contract.status === 'transit' ? (
                          <p style={{fontSize:'0.875rem', color:'var(--text-secondary)', marginTop:'0.25rem'}}>A DP World truck has picked up your load and is currently en route.</p>
                        ) : (
                          <p style={{fontSize:'0.875rem', color:'var(--text-secondary)', marginTop:'0.25rem'}}>Awaiting DP World truck assignation. Prepare goods for pickup.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Ledger Tab ── */}
          {activeTab === 'ledger' && (
            <div style={{maxWidth:'900px'}}>
              <h3 style={{fontSize:'1.5rem', fontWeight:600, marginBottom:'2rem'}}>{t('Escrow Payments & Ledger','एस्क्रो भुगतान और बहीखाता','ఎస్క్రో చెల్లింపులు & లెడ్జర్','ಎಸ್ಕ್ರೊ ಪಾವತಿಗಳು & ಲೆಡ್ಜರ್')}</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.25rem', marginBottom:'2rem'}}>
                <div className="kpi-card">
                  <div style={{color:'var(--text-secondary)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>{t('Cleared Funds','साफ़ फंड','క్లియర్ నిధులు','ತೆರವಾದ ನಿಧಿ')}</div>
                  <div style={{fontSize:'2rem', fontWeight:800, color:'var(--success-color)'}}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                </div>
                <div className="kpi-card">
                  <div style={{color:'var(--text-secondary)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem'}}>{t('Locked In Escrow','ट्रांजिट में लॉक','ఎస్క్రోలో లాక్','ಎಸ್ಕ್ರೋದಲ್ಲಿ ಲಾಕ್')}</div>
                  <div style={{fontSize:'2rem', fontWeight:800, color:'var(--warning-color)'}}>₹{lockedEscrow.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="card">
                <h4 style={{fontWeight:600, marginBottom:'1rem'}}>Transaction History</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Contract Ref</th>
                      <th>Amount</th>
                      <th>Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFarmerContracts.map(c => {
                      const qty = myListings.find(l=>l.id===c.listing_id)?.quantity_tonnes || 1;
                      const amt = c.bid_price * qty;
                      return (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td style={{fontWeight:600}}>₹{amt.toLocaleString('en-IN')}</td>
                          <td>
                            {c.status === 'delivered' ? (
                              <span style={{color:'var(--success-color)', display:'flex', alignItems:'center', gap:'0.25rem'}}><CheckCircle size={14}/> Funds Settled via UPI</span>
                            ) : (
                              <span style={{color:'var(--warning-color)', display:'flex', alignItems:'center', gap:'0.25rem'}}><RefreshCw size={14}/> Locked in Dispatch</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Messages Tab ── */}
          {activeTab === 'messages' && (
            <div className="card" style={{height:'520px', display:'flex', flexDirection:'column', maxWidth:'700px'}}>
              <div style={{borderBottom:'1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1rem'}}>
                <h3 style={{fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <span className="live-dot"/>
                  {t('Udant Support & Buyers','उड़ान सहायता एवं खरीदार','ఉడాన్ సపోర్ట్ & బయర్స్','ಉಡಾನ್ ಬೆಂಬಲ & ಖರೀದಿದಾರರು')}
                </h3>
              </div>
              <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.75rem', paddingRight:'0.5rem'}}>
                {messages.map((msg, i) => (
                  <div key={i} className={msg.from === 'me' ? 'chat-bubble-out' : 'chat-bubble-in'}>
                    <strong style={{fontSize:'0.75rem', display:'block', marginBottom:'0.2rem', opacity:0.7}}>{msg.name}</strong>
                    {msg.text}
                  </div>
                ))}
                <div ref={msgEndRef}/>
              </div>
              <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t('Type a message...','संदेश लिखें...','సందేశం టైప్ చేయండి...','ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...')}
                  value={msgInput}
                  onChange={e=>setMsgInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage} style={{padding:'0.5rem 1rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                  <Send size={16}/> {t('Send','भेजें','పంపు','ಕಳುಹಿಸಿ')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── IVR Modal ── */}
      {showIVR && (
        <div className="modal-overlay">
          <div className="modal-box" style={{textAlign:'center', maxWidth: '450px'}}>
            <div style={{background:isListening?'#e11d48':'#f1f5f9', width:'64px', height:'64px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:isListening?'white':'#94a3b8', margin:'0 auto 1.5rem auto', transition:'all 0.3s', boxShadow:isListening?'0 0 0 16px rgba(225,29,72,0.12)':'none'}}>
              <Mic size={32}/>
            </div>
            <h3 style={{fontSize:'1.25rem', fontWeight:700, marginBottom:'0.75rem'}}>{t('Voice-to-Listing Active','वॉयस-टू-लिस्टिंग सक्रिय','వాయిస్-టు-లిస్టింగ్ యాక్టివ్','ಧ್ವನಿಯಿಂದ ಪಟ್ಟಿಗೆ ಸಕ್ರಿಯ')}</h3>
            <p style={{color:'var(--text-secondary)', marginBottom:'2rem', lineHeight:1.6}}>
              {speechText ? `"${speechText}"` : t("Click start and speak: Describe your crop, quantity, and expected price.","हिंदी में बोलें: अपनी फसल, मात्रा और कीमत बताएं।","మాట్లాడండి: మీ పంట, పరిమాణం మరియు ధర.","ಮಾತನಾಡಿ: ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಬೆಲೆ.")}
            </p>
            {isListening ? (
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', marginBottom:'2rem', height:'32px'}}>
                {[1,2,3,4,5].map(n => <div key={n} className="wave-bar" style={{animationDelay:`${n*0.1}s`}}/>)}
              </div>
            ) : (
              <div style={{marginBottom:'1.5rem'}}>
                <button className="btn btn-primary" onClick={handleVoiceListing}>Start Speaking</button>
              </div>
            )}
            <button className="btn btn-outline" style={{width:'100%'}} onClick={()=>{setShowIVR(false);setIsListening(false);}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Add Listing Modal ── */}
      {showAddListing && (
        <div className="modal-overlay">
          <div className="modal-box" style={{width:'520px', maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h3 style={{fontSize:'1.35rem', fontWeight:700}}>Create New Listing</h3>
              <button onClick={()=>setShowAddListing(false)} style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--text-secondary)'}}><X size={20}/></button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              <div>
                <label className="label">Crop Type *</label>
                <input className="input-field" value={newListing.crop_type} onChange={e=>setNewListing({...newListing, crop_type:e.target.value})} placeholder="e.g., Wheat, Cotton, Tomato"/>
              </div>
              <div style={{display:'flex', gap:'1rem'}}>
                <div style={{flex:1}}>
                  <label className="label">Quantity (Tonnes) *</label>
                  <input type="number" min="0" className="input-field" value={newListing.quantity_tonnes} onChange={e=>setNewListing({...newListing, quantity_tonnes:e.target.value})}/>
                </div>
                <div style={{flex:1}}>
                  <label className="label">Price Band (₹/tonne) *</label>
                  <input type="number" min="0" className="input-field" value={newListing.price_band} onChange={e=>setNewListing({...newListing, price_band:e.target.value})}/>
                </div>
              </div>
              <div style={{display:'flex', gap:'1rem'}}>
                <div style={{flex:1}}>
                  <label className="label">Quality Grade</label>
                  <select className="input-field" value={newListing.quality_grade} onChange={e=>setNewListing({...newListing, quality_grade:e.target.value})}>
                    <option>Grade A</option><option>Premium</option><option>Standard</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label className="label">Harvest Date *</label>
                  <input type="date" className="input-field" value={newListing.harvest_date} onChange={e=>setNewListing({...newListing, harvest_date:e.target.value})}/>
                </div>
              </div>
              <button className="btn btn-primary" style={{marginTop:'0.5rem', height:'2.75rem'}} onClick={handleAddListing}>
                Confirm & Create Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View/Edit Crop Modal ── */}
      {showCropDetails && (
        <div className="modal-overlay">
          <div className="modal-box" style={{width:'460px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', borderBottom:'1px solid var(--border-color)', paddingBottom:'1rem'}}>
              <h3 style={{fontSize:'1.2rem', fontWeight:700}}>Modify Crop Form</h3>
              <span className={`badge ${showCropDetails.status==='contracted'?'badge-success':'badge-neutral'}`}>{showCropDetails.status.toUpperCase()}</span>
            </div>
            {isEditing ? (
              <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.5rem'}}>
                <div>
                  <label className="label">Crop Type</label>
                  <input className="input-field" value={editForm.crop_type} onChange={e=>setEditForm({...editForm, crop_type:e.target.value})}/>
                </div>
                <div style={{display:'flex', gap:'1rem'}}>
                  <div style={{flex:1}}>
                    <label className="label">Quantity (T)</label>
                    <input type="number" className="input-field" value={editForm.quantity_tonnes} onChange={e=>setEditForm({...editForm, quantity_tonnes:e.target.value})}/>
                  </div>
                  <div style={{flex:1}}>
                    <label className="label">Price (₹/T)</label>
                    <input type="number" className="input-field" value={editForm.price_band} onChange={e=>setEditForm({...editForm, price_band:e.target.value})}/>
                  </div>
                </div>
                <div>
                  <label className="label">Harvest Date</label>
                  <input type="date" className="input-field" value={editForm.harvest_date} onChange={e=>setEditForm({...editForm, harvest_date:e.target.value})}/>
                </div>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem'}}>
                {[['Crop', showCropDetails.crop_type],['Quantity', `${showCropDetails.quantity_tonnes} T`],['Quality', showCropDetails.quality_grade],['Price', `₹${showCropDetails.price_band} / T`],['Harvest Date', showCropDetails.harvest_date]].map(([k,v])=>(
                  <div key={k} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', paddingBottom:'0.5rem'}}>
                    <span style={{color:'var(--text-secondary)'}}>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:'flex', gap:'1rem'}}>
              <button className="btn btn-outline" style={{flex:1}} onClick={()=>{setShowCropDetails(null);setIsEditing(false);}}>Close</button>
              {isEditing ? (
                <button className="btn btn-primary" style={{flex:1, background:'var(--success-color)'}} onClick={saveEdit}>Save Changes</button>
              ) : (
                <button className="btn btn-primary" style={{flex:1}} onClick={()=>startEditing(showCropDetails)} disabled={showCropDetails.status==='contracted'}>
                  {showCropDetails.status==='contracted'?'Locked (Contracted)':'Edit Listing'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { from{width:30%} to{width:90%} }
        .wave-bar { width:4px; height:24px; background:var(--accent-color); border-radius:2px; animation:waveBar 0.8s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
}
