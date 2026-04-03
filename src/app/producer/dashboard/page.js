"use client";

import { useState, useEffect } from 'react';
import { useGlobalData } from '@/context/GlobalState';
import { Leaf, Plus, Phone, MessageSquare, CheckCircle, ShieldAlert, LogOut, X, Mic, RefreshCw, FileText, IndianRupee } from 'lucide-react';

export default function ProducerDashboard() {
  const { users, listings, contracts, addListing, updateListing } = useGlobalData();
  const [lang, setLang] = useState('eng'); // eng, hin, tel, kan
  const [farmer, setFarmer] = useState(null);
  const [activeTab, setActiveTab] = useState('crops'); // crops, orders, ledger, messages
  const [showAddListing, setShowAddListing] = useState(false);
  const [showCropDetails, setShowCropDetails] = useState(null); // stores crop object
  const [isEditing, setIsEditing] = useState(false); // boolean indicating if detail modal is in edit mode
  
  // Custom states for edit form
  const [editForm, setEditForm] = useState({});

  const [showIVR, setShowIVR] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  // New Listing State
  const [newListing, setNewListing] = useState({ crop_type: '', quantity_tonnes: '', quality_grade: 'Standard', price_band: '', harvest_date: '' });

  useEffect(() => {
    // Only access cookie/window after mount
    const userRole = document.cookie.includes('udant_role=producer');
    if (!userRole) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
    // Using usr_1 as mock logged in farmer state
    setFarmer(users.find(u => u.id === 'usr_1'));
  }, [users]);

  const handleLogout = () => {
    document.cookie = "udant_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  const t = (eng, hin, tel, kan) => {
    switch (lang) {
      case 'hin': return hin;
      case 'tel': return tel;
      case 'kan': return kan;
      default: return eng;
    }
  };

  const parseHindiVoice = (txt) => {
      let crop = "Misc Crop";
      let quantity = "10";
      let price = "2000";

      const lower = txt.toLowerCase();

      // Devanagari / Hinglish checks
      if (lower.includes('gehu') || lower.includes('wheat') || lower.includes('गेहूं')) crop = 'Wheat';
      if (lower.includes('chawal') || lower.includes('rice') || lower.includes('चावल')) crop = 'Rice';
      if (lower.includes('kapas') || lower.includes('cotton') || lower.includes('कपास')) crop = 'Cotton';
      if (lower.includes('tamatar') || lower.includes('tomato') || lower.includes('टमाटर')) crop = 'Tomato';
      if (lower.includes('ganna') || lower.includes('sugarcane') || lower.includes('गन्ना')) crop = 'Sugarcane';

      // Parse Digits
      const numbers = txt.match(/\d+/g);
      if (numbers && numbers.length >= 1) quantity = numbers[0];
      if (numbers && numbers.length >= 2) price = numbers[1]; // Usually people say "50 ton... 2000 rupee"

      return { crop, quantity, price };
  };

  const handleVoiceListing = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser. Please use Chrome.");
      return;
    }
    
    setIsListening(true);
    setSpeechText(t("Listening... Say crop, volume, and price", "सुन रहा हूँ... फसल, मात्रा और कीमत बताएं", "వినడం... పంట, పరిమాణం మరియు ధర చెప్పండి", "ಆಲಿಸುತ್ತಿದೆ... ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಬೆಲೆಯನ್ನು ಹೇಳಿ"));
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Standardize to Hindi parsing
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setSpeechText(result);
      setIsListening(false);
      
      const parsed = parseHindiVoice(result);

      setNewListing({
          crop_type: parsed.crop,
          quantity_tonnes: parsed.quantity,
          quality_grade: 'Premium',
          price_band: parsed.price,
          harvest_date: new Date().toISOString().split('T')[0]
      });
      
      setTimeout(() => {
        setShowIVR(false);
        setShowAddListing(true); // Open the add listing modal for them to confirm!
      }, 2000);
    };

    recognition.onerror = (event) => {
      setSpeechText(t("Error recognizing voice.", "आवाज़ पहचानने में त्रुटि।", "వాయిస్‌ని గుర్తించడంలో లోపం.", "ಧ್ವನಿಯನ್ನು ಗುರುತಿಸುವಲ್ಲಿ ದೋಷ."));
      setIsListening(false);
      setTimeout(() => setShowIVR(false), 2000);
    };

    recognition.start();
  };

  const startEditing = (listing) => {
      setEditForm({...listing});
      setIsEditing(true);
  };

  const saveEdit = () => {
      updateListing(editForm.id, editForm);
      setShowCropDetails({...editForm});
      setIsEditing(false);
  };

  if (!farmer) return <div className="page-content" style={{display: 'flex', alignItems: 'center', justifyContent:'center', height:'100vh'}}>Loading...</div>;

  const myListings = listings.filter(l => l.producer_id === farmer?.id); // usr_1
  
  // Find all contracts related to this farmer's listings
  const myFarmerContracts = contracts.filter(c => myListings.some(l => l.id === c.listing_id));

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header" style={{ color: 'var(--accent-color)' }}>
          UDANT
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'crops' ? 'active' : ''}`} onClick={() => setActiveTab('crops')} style={{ cursor: 'pointer' }}><Leaf size={20}/> {t('My Crops', 'मेरी फसलें', 'నా పంటలు', 'ನನ್ನ ಬೆಳೆಗಳು')}</div>
          <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}><FileText size={20}/> {t('Supply Orders', 'आपूर्ति आदेश', 'సరఫరా ఆర్డర్లు', 'ಪೂರೈಕೆ ಆದೇಶಗಳು')}</div>
          <div className={`nav-item ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')} style={{ cursor: 'pointer' }}><IndianRupee size={20}/> {t('Payments Ledger', 'भुगतान बहीखाता', 'చెల్లింపుల లెడ్జర్', 'ಪಾವತಿ ಲೆಡ್ಜರ್')}</div>
          <div className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')} style={{ cursor: 'pointer' }}><MessageSquare size={20}/> {t('Messages', 'संदेश', 'సందేశాలు', 'ಸಂದೇಶಗಳು')}</div>
          <div onClick={() => { setShowIVR(true); }} className="nav-item" style={{ cursor: 'pointer' }}><Phone size={20}/> {t('Call to List (IVR)', 'लिस्टिंग के लिए कॉल करें', 'జాబితా కోసం కాల్ చేయండి', 'ಪಟ್ಟಿ ಮಾಡಲು ಕರೆ ಮಾಡಿ')}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <h2 className="page-title" style={{ marginBottom: 0 }}>
              {t('Producer Dashboard', 'निर्माता डैशबोर्ड', 'నిర్మాత డాష్బోర్డ్', 'ನಿರ್ಮಾಪಕ ಡ್ಯಾಶ್ಬೋರ್ಡ್')}
            </h2>
            {farmer.verification_score >= 80 ? (
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={14}/> {t('Verified', 'सत्यापित', 'ధృవీకరించబడింది', 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ')} ({farmer.verification_score})
              </span>
            ) : (
              <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldAlert size={14}/> {t('Pending Verification', 'सत्यापन लंबित', 'ధృవీకరణ పెండింగ్', 'ಪರಿಶೀಲನೆ ಬಾಕಿ')} ({farmer.verification_score})
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem', background: '#e2e8f0', borderRadius: '4px', padding: '2px' }}>
              {['eng', 'hin', 'tel', 'kan'].map(l => (
                <button 
                  key={l}
                  className={lang === l ? 'btn btn-primary' : 'btn'} 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: lang === l ? 'var(--text-primary)' : 'transparent', color: lang === l ? 'white' : 'var(--text-secondary)' }}
                  onClick={() => setLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="page-content animate-fade-in" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          
          {activeTab === 'crops' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('Available Stock & Future Harvests', 'उपलब्ध स्टॉक', 'అందుబాటులో ఉన్న స్టాక్', 'ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್')}</h3>
                <button className="btn btn-primary" onClick={() => setShowAddListing(true)}><Plus size={18}/> {t('Add Listing', 'लिस्टिंग जोड़ें', 'కలుపుము', 'ಸೇರಿಸು')}</button>
              </div>

              {farmer.verification_score < 80 && (
                <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '2rem', borderRadius: '4px' }}>
                  <strong>{t('Verification Pending', 'सत्यापन लंबित', 'ధృవీకరణ పెండింగ్', 'ಪರಿಶೀಲನೆ ಬಾಕಿ')}</strong>
                  <p style={{ fontSize: '0.875rem' }}>An Udant operations manager will review your profile shortly. Unverified listings may have limited visibility to top-tier consumers.</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {myListings.length === 0 && <p>No crops listed.</p>}
                {myListings.map(listing => (
                  <div key={listing.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{listing.crop_type}</h4>
                      <span className={`badge ${listing.status === 'contracted' ? 'badge-success' : 'badge-neutral'}`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <p><strong>{t('Quantity', 'मात्रा', 'పరిమాణం', 'ಪ್ರಮಾಣ')}:</strong> {listing.quantity_tonnes} Tonnes</p>
                      <p><strong>{t('Expected Price', 'अनुमानित मूल्य', 'ఆశించిన ధర', 'ನಿರೀಕ್ಷಿತ ಬೆಲೆ')}:</strong> ₹{listing.price_band} / Tonne</p>
                      <p><strong>{t('Harvest Date', 'फसल की तारीख', 'కోత తేదీ', 'ಕೊಯ್ಲು ದಿನಾಂಕ')}:</strong> {listing.harvest_date}</p>
                    </div>
                    <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => setShowCropDetails(listing)}>
                      {t('View & Edit Details', 'विवरण और संपादन देखें', 'వివరాలను చూడండి మరియు సవరించండి', 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಸಂಪಾದಿಸಿ')}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div style={{ maxWidth: '900px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>{t('Procurement Supply Tracker', 'खरीद आपूर्ति ट्रैकर', 'ప్రొక్యూర్‌మెంట్ సప్లై ట్రాకర్', 'ಖರೀದಿ ಪೂರೈಕೆ ಟ್ರ್ಯಾಕರ್')}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {myFarmerContracts.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>You do not have any active supply orders fulfilled by buyers yet.</p>}

                 {myFarmerContracts.map(contract => {
                    const linkedListing = myListings.find(l => l.id === contract.listing_id);
                    return (
                        <div key={contract.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{linkedListing?.crop_type} ({linkedListing?.quantity_tonnes} Tonnes)</h4>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Order ID: {contract.id} • Buyer: {users.find(u=>u.id===contract.buyer_id)?.name}</span>
                                </div>
                                <span className={`badge ${contract.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                                    {contract.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <strong>Logistics Trace:</strong>
                                {contract.status === 'delivered' ? (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Successfully transported and confirmed received by DP World.</p>
                                ) : contract.status === 'transit' ? (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>A DP World truck has picked up your load and is currently en route to the buyer.</p>
                                ) : (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Awaiting assignation to a DP World trucking array. Prepare goods for pickup.</p>
                                )}
                            </div>
                        </div>
                    );
                 })}
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div style={{ maxWidth: '900px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>{t('Escrow Payments & Ledger', 'एस्क्रो भुगतान और बहीखाता', 'ఎస్క్రో చెల్లింపులు & లెడ్జర్', 'ಎಸ್ಕ್ರೊ ಪಾವತಿಗಳು & ಲೆಡ್ಜರ್')}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div className="card" style={{ padding: '2rem' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('Cleared Funds (Banked)', 'साफ़ किया गया फंड', 'క్లియర్ చేసిన నిధులు', 'ತೆರವುಗೊಳಿಸಿದ ನಿಧಿಗಳು')}</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success-color)' }}>
                          ₹{myFarmerContracts.filter(c => c.status === 'delivered').reduce((acc, c) => acc + (c.bid_price * (myListings.find(l=>l.id===c.listing_id)?.quantity_tonnes||1)), 0).toLocaleString('en-IN')}
                      </div>
                  </div>
                  <div className="card" style={{ padding: '2rem' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('Locked In Transit Escrow', 'ट्रांजिट एस्क्रो में लॉक', 'ట్రాన్సిట్ ఎస్క్రోలో లాక్ చేయబడింది', 'ಟ್ರಾನ್ಸಿಟ್ ಎಸ್ಕ್ರೋದಲ್ಲಿ ಲಾಕ್ ಆಗಿದೆ')}</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning-color)' }}>
                          ₹{myFarmerContracts.filter(c => c.status !== 'delivered').reduce((acc, c) => acc + (c.bid_price * (myListings.find(l=>l.id===c.listing_id)?.quantity_tonnes||1)), 0).toLocaleString('en-IN')}
                      </div>
                  </div>
              </div>

              <div className="card">
                  <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Transaction History</h4>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Contract Rel</th>
                              <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Amount</th>
                              <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Settlement Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {myFarmerContracts.map(c => {
                              const qty = myListings.find(l=>l.id===c.listing_id)?.quantity_tonnes || 1;
                              const amt = c.bid_price * qty;
                              return (
                                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                      <td style={{ padding: '1rem 0' }}>{c.id}</td>
                                      <td style={{ padding: '1rem 0', fontWeight: 600 }}>₹{amt.toLocaleString('en-IN')}</td>
                                      <td style={{ padding: '1rem 0' }}>
                                          {c.status === 'delivered' ? (
                                              <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14}/> Funds Settled via UPI</span>
                                          ) : (
                                              <span style={{ color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><RefreshCw size={14} className="animate-spin"/> Locked in Dispatch</span>
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

          {activeTab === 'messages' && (
            <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 600 }}>Udant Support & Buyers</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '70%' }}>
                  <strong>Udant Team</strong><br/>
                  Please make sure to upload clear pictures of your Wheat stock so we can complete your verification process.
                </div>
                <div style={{ background: 'var(--accent-color)', color: 'white', padding: '1rem', borderRadius: '8px', alignSelf: 'flex-end', maxWidth: '70%' }}>
                  <strong>You</strong><br/>
                  I have added the details. Let me know.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="text" className="input-field" placeholder="Type a message..." />
                <button className="btn btn-primary">Send</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Simulated IVR Speech-to-Text Modal */}
      {showIVR && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px', textAlign: 'center' }}>
            <div style={{ background: isListening ? '#e11d48' : '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isListening ? 'white' : '#94a3b8', margin: '0 auto 1.5rem auto', transition: 'all 0.3s' }}>
              <Mic size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('Voice-to-Listing Active', 'वॉयस-टू-लिस्टिंग सक्रिय', 'వాయిస్-టు-లిస్టింగ్ యాక్టివ్', 'ಧ್ವನಿಯಿಂದ ಪಟ್ಟಿಗೆ ಸಕ್ರಿಯ')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {speechText ? `"${speechText}"` : t("Click start and speak: Describe your crop, quantity, and expected price.", "हिंदी में बोलें: अपनी फसल, मात्रा और अपेक्षित कीमत बताएं।", "మాట్లాడండి: మీ పంట, పరిమాణం మరియు ధర.", "ಮಾತನಾಡಿ: ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಬೆಲೆ.")}
            </p>
            
            {isListening ? (
              <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ width: '60%', height: '100%', background: '#e11d48', animation: 'pulse 0.8s infinite alternate' }}></div>
              </div>
            ) : (
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={handleVoiceListing}>Start Speaking</button>
              </div>
            )}
            
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => {setShowIVR(false); setIsListening(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* 2. Add Listing Form Modal */}
      {showAddListing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Create New Listing</h3>
              <button onClick={() => setShowAddListing(false)} style={{ background: 'transparent', border:'none', cursor:'pointer' }}><X/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Crop Type</label>
                <input className="input-field" value={newListing.crop_type} onChange={e => setNewListing({...newListing, crop_type: e.target.value})} placeholder="e.g., Wheat, Cotton" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Quantity (Tonnes)</label>
                  <input type="number" className="input-field" value={newListing.quantity_tonnes} onChange={e => setNewListing({...newListing, quantity_tonnes: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Price Band (₹/tonne)</label>
                  <input type="number" className="input-field" value={newListing.price_band} onChange={e => setNewListing({...newListing, price_band: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Quality Grade</label>
                  <select className="input-field" value={newListing.quality_grade} onChange={e => setNewListing({...newListing, quality_grade: e.target.value})}>
                    <option>Grade A</option>
                    <option>Premium</option>
                    <option>Standard</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Harvest Date</label>
                  <input type="date" className="input-field" value={newListing.harvest_date} onChange={e => setNewListing({...newListing, harvest_date: e.target.value})} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => {
                addListing({ ...newListing, producer_id: farmer.id, location: { lat: 20, lng: 70 } });
                setShowAddListing(false);
                setNewListing({ crop_type: '', quantity_tonnes: '', quality_grade: 'Standard', price_band: '', harvest_date: '' });
              }}>
                Confirm & Create Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. View Crop Details Modal */}
      {showCropDetails && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Modify Crop Form</h3>
              <span className={`badge ${showCropDetails.status === 'contracted' ? 'badge-success' : 'badge-neutral'}`}>{showCropDetails.status.toUpperCase()}</span>
            </div>

            {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label className="label">Crop Type</label>
                        <input className="input-field" value={editForm.crop_type} onChange={e => setEditForm({...editForm, crop_type: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">Quantity (Tonnes)</label>
                            <input type="number" className="input-field" value={editForm.quantity_tonnes} onChange={e => setEditForm({...editForm, quantity_tonnes: e.target.value})} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Price (₹/Tonne)</label>
                            <input type="number" className="input-field" value={editForm.price_band} onChange={e => setEditForm({...editForm, price_band: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Expected Harvest Date</label>
                        <input type="date" className="input-field" value={editForm.harvest_date} onChange={e => setEditForm({...editForm, harvest_date: e.target.value})} />
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Crop:</span> <strong>{showCropDetails.crop_type}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Quantity:</span> <strong>{showCropDetails.quantity_tonnes} T</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Quality:</span> <strong>{showCropDetails.quality_grade}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Expected Price:</span> <strong>₹{showCropDetails.price_band} / T</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Harvest Date:</span> <strong>{showCropDetails.harvest_date}</strong></div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowCropDetails(null); setIsEditing(false); }}>Close</button>
                {isEditing ? (
                    <button className="btn btn-primary" style={{ flex: 1, background: 'var(--success-color)' }} onClick={saveEdit}>Save Changes</button>
                ) : (
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => startEditing(showCropDetails)} disabled={showCropDetails.status === 'contracted'}>
                        {showCropDetails.status === 'contracted' ? 'Locked (Contracted)' : 'Edit Listing'}
                    </button>
                )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          from { width: 30%; }
          to { width: 90%; }
        }
      `}</style>
    </div>
  );
}
