import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveTrackingMap({ order, customerLoc, farmerLoc, deliveryLoc, status }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  // Extract from order or direct props
  const effectiveCustomer = customerLoc || order?.customerLocation;
  const effectiveFarmer = farmerLoc || order?.farmerLocation;
  const effectiveDelivery = deliveryLoc || order?.deliveryLocation;
  const ordStatus = (status || order?.status || 'pending').toLowerCase();

  const cLat = effectiveCustomer?.lat ? Number(effectiveCustomer.lat) : null;
  const cLng = effectiveCustomer?.lng ? Number(effectiveCustomer.lng) : null;

  const fLat = effectiveFarmer?.lat ? Number(effectiveFarmer.lat) : null;
  const fLng = effectiveFarmer?.lng ? Number(effectiveFarmer.lng) : null;

  const dLat = effectiveDelivery?.lat ? Number(effectiveDelivery.lat) : null;
  const dLng = effectiveDelivery?.lng ? Number(effectiveDelivery.lng) : null;

  const hasDriverBroadcast = Boolean(dLat && dLng && ['assigned', 'picked_up', 'in_transit', 'arrived'].includes(ordStatus));
  const hasValidOrigin = Boolean(fLat && fLng);
  const hasValidDest = Boolean(cLat && cLng);

  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Leaflet map is already initialized on this node
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    // Default center fallback if coordinates missing
    const centerLat = fLat || cLat || 12.5222;
    const centerLng = fLng || cLng || 76.9004;

    const map = L.map(mapRef.current).setView([centerLat, centerLng], 12);
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const latLngPoints = [];

    // 1. Customer Destination Marker
    if (cLat && cLng) {
      const customerIcon = L.divIcon({
        className: 'marker-c',
        html: `<div style="background:#2E7D32;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #F1F8E9;box-shadow:0 0 15px rgba(46,125,50,0.6);">🏠</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      markersRef.current.customer = L.marker([cLat, cLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>Delivery Address</b><br/>${effectiveCustomer?.address || 'Customer Location'}`);
      latLngPoints.push([cLat, cLng]);
    }

    // 2. Farmer Origin Marker
    if (fLat && fLng) {
      const farmerIcon = L.divIcon({
        className: 'marker-f',
        html: `<div style="background:#8D5E34;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #F1F8E9;box-shadow:0 0 15px rgba(141,94,52,0.6);">🌾</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      markersRef.current.farmer = L.marker([fLat, fLng], { icon: farmerIcon })
        .addTo(map)
        .bindPopup(`<b>Farm Origin (Pickup)</b><br/>${order?.farmerName || 'Partner Farm'}`);
      latLngPoints.push([fLat, fLng]);
    }

    // 3. Delivery Courier Marker (only if broadcasted)
    if (hasDriverBroadcast) {
      const deliveryIcon = L.divIcon({
        className: 'marker-d',
        html: `<div style="background:#E53935;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #F1F8E9;box-shadow:0 0 20px rgba(229,57,53,0.8);">🚚</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });
      markersRef.current.delivery = L.marker([dLat, dLng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup(`<b>Courier: ${order?.deliveryName || 'En Route'}</b><br/>Status: ${ordStatus.replace('_', ' ')}`);
      latLngPoints.push([dLat, dLng]);
    }

    // 4. Polyline Route if 2 or more points
    if (latLngPoints.length >= 2) {
      polylineRef.current = L.polyline(latLngPoints, {
        color: '#F9A825',
        dashArray: '8, 8',
        weight: 4
      }).addTo(map);

      const bounds = L.latLngBounds(latLngPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [cLat, cLng, fLat, fLng, dLat, dLng, ordStatus]);

  if (!hasValidOrigin && !hasValidDest) {
    return (
      <div style={{
        height: '180px',
        background: 'rgba(9, 43, 39, 0.4)',
        border: '1px dashed rgba(110, 219, 208, 0.25)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a3c2b0',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
        <div style={{ color: '#effbe7', fontWeight: '700', fontSize: '13.5px' }}>Location coordinates unavailable</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>Dispatch depot address: {effectiveCustomer?.address || 'Standard Delivery Region'}</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={mapRef} style={{ height: '280px', width: '100%', borderRadius: '16px', border: '1.5px solid rgba(110, 219, 208, 0.25)' }} />

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 500,
        background: 'rgba(7, 26, 22, 0.92)',
        backdropFilter: 'blur(8px)',
        padding: '8px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(110, 219, 208, 0.3)',
        fontSize: '11.5px',
        color: '#effbe7'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: hasDriverBroadcast ? '#37bd78' : '#f4c95d',
            display: 'inline-block'
          }}></span>
          <strong style={{ color: '#effbe7' }}>
            {hasDriverBroadcast ? 'Live GPS Broadcast' : 'Radar Polling (5s)'}
          </strong>
        </div>
        <div style={{ color: '#a3c2b0' }}>
          {hasDriverBroadcast
            ? `Driver: ${order?.deliveryName || 'Assigned Courier'}`
            : ordStatus === 'delivered'
              ? 'Delivery Complete'
              : 'Awaiting Driver Transit Ping'}
        </div>
      </div>
    </div>
  );
}
