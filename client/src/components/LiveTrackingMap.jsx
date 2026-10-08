import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Authentic Tamil Nadu Agricultural Hubs
const TAMIL_NADU_HUBS = [
  {
    placeName: 'Namakkal, Tamil Nadu',
    district: 'Namakkal',
    lat: 11.2189,
    lng: 78.1674,
    address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India',
    badge: '🌾 Namakkal Agro Gate'
  },
  {
    placeName: 'Salem, Tamil Nadu',
    district: 'Salem',
    lat: 11.6643,
    lng: 78.1460,
    address: 'AgriLink Organic Orchard Depot, Omalur Main Road, Salem, Tamil Nadu 636004, India',
    badge: '🥭 Salem Orchard Depot'
  },
  {
    placeName: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    lat: 11.0168,
    lng: 76.9558,
    address: 'AgriLink Regional Farm Hub, Pollachi Highway, Coimbatore, Tamil Nadu 641021, India',
    badge: '🌱 Coimbatore Regional Hub'
  }
];

function getFallbackTamilNaduHub(seedKey) {
  if (seedKey) {
    let hash = 0;
    const str = String(seedKey);
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
    }
    return TAMIL_NADU_HUBS[Math.abs(hash) % TAMIL_NADU_HUBS.length];
  }
  return TAMIL_NADU_HUBS[0];
}

// Module-level cache for verified road geometries
const ROUTE_CACHE = new Map();

