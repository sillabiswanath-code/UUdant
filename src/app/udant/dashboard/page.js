"use client";

import { useState, useEffect } from 'react';
import { useGlobalData } from '@/context/GlobalState';
import { Shield, Users, Activity, LogOut, MessageSquare, Check, X as XIcon } from 'lucide-react';

export default function UdantDashboard() {
  const { users, updateFarmerScore } = useGlobalData();
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [adminComments, setAdminComments] = useState("");
  const [activeTab, setActiveTab] = useState('matrix'); // matrix, fpo, sys

  // Matrix internal tabs
  const [queueTab, setQueueTab] = useState('pending'); // pending, approved, rejected

  useEffect(() => {
    const userRole = document.cookie.includes('udant_role=udant_admin');
    if (!userRole) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
  }, []);

  useEffect(() => {
    setProducers(users.filter(u => u.role === 'producer'));
    if (selectedProducer) {
        setSelectedProducer(users.find(u => u.id === selectedProducer.id));
    }
  }, [users, activeTab]);
  
  const handleLogout = () => {
    document.cookie = "udant_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  const approveProducer = () => {
      updateFarmerScore(selectedProducer.id, 95);
      alert(`Validation complete! ${selectedProducer.name} is now a Verified Producer on the Platform.`);
      setAdminComments("");
  };
  
  const rejectProducer = () => {
      updateFarmerScore(selectedProducer.id, 20);
      alert(`Validation failed. ${selectedProducer.name} shifted to Rejected queue.`);
      setAdminComments("");
  };

  const calculateScore = (p) => {
    let s = p.verification_score || 0;
    if (s >= 80) return { label: 'Verified', badge: 'badge-success', score: s, q: 'approved' };
    if (s >= 60) return { label: 'Conditional', badge: 'badge-warning', score: s, q: 'pending' };
    return { label: 'Rejected', badge: 'badge-neutral', score: s, q: 'rejected' };
  };

  const filteredQueue = producers.filter(p => calculateScore(p).q === queueTab);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header" style={{ color: 'var(--accent-color)' }}>
          UDANT ADMIN
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')} style={{ cursor: 'pointer' }}><Shield size={20}/> Verification Matrix</div>
          <div className={`nav-item ${activeTab === 'fpo' ? 'active' : ''}`} onClick={() => setActiveTab('fpo')} style={{ cursor: 'pointer' }}><Users size={20}/> FPO Aggregation DB</div>
          <div className={`nav-item ${activeTab === 'sys' ? 'active' : ''}`} onClick={() => setActiveTab('sys')} style={{ cursor: 'pointer' }}><Activity size={20}/> System Operations</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h2 className="page-title" style={{ marginBottom: 0 }}>Udant Compliance Operations</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="badge badge-success">System Online</div>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="page-content animate-fade-in" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          
          {activeTab === 'matrix' && (
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Producer Queue</span>
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: '4px' }}>
                    <button className="btn" style={{ flex: 1, padding: '0.5rem', background: queueTab === 'pending' ? 'white' : 'transparent', color: queueTab === 'pending' ? 'black' : 'var(--text-secondary)' }} onClick={() => setQueueTab('pending')}>Pending ({producers.filter(p=>calculateScore(p).q==='pending').length})</button>
                    <button className="btn" style={{ flex: 1, padding: '0.5rem', background: queueTab === 'approved' ? 'white' : 'transparent', color: queueTab === 'approved' ? 'black' : 'var(--text-secondary)' }} onClick={() => setQueueTab('approved')}>Approved</button>
                    <button className="btn" style={{ flex: 1, padding: '0.5rem', background: queueTab === 'rejected' ? 'white' : 'transparent', color: queueTab === 'rejected' ? 'black' : 'var(--text-secondary)' }} onClick={() => setQueueTab('rejected')}>Rejected</button>
                </div>

                {filteredQueue.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No producers in this queue.</p>}
                
                {filteredQueue.map(p => {
                  const status = calculateScore(p);
                  return (
                    <div 
                      key={p.id} 
                      className="card animate-fade-in" 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: selectedProducer?.id === p.id ? '4px solid var(--accent-color)' : '' }}
                      onClick={() => setSelectedProducer(p)}
                    >
                      <div>
                        <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{p.name}</h4>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.location} • {p.phone}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className={`badge ${status.badge}`} style={{ marginBottom: '0.25rem' }}>{status.label}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Score: {status.score}/100</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Profile Compliance</h3>
                {selectedProducer ? (
                  <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedProducer.name}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Aadhar ID Linked • Location: {selectedProducer.location}</p>
                        </div>
                        <div className={`badge ${calculateScore(selectedProducer).badge}`} style={{ fontSize: '1rem' }}>
                            {calculateScore(selectedProducer).label}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <ScoreItem label="Land Authenticity Proofs" max={20} score={Math.floor(selectedProducer.verification_score * 0.2)} />
                      <ScoreItem label="Past Organic Yield History" max={15} score={Math.floor(selectedProducer.verification_score * 0.15)} />
                      <ScoreItem label="Active FPO Affiliation" max={15} score={Math.floor(selectedProducer.verification_score * 0.15)} />
                      <ScoreItem label="Location Geofencing Match" max={10} score={Math.floor(selectedProducer.verification_score * 0.1)} />
                      <ScoreItem label="Fulfillment SLA Success" max={20} score={Math.floor(selectedProducer.verification_score * 0.2)} />
                    </div>
                    
                    <div style={{ marginTop: '2rem' }}>
                        <label className="label"><MessageSquare size={14} style={{display:'inline', marginRight:'0.25rem'}}/> Admin Notes</label>
                        <textarea 
                            className="input-field" 
                            rows={3} 
                            style={{ resize: 'none' }} 
                            placeholder="Add compliance notes logically..."
                            value={adminComments}
                            onChange={e => setAdminComments(e.target.value)}
                        ></textarea>
                    </div>

                    {calculateScore(selectedProducer).q === 'pending' && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1, borderColor: '#e11d48', color: '#e11d48' }} onClick={rejectProducer}><XIcon size={16}/> Reject</button>
                        <button className="btn btn-primary" style={{ flex: 2, background: 'var(--success-color)' }} onClick={approveProducer}><Check size={16}/> Approve Verification</button>
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Select a producer from the queue to view their verification matrix and score breakdown.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fpo' && (
             <div style={{ maxWidth: '900px' }}>
                 <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>FPO Geographic Aggregation</h3>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Farmers within a 50km radius are automatically pooled to combine LTL (Less-than-truckload) deliveries into FTL (Full-truckload) arrays for DP World.</p>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="card">
                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Node Alpha: Maharashtra Cluster</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}><span>Verified Farmers</span><strong>8</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}><span>Aggregated Wheat</span><strong>40 Tonnes</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}><span>Logistics Output</span><strong style={{ color: '#10b981' }}>2 x 20T Trucks (Efficient)</strong></div>
                    </div>
                    <div className="card">
                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Node Beta: Karnataka Cluster</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}><span>Verified Farmers</span><strong>12</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}><span>Aggregated Tomatoes</span><strong>15 Tonnes</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}><span>Logistics Output</span><strong style={{ color: '#f59e0b' }}>Cold-chain required. LTL detected.</strong></div>
                    </div>
                 </div>
             </div>
          )}

          {activeTab === 'sys' && (
              <div style={{ maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>System Health Operations</h3>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Database Sync Status</span>
                          <span className="badge badge-success">Online (Supabase Mock)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Escrow Razorpay Webhooks</span>
                          <span className="badge badge-success">Listening</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>DP World Telemetry API</span>
                          <span className="badge badge-success">Active Stream</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Server Load</span>
                          <strong style={{ color: '#10b981' }}>12% Utilized</strong>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, score, max }) {
  const percent = Number((score / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
        <span>{label}</span>
        <strong>{score} / {max}</strong>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: percent > 70 ? 'var(--success-color)' : percent > 40 ? 'var(--warning-color)' : '#e11d48', transition: 'width 0.5s ease-out' }}></div>
      </div>
    </div>
  );
}
