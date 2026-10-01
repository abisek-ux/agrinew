import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Loader2, MapPin } from 'lucide-react';

export default function MapPicker({ location, onSelectLocation, height = '220px' }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const [resolving, setResolving] = useState(false);

  const defaultLat = location?.lat || 12.9716;
  const defaultLng = location?.lng || 77.5946;

  // Reverse geocodes coordinates to a human-readable address & hometown name
  const reverseGeocode = async (lat, lng) => {
    try {
      setResolving(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (!res.ok) throw new Error('Reverse geocoding failed');
      const data = await res.json();

      const addr = data.address || {};
      const locality =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        '';
      const state = addr.state || addr.region || '';
      const country = addr.country || '';

      let placeName = [locality, state].filter(Boolean).join(', ');
      if (!placeName && country) placeName = country;
      if (!placeName) {
        placeName =
          data.display_name?.split(',').slice(0, 2).join(', ').trim() ||
          `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      return {
        lat,
        lng,
        address: data.display_name || placeName,
        placeName
      };
    } catch (err) {
      console.warn('Reverse geocoding warning:', err);
      return {
        lat,
        lng,
        address: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        placeName: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      };
    } finally {
      setResolving(false);
    }
  };

  const handleLocationChange = async (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    const result = await reverseGeocode(lat, lng);
    if (onSelectLocation) {
      onSelectLocation(result);
    }
  };

  const handleUseCurrentLocation = (e) => {
    e?.preventDefault();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setResolving(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (leafletMap.current) {
          leafletMap.current.setView([lat, lng], 13);
        }
        handleLocationChange(lat, lng);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setResolving(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);

      const customIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `<div style="background:#2E7D32;width:20px;height:20px;border-radius:50%;border:3px solid #F1F8E9;box-shadow:0 0 12px #2E7D32;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      markerRef.current = L.marker([defaultLat, defaultLng], {
        icon: customIcon,
        draggable: true
      }).addTo(leafletMap.current);

      leafletMap.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        handleLocationChange(lat, lng);
      });

      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        handleLocationChange(lat, lng);
      });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update map and marker if location coordinates change externally
  useEffect(() => {
    if (leafletMap.current && location?.lat && location?.lng) {
      const currentCenter = leafletMap.current.getCenter();
      const diffLat = Math.abs(currentCenter.lat - location.lat);
      const diffLng = Math.abs(currentCenter.lng - location.lng);
      if (diffLat > 0.001 || diffLng > 0.001) {
        leafletMap.current.setView([location.lat, location.lng], 13);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
      }
    }
  }, [location?.lat, location?.lng]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={mapRef}
        style={{
          height,
          width: '100%',
          borderRadius: '12px',
          border: '1.5px solid #8D5E34',
          zIndex: 1
        }}
      />

      {/* Helper badges overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          zIndex: 1000,
          background: 'rgba(230, 215, 168, 0.95)',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#1B5E20',
          fontWeight: '700',
          border: '1px solid #8D5E34',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        {resolving ? (
          <>
            <Loader2 size={12} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Fetching location details...</span>
          </>
        ) : (
          <>
            <MapPin size={12} />
            <span>Click map or drag pin to select hometown</span>
          </>
        )}
      </div>

      {/* Quick GPS button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        title="Use my current device location"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 1000,
          background: '#2E7D32',
          color: '#ffffff',
          border: '1px solid #F1F8E9',
          borderRadius: '8px',
          padding: '5px 9px',
          fontSize: '11px',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      >
        <Navigation size={12} />
        <span>Use My GPS</span>
      </button>
    </div>
  );
}