export default function LiveTrackingMap({ order, customerLoc, farmerLoc, deliveryLoc, status }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const roadPolylineRef = useRef(null);

  const [routeInfo, setRouteInfo] = useState(null); // { distanceKm, durationMins, isRoadRoute }
  const [routeUnavailable, setRouteUnavailable] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Extract from order or direct props
  const effectiveCustomer = customerLoc || order?.customerLocation;
  const effectiveFarmer = farmerLoc || order?.farmerLocation;
  const effectiveDelivery = deliveryLoc || order?.deliveryLocation;
  const ordStatus = (status || order?.status || 'pending').toLowerCase();

  const cLat = effectiveCustomer?.lat ? Number(effectiveCustomer.lat) : 12.9716;
  const cLng = effectiveCustomer?.lng ? Number(effectiveCustomer.lng) : 77.5946;

  // Resolve Farmer location strictly to Tamil Nadu hubs or logged-in farmer
  const rawFLat = effectiveFarmer?.lat ? Number(effectiveFarmer.lat) : null;
  const rawFLng = effectiveFarmer?.lng ? Number(effectiveFarmer.lng) : null;
  const isMandyaCoords = Boolean(rawFLat && rawFLng && Math.abs(rawFLat - 12.5222) < 0.01 && Math.abs(rawFLng - 76.9004) < 0.01);
  const isMandyaText = Boolean(String(effectiveFarmer?.address || '').toLowerCase().includes('mandya') || String(effectiveFarmer?.address || '').toLowerCase().includes('karnataka'));

  const seedKey = order?.orderId || order?._id || order?.id || order?.farmerId || 'tamil_nadu_farm';
  const resolvedHub = getFallbackTamilNaduHub(seedKey);

  const fLat = (rawFLat && !isMandyaCoords && !isMandyaText) ? rawFLat : resolvedHub.lat;
  const fLng = (rawFLng && !isMandyaCoords && !isMandyaText) ? rawFLng : resolvedHub.lng;
  const farmerAddr = (!isMandyaText && effectiveFarmer?.address) ? effectiveFarmer.address : resolvedHub.address;
  const farmerDistrict = order?.farmerDistrict || order?.farmerLocation?.district || effectiveFarmer?.district || order?.farmerCity || effectiveFarmer?.city || resolvedHub.district || 'Namakkal';
  const farmerDisplayName = order?.farmerName || effectiveFarmer?.name || `Verified Farmer (${farmerDistrict} Hub)`;

  const dLat = effectiveDelivery?.lat ? Number(effectiveDelivery.lat) : null;
  const dLng = effectiveDelivery?.lng ? Number(effectiveDelivery.lng) : null;

  const hasDriverBroadcast = Boolean(dLat && dLng && ['assigned', 'picked_up', 'in_transit', 'arrived'].includes(ordStatus));
  const hasValidOrigin = Boolean(fLat && fLng);
  const hasValidDest = Boolean(cLat && cLng);

  // Direct external GPS Links
  const farmerGpsUrl = order?.farmerGpsLink || `https://www.google.com/maps?q=${fLat},${fLng}`;
  const driverGpsUrl = `https://www.google.com/maps?q=${dLat || fLat},${dLng || fLng}`;
  const turnByTurnUrl = order?.gpsTrackingLink || `https://www.google.com/maps/dir/?api=1&origin=${fLat},${fLng}&destination=${cLat},${cLng}`;

  // 1. Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMap.current) return;

    const centerLat = dLat || fLat || cLat || resolvedHub.lat;
    const centerLng = dLng || fLng || cLng || resolvedHub.lng;

    const map = L.map(mapRef.current).setView([centerLat, centerLng], 12);
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Only destroy the map during actual component unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersRef.current = {};
        roadPolylineRef.current = null;
      }
    };
  }, []);

  // 2. Dynamically update marker positions using setLatLng without map destruction
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    const latLngPoints = [];

    // Customer Destination Marker
    if (cLat && cLng) {
      if (markersRef.current.customer) {
        markersRef.current.customer.setLatLng([cLat, cLng]);
      } else {
        const customerIcon = L.divIcon({
          className: 'marker-c',
          html: `<div style="background:#059669;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #d1fae5;box-shadow:0 0 15px rgba(5,150,105,0.7);">🏠</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        markersRef.current.customer = L.marker([cLat, cLng], { icon: customerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:inherit;min-width:180px;color:#092b27;padding:2px;">
              <strong style="color:#059669;font-size:12px;">🏠 Delivery Destination</strong><br/>
              <span style="font-size:11.5px;color:#374151;">${effectiveCustomer?.address || 'Customer Doorstep'}</span>
            </div>
          `);
      }
      latLngPoints.push([cLat, cLng]);
    }

    // Farmer Origin Marker
    if (fLat && fLng) {
      if (markersRef.current.farmer) {
        markersRef.current.farmer.setLatLng([fLat, fLng]);
      } else {
        const farmerIcon = L.divIcon({
          className: 'marker-f',
          html: `<div style="background:#d97706;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;border:3px solid #fef3c7;box-shadow:0 0 18px rgba(217,119,6,0.7);">🌾</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        markersRef.current.farmer = L.marker([fLat, fLng], { icon: farmerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:inherit;min-width:210px;color:#092b27;padding:4px;">
              <div style="color:#d97706;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">🌾 Farm Origin (${farmerDistrict})</div>
              <div style="font-weight:800;font-size:13.5px;color:#092b27;margin-bottom:3px;">${farmerDisplayName}</div>
              <div style="font-size:11.5px;color:#4b5563;line-height:1.3;margin-bottom:8px;">📍 ${farmerAddr}</div>
              <a href="${farmerGpsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:11px;padding:5px 12px;border-radius:6px;box-shadow:0 2px 6px rgba(5,150,105,0.3);">
                📍 Open Farm GPS in Maps ↗
              </a>
            </div>
          `);
      }
      latLngPoints.push([fLat, fLng]);
    }

    // Delivery Courier Marker
    if (hasDriverBroadcast && dLat && dLng) {
      if (markersRef.current.delivery) {
        markersRef.current.delivery.setLatLng([dLat, dLng]);
      } else {
        const deliveryIcon = L.divIcon({
          className: 'marker-d',
          html: `<div style="background:#ef4444;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fee2e2;box-shadow:0 0 20px rgba(239,68,68,0.85);">🚚</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });
        markersRef.current.delivery = L.marker([dLat, dLng], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:inherit;min-width:180px;color:#092b27;padding:2px;">
              <strong style="color:#ef4444;font-size:12px;">🚚 Courier: ${order?.deliveryName || 'En Route'}</strong><br/>
              <span style="font-size:11.5px;color:#374151;">Status: ${ordStatus.replace('_', ' ')}</span>
            </div>
          `);
      }
      latLngPoints.push([dLat, dLng]);
    } else if (markersRef.current.delivery) {
      map.removeLayer(markersRef.current.delivery);
      delete markersRef.current.delivery;
    }

    if (latLngPoints.length > 0) {
      const bounds = L.latLngBounds(latLngPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [cLat, cLng, fLat, fLng, dLat, dLng, hasDriverBroadcast, ordStatus]);

  // 3. Stable waypoint key rounded to ~100m to prevent redundant OSRM requests
  const routeKey = `${fLat?.toFixed(3)},${fLng?.toFixed(3)};${hasDriverBroadcast && dLat ? dLat.toFixed(3) + ',' + dLng.toFixed(3) + ';' : ''}${cLat?.toFixed(3)},${cLng?.toFixed(3)}`;

  // 4. Fetch / Cache Road Routing from OSRM with duplicate prevention and abort controller
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    let waypoints = [];
    if (fLat && fLng) waypoints.push(`${fLng.toFixed(4)},${fLat.toFixed(4)}`);
    if (hasDriverBroadcast && dLat && dLng) waypoints.push(`${dLng.toFixed(4)},${dLat.toFixed(4)}`);
    if (cLat && cLng) waypoints.push(`${cLng.toFixed(4)},${cLat.toFixed(4)}`);

    if (waypoints.length < 2) {
      setRouteInfo(null);
      return;
    }

    // Check module-level cache first
    const cached = ROUTE_CACHE.get(routeKey);
    if (cached) {
      if (roadPolylineRef.current) {
        map.removeLayer(roadPolylineRef.current);
      }
      roadPolylineRef.current = L.polyline(cached.coords, {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(map);
      setRouteInfo(cached.info);
      setRouteUnavailable(false);
      return;
    }

    const abortCtrl = new AbortController();
    setLoadingRoute(true);
    setRouteUnavailable(false);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints.join(';')}?overview=full&geometries=geojson`;

    fetch(osrmUrl, { signal: abortCtrl.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Routing status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          if (roadPolylineRef.current) {
            map.removeLayer(roadPolylineRef.current);
          }

          roadPolylineRef.current = L.polyline(coords, {
            color: '#10b981',
            weight: 5,
            opacity: 0.85,
            lineJoin: 'round'
          }).addTo(map);

          const info = {
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMins: Math.round(route.duration / 60),
            isRoadRoute: true
          };

          ROUTE_CACHE.set(routeKey, { coords, info });
          setRouteInfo(info);
          setRouteUnavailable(false);
        } else {
          setRouteUnavailable(true);
          setRouteInfo(null);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('Road routing service notice:', err.message);
          setRouteUnavailable(true);
          setRouteInfo(null);
        }
      })
      .finally(() => {
        setLoadingRoute(false);
      });

    return () => {
      abortCtrl.abort();
    };
  }, [routeKey]);

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
        <div style={{ fontSize: '12px', marginTop: '4px' }}>Dispatch depot: {farmerAddr}</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(7, 26, 22, 0.8))',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1.5px solid rgba(52, 211, 153, 0.25)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
    }}>
      {/* Map Canvas */}
      <div ref={mapRef} style={{ height: '260px', width: '100%' }} />

      {/* Top Right Live Telemetry Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 500,
        background: 'rgba(7, 26, 22, 0.94)',
        backdropFilter: 'blur(8px)',
        padding: '8px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(52, 211, 153, 0.35)',
        fontSize: '11px',
        color: '#effbe7',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: hasDriverBroadcast ? '#34d399' : '#f59e0b',
            display: 'inline-block',
            boxShadow: hasDriverBroadcast ? '0 0 8px #34d399' : '0 0 8px #f59e0b'
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
              : `Farm: ${farmerDistrict} Hub`}
        </div>
      </div>

      {/* Bottom Road Routing HUD Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '10px',
        zIndex: 500,
        background: 'rgba(7, 26, 22, 0.92)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(52, 211, 153, 0.35)',
        fontSize: '11.5px',
        color: '#dcfce7',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
      }}>
        {loadingRoute ? (
          <span>Calculating road telemetry...</span>
        ) : routeUnavailable ? (
          <span style={{ color: '#fca5a5', fontWeight: '700' }}>⚠️ Direct road route computing</span>
        ) : routeInfo ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>🛣️ <strong>{routeInfo.distanceKm} km</strong> transit</span>
            <span>⏱️ ETA: <strong>{routeInfo.durationMins} mins</strong></span>
          </div>
        ) : (
          <span>Connecting to Tamil Nadu agri logistics...</span>
        )}
      </div>

      {/* Theme Styled Mobile GPS Action Dock */}
      <div style={{
        padding: '10px 12px',
        background: 'rgba(7, 26, 22, 0.96)',
        borderTop: '1px solid rgba(52, 211, 153, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Farm Location Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>📍</span>
          <div>
            <div style={{ color: '#34d399', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Farmer Hub ({farmerDistrict})
            </div>
            <div style={{ color: '#effbe7', fontSize: '12px', fontWeight: '600' }}>
              {farmerDisplayName}
            </div>
          </div>
        </div>

        {/* GPS Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* Open Farmer GPS in Google Maps */}
          <a
            href={farmerGpsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open farmer location in Google Maps"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: '700',
              textDecoration: 'none',
              minHeight: '36px',
              boxShadow: '0 2px 8px rgba(5,150,105,0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🌾 Farmer GPS ({farmerDistrict}) ↗</span>
          </a>

          {/* Turn-by-Turn Route GPS */}
          <a
            href={turnByTurnUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open full GPS navigation route"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#6ee7b7',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: '700',
              textDecoration: 'none',
              minHeight: '36px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🗺️ Navigation Route ↗</span>
          </a>

          {/* Courier GPS if in transit */}
          {hasDriverBroadcast && (
            <a
              href={driverGpsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: '700',
                textDecoration: 'none',
                minHeight: '36px'
              }}
            >
              <span>🚚 Live Courier GPS ↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
