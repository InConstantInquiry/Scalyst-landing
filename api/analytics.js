// Vercel Serverless Function — Plausible Analytics API Proxy
// Keeps the API key server-side, validates password, proxies requests to Plausible

export default async function handler(req, res) {
  // CORS headers for same-origin requests
  res.setHeader('Access-Control-Allow-Origin', 'https://scalyst.digital');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Dashboard-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate dashboard password token
  const token = req.headers['x-dashboard-token'];
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (!token || token !== dashboardPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.PLAUSIBLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Plausible API key not configured' });
  }

  try {
    const { site_id, metrics, date_range, dimensions, filters, order_by, limit } = req.body;

    const queryBody = {
      site_id: site_id || 'scalyst.digital',
      metrics: metrics || ['visitors', 'pageviews'],
      date_range: date_range || '30d',
    };

    if (dimensions) queryBody.dimensions = dimensions;
    if (filters) queryBody.filters = filters;
    if (order_by) queryBody.order_by = order_by;
    if (limit) queryBody.limit = limit;

    const response = await fetch('https://plausible.io/api/v2/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Plausible API error',
        status: response.status,
        detail: errorText,
      });
    }

    const data = await response.json();

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
