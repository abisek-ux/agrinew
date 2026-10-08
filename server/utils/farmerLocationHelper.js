/**
 * Farmer Location & Tamil Nadu Agricultural Hub Helper
 * Dynamically resolves farmer origins to authentic Tamil Nadu hubs (Namakkal, Salem, Coimbatore)
 * or to the authenticated logged-in farmer's location, eliminating any hardcoded Mandya / Robert defaults.
 */

const TAMIL_NADU_HUBS = [
  {
    placeName: 'Namakkal, Tamil Nadu',
    district: 'Namakkal',
    address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India',
    lat: 11.2189,
    lng: 78.1674,
    defaultFarmerName: 'gowres (Namakkal Farmer)'
  },
  {
    placeName: 'Salem, Tamil Nadu',
    district: 'Salem',
    address: 'AgriLink Organic Orchard Depot, Omalur Main Road, Salem, Tamil Nadu 636004, India',
    lat: 11.6643,
    lng: 78.1460,
    defaultFarmerName: 'Selvam P (Salem Orchard)'
  },
  {
    placeName: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    address: 'AgriLink Regional Farm Hub, Pollachi Highway, Coimbatore, Tamil Nadu 641021, India',
    lat: 11.0168,
    lng: 76.9558,
    defaultFarmerName: 'Kandasamy R (Coimbatore Agro)'
  }
];

/**
 * Returns a random or deterministically seeded Tamil Nadu hub.
 * @param {string|number} seedKey - Optional seed (e.g. orderId, farmerId) to maintain consistency per order
 */
function getRandomTamilNaduHub(seedKey) {
  if (seedKey) {
    let hash = 0;
    const str = String(seedKey);
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % TAMIL_NADU_HUBS.length;
    return { ...TAMIL_NADU_HUBS[idx] };
  }
  const randomIdx = Math.floor(Math.random() * TAMIL_NADU_HUBS.length);
  return { ...TAMIL_NADU_HUBS[randomIdx] };
}

/**
 * Resolves farmer location, checking:
 * 1. Logged-in farmer profile location (if non-Mandya)
 * 2. Raw location if valid non-Mandya
 * 3. Seed-based random distribution among Namakkal, Salem, Coimbatore
 */
function resolveFarmerLocation(rawLoc, seedKey, loggedInUser) {
  // If the logged-in user is a farmer, prioritize their verified location
  if (loggedInUser && loggedInUser.role === 'farmer') {
    if (loggedInUser.location?.lat && loggedInUser.location?.lng) {
      const addr = String(loggedInUser.location.address || '').toLowerCase();
      if (!addr.includes('mandya') && !addr.includes('karnataka')) {
        return {
          lat: Number(loggedInUser.location.lat),
          lng: Number(loggedInUser.location.lng),
          address: loggedInUser.location.address,
          placeName: loggedInUser.nativePlace || loggedInUser.location.placeName || 'Tamil Nadu Farm Gate',
          district: loggedInUser.nativePlace?.split(',')[0]?.trim() || 'Tamil Nadu'
        };
      }
    }
  }

  // If raw location provided and does not refer to Mandya / Karnataka defaults
  if (rawLoc && rawLoc.lat && rawLoc.lng) {
    const isMandyaCoords = (Math.abs(Number(rawLoc.lat) - 12.5222) < 0.01 && Math.abs(Number(rawLoc.lng) - 76.9004) < 0.01);
    const addr = String(rawLoc.address || '').toLowerCase();
    const isMandyaAddr = addr.includes('mandya') || addr.includes('karnataka');

    if (!isMandyaCoords && !isMandyaAddr) {
      return {
        lat: Number(rawLoc.lat),
        lng: Number(rawLoc.lng),
        address: rawLoc.address || 'Tamil Nadu Farm Gate',
        placeName: rawLoc.placeName || rawLoc.address?.split(',')[0] || 'Farm Gate',
        district: rawLoc.placeName?.split(',')[0] || 'Tamil Nadu'
      };
    }
  }

  // Fallback: Random / deterministic allocation across Namakkal, Salem, Coimbatore
  return getRandomTamilNaduHub(seedKey);
}

function sanitizeOrderFarmerDetails(order, currentUser) {
  if (!order) return order;
  const ord = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  const seedKey = ord._id || ord.id || ord.orderId || ord.farmerId;

  const hub = resolveFarmerLocation(ord.farmerLocation, seedKey);

  // Authoritative identity preservation: NEVER overwrite legitimate farmer names
  if (!ord.farmerName || ord.farmerName === 'Farm Origin') {
    ord.farmerName = hub.defaultFarmerName || 'Farm Producer';
  }

  ord.farmerLocation = hub;
  const fLat = hub.lat;
  const fLng = hub.lng;
  ord.farmerGpsLink = `https://www.google.com/maps?q=${fLat},${fLng}`;

  const cLat = ord.customerLocation?.lat || 12.9716;
  const cLng = ord.customerLocation?.lng || 77.5946;
  ord.gpsTrackingLink = `https://www.google.com/maps/dir/?api=1&origin=${fLat},${fLng}&destination=${cLat},${cLng}`;

  return ord;
}

module.exports = {
  TAMIL_NADU_HUBS,
  getRandomTamilNaduHub,
  resolveFarmerLocation,
  sanitizeOrderFarmerDetails
};
