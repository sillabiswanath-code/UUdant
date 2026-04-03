"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { users as mockUsers, listings as mockListings, contracts as mockContracts, trucks as mockTrucks } from '@/lib/mockData';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [data, setData] = useState({ users: [], listings: [], contracts: [], trucks: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync data from Supabase DB
  const fetchData = async () => {
    try {
      const [usr, lst, ctr, trk] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('listings').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('trucks').select('*')
      ]);

      return {
        users: usr.data || [],
        listings: lst.data || [],
        contracts: ctr.data || [],
        trucks: trk.data || []
      };
    } catch (e) {
      console.error("Live DB Sync Error:", e);
      return { users: [], listings: [], contracts: [], trucks: [] };
    }
  };

  // The Seeder: Triggers ONCE globally if Supabase is completely empty
  const seedLiveDB = async () => {
    console.log("Empty Supabase detected. Seeding architecture...");
    await supabase.from('users').insert(mockUsers);
    await supabase.from('listings').insert(mockListings.map(l => ({...l, lat: l.location.lat, lng: l.location.lng, location: undefined})));
    await supabase.from('contracts').insert(mockContracts);
    await supabase.from('trucks').insert(mockTrucks.map(t => ({
      ...t, 
      current_lat: t.current_location.lat, current_lng: t.current_location.lng,
      dest_lat: t.destination_location.lat, dest_lng: t.destination_location.lng,
      current_location: undefined, destination_location: undefined
    })));
  };

  useEffect(() => {
    const initializeData = async () => {
      let liveData = await fetchData();
      
      // Auto-deploy seed if tables are empty
      if (liveData.users.length === 0) {
        try {
          await seedLiveDB();
          liveData = await fetchData(); // Refetch post-seed
        } catch (e) {
          console.error("Critical failure during DB Seed", e);
        }
      }

      // 🔴 BULLETPROOF HACKATHON FALLBACK 🔴
      // If Supabase is completely unconfigured or down, we instantly inject local memory states 
      // instead of freezing the UI so the presentation never crashes.
      if (liveData.users.length === 0) {
        console.warn("🛡️ DB OFFLINE: Initializing Local Memory Fallback Matrix...");
        liveData = {
          users: mockUsers,
          contracts: mockContracts,
          listings: mockListings.map(l => ({...l, lat: l.location.lat, lng: l.location.lng, location: undefined})),
          trucks: mockTrucks.map(t => ({
            ...t, 
            current_lat: t.current_location.lat, current_lng: t.current_location.lng,
            dest_lat: t.destination_location.lat, dest_lng: t.destination_location.lng,
            current_location: undefined, destination_location: undefined
          }))
        };
      }

      // Convert flat SQL formats back to standard JSON layouts for UI parity
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

    // 🔴 Realtime Production Overhaul 🔴
    // We subscribe to all 3 dynamic tables to ensure the screens update LIVE across devices
    const channel = supabase.channel('udant_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, payload => initializeData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, payload => initializeData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trucks' }, payload => initializeData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // --- ACTIONS (Now synced to Supabase) ---

  const addListing = async (listing) => {
    const newId = `lst_${Date.now()}`;
    await supabase.from('listings').insert([{ 
      id: newId, status: 'available', ...listing, lat: listing.location.lat, lng: listing.location.lng 
    }]);
    // Supabase subscription will auto-update state
  };

  const updateListing = async (id, newListingData) => {
    await supabase.from('listings').update({
        ...newListingData, lat: newListingData.location.lat, lng: newListingData.location.lng
    }).eq('id', id);
  };

  const updateFarmerScore = async (farmerId, score) => {
    await supabase.from('users').update({ verification_score: score }).eq('id', farmerId);
  };

  const createEscrowPayment = async (buyerId, listing) => {
    const newContractId = `ctr_${Date.now()}`;
    await supabase.from('contracts').insert([{
      id: newContractId, buyer_id: buyerId, listing_id: listing.id, bid_price: listing.price_band, status: 'escrow_funded', created_at: new Date().toISOString()
    }]);
    await supabase.from('listings').update({ status: 'contracted' }).eq('id', listing.id);
  };

  const triggerReroute = async (truckId) => {
    await supabase.from('trucks').update({ efficiency_score: Math.floor(Math.random() * 15) + 85 }).eq('id', truckId);
  };

  const assignLoad = async (truckId) => {
    await supabase.from('trucks').update({ status: 'transit' }).eq('id', truckId);
  };

  const markDelivered = async (truckId, contractId) => {
    await supabase.from('trucks').update({ status: 'idle', assigned_contract_id: null }).eq('id', truckId);
    await supabase.from('contracts').update({ status: 'delivered' }).eq('id', contractId);
  };

  if (!isLoaded) return <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#0f172a', color:'white' }}><h3>Initializing Production Logistics Matrix...</h3></div>;

  return (
    <GlobalContext.Provider value={{
      ...data, addListing, updateListing, updateFarmerScore, createEscrowPayment, triggerReroute, assignLoad, markDelivered
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(GlobalContext);
}
