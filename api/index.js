module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    message: 'Interior Design Planner API running 🏠',
    endpoints: [
      '/api/rooms',
      '/api/furniture',
      '/api/lighting',
      '/api/flooring',
      '/api/colors'
    ]
  });
};
