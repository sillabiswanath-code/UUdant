"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGlobalData } from '@/context/GlobalState';
import { Map, Zap, Settings, Activity, AlertTriangle, PlayCircle, LogOut, Maximize, ArrowLeft, CheckCircle } from 'lucide-react';

const DynamicLiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function DPWorldDashboard() {
  const { trucks, triggerReroute, assignLoad, markDelivered, contracts } = useGlobalData();
  const [activeTruck, setActiveTruck] = useState(null);
  const [liveMode, setLiveMode] = useState(true);
  const [localTrucks, setLocalTrucks] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const userRole = document.cookie.includes('udant_role=dpworld_admin');
    if (!userRole) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
    setLocalTrucks(trucks);
  }, [trucks]);

  // Simulate realtime updates independently
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveMode) {
        setLocalTrucks(currentList => 
          currentList.map(t => {
            if (t.status === 'transit') {
              return {
                ...t,
                current_location: {
                  lat: t.current_location.lat + (Math.random() - 0.5) * 0.05,
                  lng: t.current_location.lng + (Math.random() - 0.5) * 0.05
                }
              };
            }
            return t;
          })
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [liveMode]);

  // Sync activeTruck with moving localTrucks array
  useEffect(() => {
      if (activeTruck) {
          const sync = localTrucks.find(t => t.id === activeTruck.id);
          if (sync) setActiveTruck(sync);
      }
  }, [localTrucks]);

  const handleLogout = () => {
    document.cookie = "udant_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  const handleReroute = () => {
      const badTruck = localTrucks.find(t => t.efficiency_score < 75);
      if (badTruck) {
          triggerReroute(badTruck.id);
          alert(`Successfully rerouted ${badTruck.id} due to traffic anomaly. New ETA calculated.`);
      } else {
          alert("All trucks currently on optimal routes.");
      }
  };

  const handleAssignLoad = () => {
      const idleTruck = localTrucks.find(t => t.status === 'idle');
      if (idleTruck) {
          assignLoad(idleTruck.id);
          alert(`Consolidation opportunity seized! ${idleTruck.id} assigned to pick up nearby LTL load.`);
      } else {
          alert("No idle trucks available in the vicinity.");
      }
  };

  const handleDeliver = (truckId, contractId) => {
      markDelivered(truckId, contractId);
      alert('Proof of Delivery received via GPS bounding box. Escrow contract flagged for release!');
      setActiveTruck(null);
  };

  const activeStats = {
    totalActive: localTrucks.filter(t => t.status === 'transit').length,
    avgEfficiency: localTrucks.length > 0 ? Math.round(localTrucks.reduce((acc, t) => acc + t.efficiency_score, 0) / localTrucks.length) : 0,
    lowUtilized: localTrucks.filter(t => t.efficiency_score < 75).length
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar" style={{ backgroundColor: '#09090b', color: '#94a3b8' }}>
        <div className="sidebar-header" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
          <Zap size={24} style={{ color: '#e11d48' }}/> 
          CONTROL TOWER
        </div>
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')} style={{ cursor: 'pointer' }}><Map size={20}/> Fleet Map</div>
          <div className={`nav-item ${activeTab === 'intel' ? 'active' : ''}`} onClick={() => setActiveTab('intel')} style={{ cursor: 'pointer' }}><Activity size={20}/> Routing Intel</div>
          <div className={`nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')} style={{ cursor: 'pointer' }}><Settings size={20}/> System Config</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ position: isFullscreen ? 'fixed' : 'relative', inset: isFullscreen ? 0 : 'auto', zIndex: isFullscreen ? 50 : 1, backgroundColor: 'var(--bg-primary)' }}>
        {!isFullscreen && (
            <div className="topbar">
            <h2 className="page-title" style={{ marginBottom: 0 }}>DP World Logistics OS Engine</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {liveMode ? (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><PlayCircle size={14}/> LIVE TELEMETRY STREAM</span>
                ) : (
                <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>PAUSED</span>
                )}
                <button className="btn btn-outline" onClick={() => setLiveMode(!liveMode)}>
                Toggle Data
                </button>
                <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem' }} title="Logout">
                <LogOut size={18} />
                </button>
            </div>
            </div>
        )}

        <div className="page-content animate-fade-in" style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 64px)', padding: isFullscreen ? 0 : '2rem' }}>
          
          {activeTab === 'map' && (
              <div style={{ display: 'flex', gap: isFullscreen ? 0 : '2rem', height: '100%' }}>
                  {/* Map Area */}
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, border: isFullscreen ? 'none' : '1px solid var(--border-color)', borderRadius: isFullscreen ? '0' : '8px', overflow: 'hidden', position: 'relative' }}>
                      <DynamicLiveMap 
                        activeTruck={activeTruck} 
                        isolate={!!activeTruck} 
                        trucksData={localTrucks} 
                        onMarkerClick={setActiveTruck} 
                        onMarkerClose={() => setActiveTruck(null)}
                      />
                      <button 
                        onClick={() => setIsFullscreen(!isFullscreen)} 
                        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, background: 'white', padding: '0.5rem', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        {isFullscreen ? "Exit Fullscreen" : <Maximize size={20}/>}
                      </button>
                    </div>
                    
                    {/* KPI Cards (hidden in fullscreen) */}
                    {!isFullscreen && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{activeStats.totalActive}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>Active Transits</span>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{activeStats.avgEfficiency}%</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Efficiency (Load × Route Adherence)</span>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-color)' }}>{activeStats.lowUtilized}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>Inefficient Routes Detected</span>
                        </div>
                        </div>
                    )}
                  </div>

                  {/* Intelligence Panel */}
                  <div style={{ width: isFullscreen ? '400px' : 'auto', flex: isFullscreen ? 'none' : 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: isFullscreen ? '0' : '2rem', zIndex: 100, background: 'var(--bg-primary)' }}>
                    
                    {!isFullscreen && !activeTruck && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={18} style={{ color: 'var(--warning-color)' }} /> 
                                Active Intelligence
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '1rem', borderRadius: '4px' }}>
                                <strong>Delay Risk Flagged</strong>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Inefficient route or traffic volume causing delay risk on active shipments.</p>
                                <button style={{ color: '#e11d48', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem' }} onClick={handleReroute}>ACTIVATE REROUTE &rarr;</button>
                                </div>
                                <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '1rem', borderRadius: '4px' }}>
                                <strong>Consolidation Opportunity</strong>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Idle trucks detected near unfulfilled agricultural pre-orders.</p>
                                <button style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem' }} onClick={handleAssignLoad}>ASSIGN OPEN LOAD &rarr;</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isFullscreen ? '1rem' : '1.5rem', borderRadius: isFullscreen ? 0 : '8px' }}>
                      {activeTruck ? (
                          // Focused Truck Details Mode
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <button onClick={() => setActiveTruck(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                  <ArrowLeft size={16}/> Back to Fleet Overview
                              </button>
                              
                              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Transport Manifest</h3>
                              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '1.5rem' }}>{activeTruck.id}</div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                                      <span className={`badge ${activeTruck.status === 'transit' ? 'badge-success' : 'badge-neutral'}`}>{activeTruck.status.toUpperCase()}</span>
                                  </div>
                                  {activeTruck.status === 'transit' && liveMode && (
                                     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                         <span style={{ color: 'var(--text-secondary)' }}>Live Telemetry Speed</span>
                                         <strong style={{ color: 'var(--success-color)' }}>{Math.floor(Math.random() * 8) + 52} km/h</strong>
                                     </div>
                                  )}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Max Capacity</span>
                                      <strong>{activeTruck.capacity_tonnes} Tonnes</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Algorithm Efficiency</span>
                                      <strong style={{ color: activeTruck.efficiency_score < 75 ? 'var(--warning-color)' : 'var(--success-color)' }}>{activeTruck.efficiency_score}%</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Driver Assignment</span>
                                      <strong>{activeTruck.driver_name}</strong>
                                  </div>
                                  {activeTruck.assigned_contract_id && (
                                     <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
                                         <span style={{ color: 'var(--text-secondary)' }}>Linked Contract</span>
                                         <strong>{activeTruck.assigned_contract_id}</strong>
                                     </div>
                                  )}
                              </div>

                              {activeTruck.status === 'transit' && activeTruck.assigned_contract_id && (
                                  <button 
                                     className="btn btn-primary" 
                                     style={{ background: 'var(--success-color)', width: '100%', padding: '1rem', marginTop: '1rem' }}
                                     onClick={() => handleDeliver(activeTruck.id, activeTruck.assigned_contract_id)}
                                  >
                                      <CheckCircle size={20}/> Confirmed GPS Finality Match. Mark Delivered.
                                  </button>
                              )}
                          </div>
                      ) : (
                          // Fleet Array Mode
                          <>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Global Fleet Matrix</h3>
                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {localTrucks.map(t => (
                                <div 
                                    key={t.id} 
                                    style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => setActiveTruck(t)}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <strong>{t.id}</strong>
                                        <span className={`badge ${t.status === 'transit' ? 'badge-success' : 'badge-neutral'}`}>{t.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Capacity Load: {t.capacity_tonnes}T • Efficiency Eval: {t.efficiency_score}%
                                    </div>
                                </div>
                                ))}
                            </div>
                          </>
                      )}
                    </div>
                  </div>
              </div>
          )}

          {activeTab === 'intel' && (
              <div style={{ maxWidth: '900px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Routing Intelligence & Carbon Offset</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                      <div className="card">
                          <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Empty Miles Avoided (YTD)</h4>
                          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--success-color)', marginBottom: '0.5rem' }}>14,203 km</div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Backhaul algorithms successfully utilized returning trucks for open LTL loads.</p>
                      </div>
                      <div className="card">
                          <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Carbon Reduction via Aggregation</h4>
                          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.5rem' }}>2,450 kg CO₂</div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Direct result of pooling FPO assets under Node Alpha logic instead of independent transit.</p>
                      </div>
                  </div>

                  <div className="card">
                      <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Consolidation Hub Matrix</h4>
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                          <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Node Location</th>
                                  <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Volume Traded</th>
                                  <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Optimization Rating</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>Pune, Maharashtra</td>
                                  <td style={{ padding: '1rem 0' }}>120 Tonnes</td>
                                  <td style={{ padding: '1rem 0', color: 'var(--success-color)' }}>92% - Peak</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>Belagavi, Karnataka</td>
                                  <td style={{ padding: '1rem 0' }}>45 Tonnes</td>
                                  <td style={{ padding: '1rem 0', color: 'var(--warning-color)' }}>68% - Low Density</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'config' && (
              <div className="card" style={{ maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Business Configuration</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Define thresholds for when the Udant Logistics Engine intervenes autonomously without human authorization.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div>
                          <label className="label" style={{ fontWeight: 600 }}>Data Stream Frequency (Refresh interval ms)</label>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>How often the Webhook triggers new coordinates locally.</p>
                          <input className="input-field" type="number" defaultValue={2000} />
                      </div>
                      <div>
                          <label className="label" style={{ fontWeight: 600 }}>Autonomous Optimization Threshold (%)</label>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>If a truck drops below this efficiency rating, forcefully redirect it to merge loads.</p>
                          <input className="input-field" type="number" defaultValue={75} />
                      </div>
                      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={()=>alert("Superuser configs saved!")}>Update Sub-System Overrides</button>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}
