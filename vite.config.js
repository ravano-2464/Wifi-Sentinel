import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import url from 'url';

// Helper to run shell commands with UTF-8 on Windows
function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(`chcp 65001 >nul && ${cmd}`, { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' }, (err, stdout) => {
      if (err) {
        resolve('');
        return;
      }
      resolve(stdout || '');
    });
  });
}

// Netsh data extractors
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

async function getAllProfiles() {
  const raw = await runCmd('netsh wlan show profiles');
  const profileMatches = [...raw.matchAll(/All User Profile\s*:\s*(.+)/gi)];
  const profileNames = profileMatches.map(m => m[1].trim()).filter(Boolean);

  const profilePromises = profileNames.map(async (name) => {
    const detailRaw = await runCmd(`netsh wlan show profile name="${name.replace(/"/g, '\\"')}" key=clear`);
    
    const getVal = (pattern) => {
      const match = detailRaw.match(pattern);
      return match ? match[1].trim() : '';
    };

    const authMatches = [...detailRaw.matchAll(/Authentication\s*:\s*(.+)/gi)].map(m => m[1].trim());
    const cipherMatches = [...detailRaw.matchAll(/Cipher\s*:\s*(.+)/gi)].map(m => m[1].trim());
    
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

  return await Promise.all(profilePromises);
}

async function getNearbyNetworks() {
  const raw = await runCmd('netsh wlan show networks mode=bssid');
  const networks = [];
  if (!raw) return networks;

  const sections = raw.split(/SSID\s+\d+\s+:\s+/i);
  sections.shift(); // remove header

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

    // Cross reference with saved passwords
    const saved = profileMap.get(ssid.toLowerCase());

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
      savedPassword: saved ? saved.password : null,
      isOpen: auth.toLowerCase().includes('open') || enc.toLowerCase().includes('none')
    });
  }

  return networks;
}

// Vite plugin providing native netsh API endpoints
function wifiApiPlugin() {
  return {
    name: 'wifi-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        if (pathname === '/api/wifi/current') {
          const data = await getCurrentInterface();
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.end(JSON.stringify(data));
          return;
        }

        if (pathname === '/api/wifi/profiles') {
          const profiles = await getAllProfiles();
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.end(JSON.stringify({ count: profiles.length, profiles }));
          return;
        }

        if (pathname === '/api/wifi/scan') {
          const networks = await getNearbyNetworks();
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.end(JSON.stringify({ count: networks.length, networks }));
          return;
        }

        if (pathname === '/api/wifi/full-audit') {
          const [current, profiles, nearby] = await Promise.all([
            getCurrentInterface(),
            getAllProfiles(),
            getNearbyNetworks()
          ]);
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.end(JSON.stringify({ current, profiles, nearby, timestamp: new Date().toISOString() }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), wifiApiPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
