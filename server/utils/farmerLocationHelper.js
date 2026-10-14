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
    lng: 78.1674
  },
  {
    placeName: 'Salem, Tamil Nadu',
    district: 'Salem',
    address: 'AgriLink Organic Orchard Depot, Omalur Main Road, Salem, Tamil Nadu 636004, India',
    lat: 11.6643,
    lng: 78.1460
  },
  {
    placeName: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    address: 'AgriLink Regional Farm Hub, Pollachi Highway, Coimbatore, Tamil Nadu 641021, India',
    lat: 11.0168,
    lng: 76.9558
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
  // 1. If an authentic historical order snapshot already exists, preserve it!
  if (rawLoc && (rawLoc.lat || rawLoc.address)) {
    const isMandyaCoords = (rawLoc.lat && rawLoc.lng && Math.abs(Number(rawLoc.lat) - 12.5222) < 0.01 && Math.abs(Number(rawLoc.lng) - 76.9004) < 0.01);
    const addr = String(rawLoc.address || '').toLowerCase();
    const isMandyaAddr = addr.includes('mandya') || addr.includes('karnataka');

    if (!isMandyaCoords && !isMandyaAddr && rawLoc.address) {
      // Remove duplicate parenthetical repetitions, e.g. "AgriLink Hub (AgriLink Hub)"
      let cleanAddress = String(rawLoc.address).trim();
      cleanAddress = cleanAddress.replace(/\s*\(([^)]+)\)/g, (match, p1) => {
        const withoutMatch = cleanAddress.replace(match, '').trim();
        if (withoutMatch.toLowerCase().includes(p1.trim().toLowerCase())) {
          return '';
        }
        return match;
      }).trim();

      const firstSegment = cleanAddress.split(',')[0].trim();
      let placeName = rawLoc.placeName || rawLoc.district || firstSegment;
      if (placeName.toLowerCase() === firstSegment.toLowerCase()) {
        const parts = cleanAddress.split(',').map(s => s.trim()).filter(Boolean);
        placeName = parts[1] || parts[0] || 'Tamil Nadu';
      }

      return {
        lat: Number(rawLoc.lat) || 11.2189,
        lng: Number(rawLoc.lng) || 78.1674,
        address: cleanAddress,
        placeName,
        district: rawLoc.district || placeName,
        source: rawLoc.source || 'historical_order_snapshot'
      };
    }
  }

  // 2. If creating new order or resolving for farmer, prioritize farmer's verified farm address / native city
  if (loggedInUser && (loggedInUser.role === 'farmer' || loggedInUser.farmAddress || loggedInUser.nativePlace || loggedInUser.city)) {
    const farmAddr = loggedInUser.farmAddress || loggedInUser.location?.address;
    if (farmAddr) {
      const lowerAddr = String(farmAddr).toLowerCase();
      if (!lowerAddr.includes('mandya') && !lowerAddr.includes('karnataka')) {
        const placeName = loggedInUser.nativePlace || loggedInUser.city || loggedInUser.location?.placeName || 'Tamil Nadu Farm Gate';
        return {
          lat: Number(loggedInUser.location?.lat) || 11.2189,
          lng: Number(loggedInUser.location?.lng) || 78.1674,
          address: farmAddr,
          placeName,
          district: loggedInUser.nativePlace?.split(',')[0]?.trim() || loggedInUser.city || 'Tamil Nadu',
          source: 'verified_farm_address'
        };
      }
    } else if (loggedInUser.city || loggedInUser.nativePlace) {
      const nativeStr = [loggedInUser.nativePlace || loggedInUser.city, loggedInUser.state || 'Tamil Nadu'].filter(Boolean).join(', ');
      return {
        lat: Number(loggedInUser.location?.lat) || 11.2189,
        lng: Number(loggedInUser.location?.lng) || 78.1674,
        address: nativeStr,
        placeName: loggedInUser.nativePlace || loggedInUser.city,
        district: loggedInUser.city || 'Tamil Nadu',
        source: 'city_native_place'
      };
    }
  }

  // 3. Fallback: Seed-based deterministic regional farm hub
  const hub = getRandomTamilNaduHub(seedKey);
  return {
    ...hub,
    source: 'regional_hub_pickup_point'
  };
}

function sanitizeOrderFarmerDetails(order, currentUser) {
  if (!order) return order;
  const ord = typeof order.toObject === 'function' ? order.toObject() : { ...order };
  const seedKey = ord._id || ord.id || ord.orderId || ord.farmerId;

  // Authoritative identity preservation: NEVER overwrite legitimate farmer names
  if (!ord.farmerName || ord.farmerName === 'Farm Origin') {
    ord.farmerName = 'Farm Producer';
  }

  // Historical location preservation: if order already has an authentic location snapshot, preserve it!
  if (!ord.farmerLocation || !ord.farmerLocation.address) {
    ord.farmerLocation = resolveFarmerLocation(ord.farmerLocation, seedKey);
  } else {
    // Ensure placeName and address are not identical duplicates
    const firstSegment = String(ord.farmerLocation.address).split(',')[0].trim();
    if (ord.farmerLocation.placeName && ord.farmerLocation.placeName.toLowerCase() === firstSegment.toLowerCase()) {
      const parts = String(ord.farmerLocation.address).split(',').map(s => s.trim()).filter(Boolean);
      ord.farmerLocation.placeName = parts[1] || parts[0] || 'Tamil Nadu';
    }
  }

  const fLat = ord.farmerLocation?.lat || 11.2189;
  const fLng = ord.farmerLocation?.lng || 78.1674;
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
