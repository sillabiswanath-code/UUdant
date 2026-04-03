"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { users as mockUsers, listings as mockListings, contracts as mockContracts, trucks as mockTrucks } from '@/lib/mockData';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [data, setData] = useState({ users: [], listings: [], contracts: [], trucks: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiveDB, setIsLiveDB] = useState(false);

  const fetchData = async () => {
    try {
      const [usr, lst, ctr, trk] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('listings').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('trucks').select('*')
      ]);
      return { users: usr.data || [], listings: lst.data || [], contracts: ctr.data || [], trucks: trk.data || [] };
    } catch (e) {
      console.error("Live DB Sync Error:", e);
      return { users: [], listings: [], contracts: [], trucks: [] };
    }
  };

  const seedLiveDB = async () => {
    console.log("Empty Supabase detected. Seeding architecture...");
    await supabase.from('users').insert(mockUsers);
    await supabase.from('listings').insert(mockListings.map(l => ({...l, lat: l.location.lat, lng: l.location.lng, location: undefined})));
    await supabase.from('contracts').insert(mockContracts);
    await supabase.from('trucks').insert(mockTrucks.map(t => ({
      ...t, current_lat: t.current_location.lat, current_lng: t.current_location.lng,
      dest_lat: t.destination_location.lat, dest_lng: t.destination_location.lng,
      current_location: undefined, destination_location: undefined
    })));
  };

  useEffect(() => {
    const initializeData = async () => {
      let liveData = await fetchData();
      if (liveData.users.length === 0) {
        try { await seedLiveDB(); liveData = await fetchData(); } catch (e) { console.error("Seed failed", e); }
      }

      if (liveData.users.length === 0) {
        console.warn("🛡️ DB OFFLINE: Local Memory Fallback");
        setIsLiveDB(false);
        liveData = {
          users: mockUsers,
          contracts: mockContracts,
          listings: mockListings.map(l => ({...l, lat: l.location.lat, lng: l.location.lng, location: undefined})),
          trucks: mockTrucks.map(t => ({
            ...t, current_lat: t.current_location.lat, current_lng: t.current_location.lng,
            dest_lat: t.destination_location.lat, dest_lng: t.destination_location.lng,
            current_location: undefined, destination_location: undefined
          }))
        };
      } else {
        setIsLiveDB(true);
      }

      setData({
        users: liveData.users,
        contracts: liveData.contracts,
        listings: liveData.listings.map(l => ({...l, location: { lat: l.lat, lng: l.lng }})),
        trucks: liveData.trucks.map(t => ({
          ...t,
          current_location: { lat: t.current_lat, lng: t.current_lng },
          destination_location: { lat: t.dest_lat, lng: t.dest_lng }
        }))
      });
      setIsLoaded(true);
    };

    initializeData();

    const channel = supabase.channel('udant_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => initializeData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => initializeData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trucks' }, () => initializeData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // All actions update local state immediately (fallback-safe)
  const addListing = async (listing) => {
    const newId = `lst_${Date.now()}`;
    const entry = { id: newId, status: 'available', ...listing, lat: listing.location.lat, lng: listing.location.lng };
    supabase.from('listings').insert([entry]).then(() => {});
    setData(prev => ({ ...prev, listings: [...prev.listings, { ...entry, location: { lat: entry.lat, lng: entry.lng } }] }));
  };

  const updateListing = async (id, newData) => {
    supabase.from('listings').update({ ...newData, lat: newData.location?.lat, lng: newData.location?.lng }).eq('id', id).then(() => {});
    setData(prev => ({ ...prev, listings: prev.listings.map(l => l.id === id ? { ...l, ...newData } : l) }));
  };

  const updateFarmerScore = async (farmerId, score) => {
    supabase.from('users').update({ verification_score: score }).eq('id', farmerId).then(() => {});
    setData(prev => ({ ...prev, users: prev.users.map(u => u.id === farmerId ? { ...u, verification_score: score } : u) }));
  };

  const createEscrowPayment = async (buyerId, listing) => {
    const newContractId = `ctr_${Date.now()}`;
    const newContract = { id: newContractId, buyer_id: buyerId, listing_id: listing.id, bid_price: listing.price_band, status: 'escrow_funded', created_at: new Date().toISOString() };
    supabase.from('contracts').insert([newContract]).then(() => {});
    supabase.from('listings').update({ status: 'contracted' }).eq('id', listing.id).then(() => {});
    setData(prev => ({
      ...prev,
      contracts: [...prev.contracts, newContract],
      listings: prev.listings.map(l => l.id === listing.id ? { ...l, status: 'contracted' } : l)
    }));
  };

  const triggerReroute = async (truckId) => {
    const newScore = Math.floor(Math.random() * 15) + 85;
    supabase.from('trucks').update({ efficiency_score: newScore }).eq('id', truckId).then(() => {});
    setData(prev => ({ ...prev, trucks: prev.trucks.map(t => t.id === truckId ? { ...t, efficiency_score: newScore } : t) }));
  };

  const assignLoad = async (truckId) => {
    supabase.from('trucks').update({ status: 'transit' }).eq('id', truckId).then(() => {});
    setData(prev => ({ ...prev, trucks: prev.trucks.map(t => t.id === truckId ? { ...t, status: 'transit' } : t) }));
  };

  const markDelivered = async (truckId, contractId) => {
    supabase.from('trucks').update({ status: 'idle', assigned_contract_id: null }).eq('id', truckId).then(() => {});
    supabase.from('contracts').update({ status: 'delivered' }).eq('id', contractId).then(() => {});
    setData(prev => ({
      ...prev,
      trucks: prev.trucks.map(t => t.id === truckId ? { ...t, status: 'idle', assigned_contract_id: null } : t),
      contracts: prev.contracts.map(c => c.id === contractId ? { ...c, status: 'delivered' } : c)
    }));
  };

  if (!isLoaded) return (
    <div style={{ display:'flex', minHeight:'100vh', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0f172a', color:'white', gap:'1.5rem' }}>
      <div style={{ width:'48px', height:'48px', border:'3px solid #334155', borderTopColor:'#e11d48', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'#64748b', fontSize:'0.875rem', letterSpacing:'0.05em' }}>INITIALIZING UDANT LOGISTICS MATRIX…</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <GlobalContext.Provider value={{ ...data, isLiveDB, addListing, updateListing, updateFarmerScore, createEscrowPayment, triggerReroute, assignLoad, markDelivered }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalData() { return useContext(GlobalContext); }
