import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveTrackingMap({ customerLoc, farmerLoc, deliveryLoc, status = 'in_transit' }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  const cLat = customerLoc?.lat || 12.9716;
  const cLng = customerLoc?.lng || 77.5946;

  const fLat = farmerLoc?.lat || 12.5222;
  const fLng = farmerLoc?.lng || 76.9004;

  const dLat = deliveryLoc?.lat || (fLat + cLat) / 2;
  const dLng = deliveryLoc?.lng || (fLng + cLng) / 2;

  // Initialize Map Once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current).setView([dLat, dLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(leafletMap.current);

    // Customer Marker (Leaf Green)
    const customerIcon = L.divIcon({
      className: 'marker-c',
      html: `<div style="background:#2E7D32;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #F1F8E9;box-shadow:0 0 15px #2E7D32;">🏠</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    markersRef.current.customer = L.marker([cLat, cLng], { icon: customerIcon })
      .addTo(leafletMap.current)
      .bindPopup('<b>Customer Location</b>');

    // Farmer Marker (Soil Brown)
    const farmerIcon = L.divIcon({
      className: 'marker-f',
      html: `<div style="background:#8D5E34;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #F1F8E9;box-shadow:0 0 15px #8D5E34;">🌾</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    markersRef.current.farmer = L.marker([fLat, fLng], { icon: farmerIcon })
      .addTo(leafletMap.current)
      .bindPopup('<b>Farmer Origin (Pickup)</b>');

    // Delivery Marker (Fresh Produce Red)
    const deliveryIcon = L.divIcon({
      className: 'marker-d',
      html: `<div style="background:#E53935;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #F1F8E9;box-shadow:0 0 20px #E53935;animation:pulse 1.5s infinite;">🚚</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    markersRef.current.delivery = L.marker([dLat, dLng], { icon: deliveryIcon })
      .addTo(leafletMap.current)
      .bindPopup('<b>Delivery Driver (Live GPS)</b>');

    // Polyline Route (Harvest Gold)
    polylineRef.current = L.polyline([[fLat, fLng], [dLat, dLng], [cLat, cLng]], {
      color: '#F9A825',
      dashArray: '8, 8',
      weight: 5
    }).addTo(leafletMap.current);

    const bounds = L.latLngBounds([[cLat, cLng], [fLat, fLng], [dLat, dLng]]);
    leafletMap.current.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Smoothly update positions without tearing down map instance
  useEffect(() => {
    if (!leafletMap.current) return;

    if (markersRef.current.customer) {
      markersRef.current.customer.setLatLng([cLat, cLng]);
    }
    if (markersRef.current.farmer) {
      markersRef.current.farmer.setLatLng([fLat, fLng]);
    }
    if (markersRef.current.delivery) {
      markersRef.current.delivery.setLatLng([dLat, dLng]);
    }
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([[fLat, fLng], [dLat, dLng], [cLat, cLng]]);
    }
  }, [cLat, cLng, fLat, fLng, dLat, dLng]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={mapRef} style={{ height: '320px', width: '100%', borderRadius: '16px', border: '1.5px solid #8D5E34' }} />
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000, background: 'rgba(230, 215, 168, 0.95)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '12px', border: '1px solid #8D5E34', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }}></span>
          <strong style={{ color: '#1B5E20' }}>Live GPS Stream Active</strong>
        </div>
        <div style={{ fontSize: '11px', color: '#8D5E34', fontWeight: '700' }}>
          Status: <span style={{ color: '#E53935', fontWeight: '800' }}>{status.toUpperCase().replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
}
