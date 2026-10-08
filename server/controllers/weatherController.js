const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * GET /api/weather/forecast
 * Server-side meteorological telemetry proxy with coordinate validation, caching, and timeout handling
 */
const getForecast = async (req, res) => {
  try {
    const rawLat = req.query.lat ?? req.query.latitude;
    const rawLon = req.query.lon ?? req.query.longitude;

    const parsedLat = parseFloat(rawLat);
    const parsedLon = parseFloat(rawLon);

    if (isNaN(parsedLat) || isNaN(parsedLon) || parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
      return res.status(400).json({
        success: false,
        isLive: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) parameters are required.'
      });
    }

    const roundedLat = parsedLat.toFixed(4);
    const roundedLon = parsedLon.toFixed(4);
    const cacheKey = `${roundedLat}_${roundedLon}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        isLive: true,
        isCached: true,
        cachedAt: cached.cachedAt,
        data: cached.data
      });
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let upstreamRes;
    try {
      upstreamRes = await fetch(openMeteoUrl, { signal: controller.signal });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          isLive: false,
          message: 'Weather service request timed out after 8 seconds.'
        });
      }
      return res.status(502).json({
        success: false,
        isLive: false,
        message: `Weather service communication error: ${fetchErr.message}`
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        success: false,
        isLive: false,
        message: `Weather provider responded with status ${upstreamRes.status}`
      });
    }

    const data = await upstreamRes.json();
    const cachedAt = new Date().toISOString();

    cache.set(cacheKey, {
      timestamp: Date.now(),
      cachedAt,
      data
    });

    return res.json({
      success: true,
      isLive: true,
      isCached: false,
      cachedAt,
      data
    });
  } catch (error) {
    console.error('Weather forecast proxy error:', error);
    return res.status(500).json({
      success: false,
      isLive: false,
      message: 'Internal weather service error'
    });
  }
};

module.exports = {
  getForecast
};
