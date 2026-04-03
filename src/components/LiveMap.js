"use client";

import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px'
};

const mapOptions = {
    disableDefaultUI: true,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
        { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
    ]
};

export default function LiveMap({ activeTruck, isolate, trucksData, onMarkerClick, onMarkerClose }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  // Handle map centering based on isolate logic
  if (map) {
      if (isolate && activeTruck) {
          map.panTo({ lat: activeTruck.current_location.lat, lng: activeTruck.current_location.lng });
          map.setZoom(12);
      } else {
          map.panTo({ lat: 21.0, lng: 78.0 });
          map.setZoom(5);
      }
  }

  const displayTrucks = isolate && activeTruck ? [activeTruck] : trucksData || [];

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 21.0, lng: 78.0 }}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {displayTrucks.map(truck => (
        <div key={truck.id}>
            <Marker
                position={{ lat: truck.current_location.lat, lng: truck.current_location.lng }}
                icon={{
                    url: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png',
                    scaledSize: { width: 32, height: 32 }
                }}
                onClick={() => {
                    if (onMarkerClick) onMarkerClick(truck);
                }}
            />
            {isolate && activeTruck && activeTruck.id === truck.id && (
                <InfoWindow
                    position={{ lat: truck.current_location.lat, lng: truck.current_location.lng }}
                    onCloseClick={() => {
                        if (onMarkerClose) onMarkerClose();
                    }}
                >
                    <div style={{ color: 'black', padding: '0.25rem' }}>
                        <strong style={{ fontSize: '1rem' }}>{truck.id}</strong><br/>
                        State: {truck.status.toUpperCase()}
                    </div>
                </InfoWindow>
            )}
            
            <Polyline
                path={[
                    { lat: truck.current_location.lat, lng: truck.current_location.lng },
                    { lat: truck.destination_location.lat, lng: truck.destination_location.lng }
                ]}
                options={{
                    strokeColor: truck.status === 'transit' ? '#e11d48' : '#94a3b8',
                    strokeOpacity: 0.8,
                    strokeWeight: 3
                }}
            />
            
            <Marker 
                position={{ lat: truck.destination_location.lat, lng: truck.destination_location.lng }}
                icon={{
                    path: 'M 0,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0', // Vector circle
                    fillColor: '#10b981',
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 2,
                    scale: 1.5
                }}
            />
        </div>
      ))}
    </GoogleMap>
  ) : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#1e293b', color:'white' }}>Authenticating Google API Key...</div>;
}
