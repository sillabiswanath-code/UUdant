"use client";

import { useState, useEffect } from 'react';
import { useGlobalData } from '@/context/GlobalState';
import { Search, ShoppingBag, FileText, CheckCircle, IndianRupee, LogOut, X, Loader2, Plus, PieChart } from 'lucide-react';

export default function ConsumerDashboard() {
  const { users, listings, contracts, createEscrowPayment } = useGlobalData();
  const [buyer, setBuyer] = useState(null);
  const [activeTab, setActiveTab] = useState('portfolio'); // portfolio, discover, contracts, orders, advance
  
  // Escrow State
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState('idle'); 

  // Advance Requisition state
  const [advanceReq, setAdvanceReq] = useState({ type: '', tonnes: '', advance: '' });

  useEffect(() => {
    const userRole = document.cookie.includes('udant_role=consumer');
    if (!userRole) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
    setBuyer(users.find(u => u.id === 'usr_16')); 
  }, [users]);

  const handleLogout = () => {
    document.cookie = "udant_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  const getCropImage = (cropType) => {
    const c = cropType?.toLowerCase() || '';
    if (c.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80';
    if (c.includes('rice')) return 'https://images.unsplash.com/photo-1596720426673-e4e14290f0cc?auto=format&fit=crop&w=400&q=80';
    if (c.includes('cotton')) return 'https://images.unsplash.com/photo-1590403759364-70a92f03f7e8?auto=format&fit=crop&w=400&q=80';
    if (c.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80';
    if (c.includes('sugarcane')) return 'https://images.unsplash.com/photo-1620215900508-30ad453e00db?auto=format&fit=crop&w=400&q=80';
    
    // Generic farm image for anything else
    return 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=400&q=80';
  };

  const handleBid = (crop) => {
    setSelectedCrop(crop);
    setEscrowStatus('idle');
    setShowEscrowModal(true);
  };

  const processEscrowTransaction = () => {
    setEscrowStatus('processing');
    setTimeout(() => {
      createEscrowPayment(selectedCrop.id, buyer.id, selectedCrop.quantity_tonnes, selectedCrop.price_band);
      setEscrowStatus('success');
      setTimeout(() => {
        setShowEscrowModal(false);
        setActiveTab('contracts');
      }, 2000);
    }, 2500);
  };

  if (!buyer) return <div className="page-content" style={{display: 'flex', alignItems: 'center', justifyContent:'center', height:'100vh'}}>Loading...</div>;

  const availableCrops = listings.filter(l => l.status === 'available');
  const myContracts = contracts.filter(c => c.buyer_id === buyer.id && c.status !== 'delivered');
  const pastOrders = contracts.filter(c => c.buyer_id === buyer.id && c.status === 'delivered');

  const totalProcuredVolume = pastOrders.reduce((acc, curr) => acc + (listings.find(l => l.id === curr.listing_id)?.quantity_tonnes || 0), 0);
  const totalEscrowCapital = myContracts.reduce((acc, curr) => acc + (curr.bid_price * (listings.find(l=>l.id===curr.listing_id)?.quantity_tonnes || 0)), 0);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar" style={{ backgroundColor: '#1e293b' }}>
        <div className="sidebar-header" style={{ color: 'var(--accent-color)', fontSize: '1.25rem' }}>
          PROCUREMENT MGR
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')} style={{ cursor: 'pointer' }}><PieChart size={20}/> My Portfolio</div>
          <div className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')} style={{ cursor: 'pointer' }}><Search size={20}/> Discover Crops</div>
          <div className={`nav-item ${activeTab === 'advance' ? 'active' : ''}`} onClick={() => setActiveTab('advance')} style={{ cursor: 'pointer' }}><Plus size={20}/> Open Requisitions</div>
          <div className={`nav-item ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')} style={{ cursor: 'pointer' }}><FileText size={20}/> Escrow Transit ({myContracts.length})</div>
          <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}><ShoppingBag size={20}/> Past Orders ({pastOrders.length})</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h2 className="page-title" style={{ marginBottom: 0 }}>Procurement Portfolio - {buyer.name}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="badge badge-success">Escrow Wallet Verified</div>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="page-content animate-fade-in" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          
          {activeTab === 'portfolio' && (
            <div style={{ maxWidth: '900px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Portfolio Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Historical Tonnage</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{totalProcuredVolume} T</div>
                    </div>
                    <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-color)' }}>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Escrow Capital</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>₹{totalEscrowCapital.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Contracts</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{myContracts.length}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '1rem' }}>Sourcing Distribution</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>Based on your historical ledger, 60% of your sourcing comes from Maharashtra nodes. Suggest diversifying to Karnataka nodes for better price arbitrage.</p>
                </div>
            </div>
          )}

          {activeTab === 'advance' && (
              <div style={{ maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Open Future Requisitions</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Need a specific crop that is not currently listed? Lodge a requisition directly to aggregated FPOs with an advance deposit.</p>
                  
                  <div className="card">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div>
                              <label className="label">Target Commodity</label>
                              <input className="input-field" placeholder="e.g. Premium Maize" value={advanceReq.type} onChange={e => setAdvanceReq({...advanceReq, type: e.target.value})} />
                          </div>
                          <div>
                              <label className="label">Required Tonnage</label>
                              <input type="number" className="input-field" placeholder="100" value={advanceReq.tonnes} onChange={e => setAdvanceReq({...advanceReq, tonnes: e.target.value})} />
                          </div>
                          <div>
                              <label className="label">Advance Deposit (₹)</label>
                              <input type="number" className="input-field" placeholder="50000" value={advanceReq.advance} onChange={e => setAdvanceReq({...advanceReq, advance: e.target.value})} />
                          </div>
                          <button className="btn btn-primary" onClick={() => {
                              alert(`Requisition for ${advanceReq.tonnes}T of ${advanceReq.type} has been broadcasted to the FPO network. Udant will contact you when matched.`);
                              setAdvanceReq({ type:'', tonnes:'', advance:'' });
                          }}>
                              Issue Requisition to Grid
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'discover' && (
            <>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Verified Producer Listings</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
                {availableCrops.map(crop => (
                  <div key={crop.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: '160px', width: '100%', backgroundImage: `url(${getCropImage(crop.crop_type)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{crop.crop_type}</h4>
                          <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>UDANT VERIFIED</span>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-color)', fontSize: '1.25rem' }}>
                          ₹{crop.price_band} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/ t</span>
                        </div>
                      </div>

                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <p>Total Volume: <strong style={{ color: 'var(--text-primary)' }}>{crop.quantity_tonnes} Tonnes</strong></p>
                        <p>Quality Check: <strong style={{ color: 'var(--text-primary)' }}>{crop.quality_grade}</strong></p>
                        <p>Farm Location: <strong style={{ color: 'var(--text-primary)' }}>{users.find(u=>u.id===crop.producer_id)?.location || 'India'}</strong></p>
                        <p>Expected Harvest: <strong style={{ color: 'var(--text-primary)' }}>{crop.harvest_date}</strong></p>
                      </div>
                      
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: 'auto' }}
                        onClick={() => handleBid(crop)}
                      >
                        <IndianRupee size={16}/> Draft Pre-Order Contract
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'contracts' && (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Active Escrow & Transit Contracts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '900px' }}>
                {myContracts.length === 0 && <p className="text-secondary">No active contracts right now. Head over to Discover Crops.</p>}
                
                {myContracts.map((contract) => {
                  const listing = listings.find(l => l.id === contract.listing_id);
                  return (
                    <div key={contract.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                         <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundImage: `url(${getCropImage(listing?.crop_type)})`, backgroundSize: 'cover' }}></div>
                         <div>
                            <h4 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{listing?.crop_type || 'Crop'} ({listing?.quantity_tonnes}T)</h4>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>Contract ID: {contract.id}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Escrow Release Trigger: DP World GPS Finality</span>
                         </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <span className={`badge badge-warning`}>
                          {contract.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <strong style={{ fontSize: '1.25rem' }}>₹{(contract.bid_price * (listing?.quantity_tonnes || 1)).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Past Orders (Delivered & Released)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '900px' }}>
                {pastOrders.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No orders have completed the delivery cycle yet.</p>}
                
                {pastOrders.map((contract) => {
                  const listing = listings.find(l => l.id === contract.listing_id);
                  return (
                    <div key={contract.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                         <div style={{ width: '60px', height: '60px', borderRadius: '8px', filter: 'grayscale(100%)', backgroundImage: `url(${getCropImage(listing?.crop_type)})`, backgroundSize: 'cover' }}></div>
                         <div>
                            <h4 style={{ fontWeight: 600 }}>{listing?.crop_type || 'Crop'} ({listing?.quantity_tonnes}T)</h4>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Contract: {contract.id} • Concluded</span>
                         </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span className={`badge badge-success`}>DELIVERED & ESCROW RELEASED</span>
                        <strong style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>₹{(contract.bid_price * (listing?.quantity_tonnes || 1)).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Realistic Escrow Payment Gateway Modal */}
      {showEscrowModal && selectedCrop && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ width: '450px', padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#09090b', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Udant Secured Checkout</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{(selectedCrop.price_band * selectedCrop.quantity_tonnes).toLocaleString('en-IN')}</div>
              </div>
              <button style={{ color: 'white' }} onClick={() => escrowStatus === 'idle' && setShowEscrowModal(false)}><X/></button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {escrowStatus === 'idle' && (
                <>
                  <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1rem' }}>Order Summary</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Commodity</span>
                      <strong>{selectedCrop.crop_type} ({selectedCrop.quality_grade})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Volume</span>
                      <strong>{selectedCrop.quantity_tonnes} Tonnes</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Seller Rate</span>
                      <strong>₹{selectedCrop.price_band} / t</strong>
                    </div>
                    
                    <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '4px', color: '#166534', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <CheckCircle size={16} style={{ marginTop: '2px' }} />
                      <span style={{ lineHeight: 1.4 }}>Funds are locked in escrow and only released to the farmer upon successful GPS-tracked delivery by DP World.</span>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', height: '3rem', fontSize: '1rem' }} onClick={processEscrowTransaction}>
                    Pay & Fund Escrow via Gateway
                  </button>
                </>
              )}

              {escrowStatus === 'processing' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                  <Loader2 size={48} style={{ color: 'var(--accent-color)', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Authenticating Payment</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Connecting to bank systems...</p>
                </div>
              )}

              {escrowStatus === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                  <div style={{ background: '#d1fae5', color: '#059669', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CheckCircle size={32} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Escrow Funded Successfully!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>A new contract has been established. Redirecting to My Contracts...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
