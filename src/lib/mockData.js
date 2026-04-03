export const users = Array.from({ length: 30 }).map((_, i) => ({
  id: `usr_${i + 1}`,
  name: i < 15 ? `Farmer ${i + 1}` : `Buyer Company ${i - 14}`,
  role: i < 15 ? 'producer' : 'consumer',
  location: i < 15 ? ['Karnataka', 'Maharashtra', 'Punjab', 'Haryana', 'Andhra Pradesh'][i % 5] : ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][i % 5],
  verification_score: i < 15 ? Math.floor(Math.random() * 40) + 60 : null, // 60-100
  phone: `+91 98765 432${i.toString().padStart(2, '0')}`,
}));

export const crops = [
  'Wheat', 'Rice (Basmati)', 'Sugarcane', 'Cotton', 'Maize', 'Soybean', 
  'Chana (Chickpea)', 'Tomato', 'Onion', 'Mango', 'Banana', 'Grapes', 
  'Turmeric', 'Chilli', 'Groundnut'
];

export const listings = Array.from({ length: 40 }).map((_, i) => ({
  id: `lst_${i + 1}`,
  producer_id: `usr_${(i % 15) + 1}`,
  crop_type: crops[i % crops.length],
  quantity_tonnes: Math.floor(Math.random() * 50) + 5,
  quality_grade: ['Grade A', 'Grade B', 'Premium', 'Standard'][i % 4],
  price_band: Math.floor(Math.random() * 3000) + 1000, // INR per tonne
  status: ['available', 'negotiating', 'contracted'][Math.floor(Math.random() * 3)],
  harvest_date: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
  location: {
    lat: 19 + (Math.random() * 5), // Strictly inland Central India
    lng: 75 + (Math.random() * 6)
  }
}));

export const contracts = Array.from({ length: 25 }).map((_, i) => ({
  id: `ctr_${i + 1}`,
  buyer_id: `usr_${16 + (i % 10)}`, // Consumer IDs
  listing_id: `lst_${i + 1}`,
  bid_price: Math.floor(Math.random() * 3000) + 1200,
  status: ['pending', 'accepted', 'escrow_funded', 'transit', 'delivered'][Math.floor(Math.random() * 5)],
  created_at: new Date(Date.now() - (Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString()
}));

export const trucks = Array.from({ length: 20 }).map((_, i) => ({
  id: `trk_${i + 1}`,
  driver_name: `Driver ${i + 1}`,
  contact: `+91 88888 777${i.toString().padStart(2, '0')}`,
  capacity_tonnes: [10, 15, 20, 25, 40][i % 5],
  status: ['idle', 'loading', 'transit', 'completed'][Math.floor(Math.random() * 4)],
  assigned_contract_id: i < 15 ? `ctr_${i + 1}` : null,
  current_location: {
    lat: 19 + Math.random() * 5,
    lng: 75 + Math.random() * 6
  },
  destination_location: {
    lat: 19 + Math.random() * 5,
    lng: 75 + Math.random() * 6
  },
  efficiency_score: Math.floor(Math.random() * 20) + 80 // 80-100%
}));

export const udantControl = {
  getProducerVerification: () => {
    return users.filter(u => u.role === 'producer');
  },
  getSystemAlerts: () => [
    { id: 1, type: 'warning', message: 'High load volume detected in Maharashtra route.' },
    { id: 2, type: 'success', message: 'Escrow payment processed for Contract ctr_3.' },
    { id: 3, type: 'error', message: 'Truck trk_8 delayed by 2 hours due to weather.' }
  ]
};
