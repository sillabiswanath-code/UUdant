"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Custom destination circle
const destIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#10b981;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow: 0 1px 4px rgba(0,0,0,0.3)'></div>",
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

// Component to handle map centering dynamically
function MapController({ activeTruck, isolate }) {
    const map = useMap();
    useEffect(() => {
        if (isolate && activeTruck) {
            map.setView([activeTruck.current_location.lat, activeTruck.current_location.lng], 12);
        } else {
            map.setView([21.0, 78.0], 5);
        }
    }, [activeTruck, isolate, map]);
    return null;
}

export default function LiveMap({ activeTruck, isolate, trucksData, onMarkerClick, onMarkerClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#f8fafc', color:'#475569' }}>Loading High-Fidelity Logistics Map...</div>;

  const displayTrucks = isolate && activeTruck ? [activeTruck] : trucksData || [];

  return (
    <MapContainer 
      center={[21.0, 78.0]} 
      zoom={5} 
      style={{ height: '100%', width: '100%', minHeight: '500px', backgroundColor: '#f8fafc', zIndex: 0 }}
      zoomControl={false}
    >
      <MapController activeTruck={activeTruck} isolate={isolate} />
      
      {/* Light, Clean CartoDB Voyager Style (Perfect for Red/White OS) */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">Carto</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {displayTrucks.map(truck => (
        <div key={truck.id}>
            <Marker 
                position={[truck.current_location.lat, truck.current_location.lng]} 
                icon={truckIcon}
                eventHandlers={{
                    click: () => { if (onMarkerClick) onMarkerClick(truck) }
                }}
            >
                {isolate && activeTruck && activeTruck.id === truck.id && (
                    <Popup onClose={() => onMarkerClose && onMarkerClose()}>
                        <div style={{ color: '#0f172a', padding: '0.25rem', minWidth: '120px' }}>
                            <strong style={{ fontSize: '1rem' }}>{truck.id}</strong><br/>
                            <div style={{ marginTop: '0.25rem', color: '#64748b' }}>State: <span style={{color: '#e11d48', fontWeight: 600}}>{truck.status.toUpperCase()}</span></div>
                        </div>
                    </Popup>
                )}
            </Marker>
            
            <Polyline 
                positions={[
                    [truck.current_location.lat, truck.current_location.lng],
                    [truck.destination_location.lat, truck.destination_location.lng]
                ]} 
                pathOptions={{
                    color: truck.status === 'transit' ? '#e11d48' : '#94a3b8',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: truck.status === 'transit' ? null : '5, 8'
                }} 
            />

            <Marker 
                position={[truck.destination_location.lat, truck.destination_location.lng]} 
                icon={destIcon}
            />
        </div>
      ))}
    </MapContainer>
  );
}
