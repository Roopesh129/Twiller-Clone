const UAParser = require('ua-parser-js');

function parseUserAgent(req) {
  const uaString = req.headers['user-agent'] || '';
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  // Extract IP address (handles proxies/X-Forwarded-For)
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';

  // Determine device category
  let deviceType = result.device.type || 'desktop'; // Default to desktop if undefined

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    deviceType,
    ipAddress
  };
}

// Check if current time is between 10:00 AM and 1:00 PM
function isWithinMobileTimeWindow() {
  const now = new Date();
  const hours = now.getHours();
  // 10:00 AM (10) to 1:00 PM (13)
  return hours >= 10 && hours < 13;
}

module.exports = { parseUserAgent, isWithinMobileTimeWindow };