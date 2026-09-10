// ponytail: Built with 100% native Node.js standard libraries (http, child_process, fs, path). Zero npm bloat.
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Helper to run shell commands with UTF-8 support on Windows
function runCmd(cmd) {
  return new Promise((resolve) => {
    // Force UTF-8 code page on Windows netsh
    exec(`chcp 65001 >nul && ${cmd}`, { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' }, (err, stdout) => {
      if (err) {
        resolve('');
        return;
      }
      resolve(stdout || '');
    });
  });
}

// Parse active interface telemetry
async function getCurrentInterface() {
  const raw = await runCmd('netsh wlan show interfaces');
  if (!raw || !raw.includes('State')) {
    return { connected: false, message: 'No Wi-Fi interface detected or Wi-Fi is disabled' };
  }

  const getField = (pattern) => {
    const match = raw.match(pattern);
    return match ? match[1].trim() : '';
  };

  const state = getField(/^\s*State\s*:\s*(.+)$/m);
  const isConnected = state.toLowerCase() === 'connected';

  return {
    connected: isConnected,
    name: getField(/^\s*Name\s*:\s*(.+)$/m),
    description: getField(/^\s*Description\s*:\s*(.+)$/m),
    state: state || 'Disconnected',
    ssid: getField(/^\s*SSID\s*:\s*(.+)$/m),
    bssid: getField(/^\s*AP BSSID\s*:\s*(.+)$/m),
    band: getField(/^\s*Band\s*:\s*(.+)$/m) || '2.4 GHz',
    channel: getField(/^\s*Channel\s*:\s*(.+)$/m),
    radioType: getField(/^\s*Radio type\s*:\s*(.+)$/m),
    authentication: getField(/^\s*Authentication\s*:\s*(.+)$/m),
    cipher: getField(/^\s*Cipher\s*:\s*(.+)$/m),
    receiveRateMbps: parseFloat(getField(/^\s*Receive rate \(Mbps\)\s*:\s*([\d.]+)/m)) || 0,
    transmitRateMbps: parseFloat(getField(/^\s*Transmit rate \(Mbps\)\s*:\s*([\d.]+)/m)) || 0,
    signalPercent: parseInt(getField(/^\s*Signal\s*:\s*(\d+)%/m), 10) || 0,
    rssi: getField(/^\s*Rssi\s*:\s*(-?\d+)/m) ? `${getField(/^\s*Rssi\s*:\s*(-?\d+)/m)} dBm` : '-65 dBm',
    profile: getField(/^\s*Profile\s*:\s*(.+)$/m),
    timestamp: new Date().toISOString()
  };
}

// Parse all saved profiles and extract cleartext passwords
async function getAllProfiles() {
  const raw = await runCmd('netsh wlan show profiles');
  const profileMatches = [...raw.matchAll(/All User Profile\s*:\s*(.+)/gi)];
  const profileNames = profileMatches.map(m => m[1].trim()).filter(Boolean);

  // Parse each profile details in parallel
  const profilePromises = profileNames.map(async (name) => {
    const detailRaw = await runCmd(`netsh wlan show profile name="${name.replace(/"/g, '\\"')}" key=clear`);
    
    const getVal = (pattern) => {
      const match = detailRaw.match(pattern);
      return match ? match[1].trim() : '';
    };

    // Extract authentication types (might have multiple like WPA3 & WPA2)
    const authMatches = [...detailRaw.matchAll(/Authentication\s*:\s*(.+)/gi)].map(m => m[1].trim());
    const cipherMatches = [...detailRaw.matchAll(/Cipher\s*:\s*(.+)/gi)].map(m => m[1].trim());
    
    // Key content (the password)
    const keyMatch = detailRaw.match(/Key Content\s*:\s*(.+)/i);
    const password = keyMatch ? keyMatch[1] : '';
    const hasKey = /Security key\s*:\s*Present/i.test(detailRaw);

    const connectionMode = getVal(/Connection mode\s*:\s*(.+)/i) || 'Manual';
    const radioType = getVal(/Radio type\s*:\s*(.+)/i) || 'Any Radio';

    return {
      name,
      ssid: name,
      password: password || (hasKey ? '(Protected / Hidden)' : '(Open / No Password)'),
      hasPassword: Boolean(password),
      isOpen: !hasKey && !password,
      authentication: authMatches.length > 0 ? [...new Set(authMatches)].join(' / ') : 'WPA2-Personal',
      cipher: cipherMatches.length > 0 ? [...new Set(cipherMatches)].join(', ') : 'CCMP',
      connectionMode,
      radioType,
      type: detailRaw.includes('WPA3') ? 'WPA3' : (detailRaw.includes('WPA2') ? 'WPA2' : (hasKey ? 'WEP/WPA' : 'OPEN'))
    };
  });

  const profiles = await Promise.all(profilePromises);
  return profiles;
}

