import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

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
    const centerLat = dLat || fLat || cLat || 12.5222;
    const centerLng = dLng || fLng || cLng || 76.9004;

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

    // Fit bounds to markers
    if (latLngPoints.length > 0) {
      const bounds = L.latLngBounds(latLngPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // 4. Fetch Actual Road Routing from OSRM (Open Source Routing Machine)
    // Never draw straight lines across terrain (Problem 9 - Route Bug)
    const fetchRoadRoute = async () => {
      // Build waypoints string: lng,lat;lng,lat
      let waypoints = [];
      if (fLat && fLng) waypoints.push(`${fLng},${fLat}`);
      if (hasDriverBroadcast && dLat && dLng) waypoints.push(`${dLng},${dLat}`);
      if (cLat && cLng) waypoints.push(`${cLng},${cLat}`);

      if (waypoints.length < 2) {
        setRouteInfo(null);
        return;
      }

      setLoadingRoute(true);
      setRouteUnavailable(false);

      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints.join(';')}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (!res.ok) throw new Error(`Routing status ${res.status}`);
        const data = await res.json();

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

          map.fitBounds(roadPolylineRef.current.getBounds(), { padding: [40, 40] });

          const distKm = (route.distance / 1000).toFixed(1);
          const durMins = Math.round(route.duration / 60);

          setRouteInfo({
            distanceKm: distKm,
            durationMins: durMins,
            isRoadRoute: true
          });
          setRouteUnavailable(false);
        } else {
          // If no route returned by OSRM, do NOT draw a fake straight line
          setRouteUnavailable(true);
          setRouteInfo(null);
        }
      } catch (err) {
        console.warn('Road routing service notice:', err.message);
        // Explicitly report Route Unavailable instead of pretending straight line is a road
        setRouteUnavailable(true);
        setRouteInfo(null);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoadRoute();

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

      {/* Top Right Live Telemetry Badge */}
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
              : "Waiting for driver's location"}
        </div>
      </div>

      {/* Bottom Road Routing HUD Overlay (Problem 9: Road Route, Distance, Travel Time) */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
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
        gap: '10px'
      }}>
        {loadingRoute ? (
          <span>Calculating verified road geometry...</span>
        ) : routeUnavailable ? (
          <span style={{ color: '#fca5a5', fontWeight: '700' }}>⚠️ Route unavailable</span>
        ) : routeInfo ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>🛣️ <strong>{routeInfo.distanceKm} km</strong> road route</span>
            <span>⏱️ ETA: <strong>{routeInfo.durationMins} mins</strong></span>
          </div>
        ) : (
          <span>Connecting to logistics road network...</span>
        )}
      </div>
    </div>
  );
}