// Parse live nearby broadcast Wi-Fi networks
async function getNearbyNetworks() {
  let raw = await runCmd('powershell -NoProfile -ExecutionPolicy Bypass -File "src/utils/scanHelper.ps1"');
  if (!raw || !raw.includes('SSID')) {
    raw = await runCmd('netsh wlan show networks mode=bssid');
  }

  const networks = [];
  if (!raw) return networks;

  const sections = raw.split(/SSID\s+\d+\s+:\s+/i);
  sections.shift(); // Remove header

  const savedProfiles = await getAllProfiles();
  const profileMap = new Map();
  savedProfiles.forEach(p => {
    profileMap.set(p.ssid.toLowerCase(), p);
  });

  for (const sec of sections) {
    const lines = sec.split('\n');
    const ssid = lines[0].trim();
    if (!ssid) continue;

    const getVal = (pattern) => {
      const m = sec.match(pattern);
      return m ? m[1].trim() : '';
    };

    const auth = getVal(/Authentication\s*:\s*(.+)/i) || 'WPA2-Personal';
    const enc = getVal(/Encryption\s*:\s*(.+)/i) || 'CCMP';
    const bssid = getVal(/BSSID\s+\d+\s*:\s*([a-f0-9:]{17})/i);
    const signal = parseInt(getVal(/Signal\s*:\s*(\d+)%/i), 10) || 50;
    const radio = getVal(/Radio type\s*:\s*(.+)/i) || '802.11n';
    const band = getVal(/Band\s*:\s*(.+)/i) || (sec.includes('5 GHz') ? '5 GHz' : '2.4 GHz');
    const channel = getVal(/Channel\s*:\s*(\d+)/i) || 'Auto';

    const saved = profileMap.get(ssid.toLowerCase());
    const isOpen = auth.toLowerCase().includes('open') || enc.toLowerCase().includes('none');

    networks.push({
      ssid,
      bssid: bssid || 'N/A',
      signal,
      authentication: auth,
      encryption: enc,
      radio,
      band,
      channel,
      isSaved: Boolean(saved),
      savedPassword: saved ? saved.password : (isOpen ? '(Open / No Password)' : null),
      isOpen
    });
  }

  return networks;
}

// MIME types dictionary for static file serving
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers for local API flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/wifi/current') {
    const data = await getCurrentInterface();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify(data));
    return;
  }

  if (pathname === '/api/wifi/profiles') {
    const profiles = await getAllProfiles();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ count: profiles.length, profiles }));
    return;
  }

  if (pathname === '/api/wifi/scan') {
    const scanResults = await getNearbyNetworks();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ count: scanResults.length, networks: scanResults }));
    return;
  }

  if (pathname === '/api/wifi/full-audit') {
    const [current, profiles, nearby] = await Promise.all([
      getCurrentInterface(),
      getAllProfiles(),
      getNearbyNetworks()
    ]);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ current, profiles, nearby, timestamp: new Date().toISOString() }));
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  console.log(`=======================================================`);
  console.log(`  ⚡ CYBER//WIFI-SENTINEL v2.0 READY ⚡`);
  console.log(`  Access HUD at: ${localUrl}`);
  console.log(`  Press Ctrl+C to stop server`);
  console.log(`=======================================================`);

  // Auto open browser on Windows if not running with --no-open
  if (!process.argv.includes('--no-open')) {
    exec(`start ${localUrl}`);
  }
});
