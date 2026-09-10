import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Play, RefreshCw, Cpu, ShieldAlert, Wifi, Zap, Maximize2, Minimize2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { playCyberSound } from '../utils/audio';

const ASCII_BANNER = `
██╗    ██╗██╗███████╗██╗   ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗     
██║    ██║██║██╔════╝██║   ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║     
██║ █╗ ██║██║█████╗  ██║   ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║     
██║███╗██║██║██╔══╝  ██║   ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║     
╚███╔███╔╝██║██║     ██║   ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
 ╚══╝╚══╝ ╚═╝╚═╝     ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
[ TACTICAL WI-FI EXPLOITATION & TELEMETRY CONSOLE v2.5 ]
Type 'help' to list tactical commands.
`;

const COMMAND_LIST = [
  { cmd: 'help', desc: 'Display all available hacker CLI commands and syntax' },
  { cmd: 'airdump', desc: 'Capture active 802.11 beacon frames across all radio channels' },
  { cmd: 'scan', desc: 'Trigger active WLAN interface sweep for physical nearby APs' },
  { cmd: 'crack <SSID>', desc: 'Launch dictionary & hash brute-force decryption against target network' },
  { cmd: 'recon <SSID>', desc: 'Perform deep reconnaissance & vulnerability audit on target AP' },
  { cmd: 'deauth <SSID>', desc: 'Simulate 802.11 management deauth burst & capture WPA 4-way handshake' },
  { cmd: 'vault', desc: 'Dump all Windows cleartext credential profiles from internal vault' },
  { cmd: 'ping <host>', desc: 'Measure roundtrip latency to target host or local gateway' },
  { cmd: 'neofetch', desc: 'Display cyberpunk tactical system architecture & telemetry' },
  { cmd: 'macchanger', desc: 'Generate spoofed tactical MAC address for wireless card' },
  { cmd: 'matrix', desc: 'Toggle background digital rain matrix code animation' },
  { cmd: 'theme <green|cyan|purple|amber>', desc: 'Switch terminal HUD color palette' },
  { cmd: 'clear', desc: 'Purge all command history from active terminal session' },
  { cmd: 'exit', desc: 'Close interactive hacker terminal' }
];

export default function HackerTerminalModal({
  isOpen,
  onClose,
  profiles = [],
  nearbyNetworks = [],
  currentWifi = null,
  audioEnabled = true,
  onRefresh,
  onShowToast
}) {
  const [history, setHistory] = useState([
    { type: 'banner', text: ASCII_BANNER },
    { type: 'success', text: '[SYSTEM] SENTINEL TACTICAL KERNEL LOADED // AIRCRACK-NETSH SUITE ONLINE.' },
    { type: 'info', text: '[HINT] Click quick commands below or type in prompt. Try typing "airdump" or "crack <SSID>".' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [matrixRain, setMatrixRain] = useState(true);
  const [theme, setTheme] = useState('green'); // green | cyan | purple | amber
  const [isCracking, setIsCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);
  const [crackingTarget, setCrackingTarget] = useState(null);
  const [crackSpeed, setCrackSpeed] = useState('0 k/s');
  const [currentTestedPass, setCurrentTestedPass] = useState('...');

  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto scroll to bottom of terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history, isCracking, crackProgress]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Digital Matrix Rain Canvas Animation
  useEffect(() => {
    if (!isOpen || !matrixRain || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const chars = '0123456789ABCDEF$#@%&*+-/<>~ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const fontSize = 13;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 6, 10, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let colorHex = '#00ff9d';
      if (theme === 'cyan') colorHex = '#00f0ff';
      if (theme === 'purple') colorHex = '#d946ef';
      if (theme === 'amber') colorHex = '#ffb700';

      ctx.fillStyle = colorHex;
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isOpen, matrixRain, theme]);

  const addLog = useCallback((type, text) => {
    setHistory(prev => [...prev, { type, text }]);
  }, []);

  // Simulate cracking attack
  const runCrackSimulation = (targetSsid) => {
    if (isCracking) {
      addLog('warn', '[ABORT] Another decryption task is currently executing.');
      return;
    }

    const matchedProfile = profiles.find(p => p.ssid.toLowerCase() === targetSsid.toLowerCase() || p.name.toLowerCase() === targetSsid.toLowerCase());
    const realPassword = matchedProfile ? matchedProfile.password : 'WPA_K3Y_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const isKnown = Boolean(matchedProfile);

    setIsCracking(true);
    setCrackingTarget(targetSsid);
    setCrackProgress(0);

    addLog('warn', `[*] INITIALIZING AIRCRACK-NG DICTIONARY ATTACK AGAINST: [${targetSsid}]`);
    addLog('info', `[*] Loading Wordlist: /usr/share/wordlists/rockyou.txt (14,344,392 entries)`);
    addLog('info', `[*] Target Authentication: ${matchedProfile?.authentication || 'WPA2-PSK (CCMP/AES)'}`);
    addLog('info', `[*] 4-Way EAPOL Handshake: CAPTURED & VERIFIED (MIC VALID)`);

    const fakeWords = [
      'admin123', 'password', 'qwerty2024', 'ilovewifi', '1234567890',
      'secretkey!', 'dragon88', 'network_pass', 'cyberpunk2077', 'supersecure',
      'shadowroot', 'access_granted', 'hackerpass', realPassword
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(100, Math.round((step / 16) * 100));
      setCrackProgress(progress);
      setCrackSpeed(`${(Math.random() * 80 + 120).toFixed(1)} k/s`);
      setCurrentTestedPass(fakeWords[step % fakeWords.length]);
      playCyberSound('type', audioEnabled);

      if (step >= 16) {
        clearInterval(interval);
        setIsCracking(false);
        setCrackProgress(100);
        playCyberSound('success', audioEnabled);

        let hash = 0;
        for (let i = 0; i < targetSsid.length; i++) hash = ((hash << 5) - hash) + targetSsid.charCodeAt(i);
        const sub = (Math.abs(hash) % 150) + 1;
        const clientHost = (Math.abs(hash * 7) % 200) + 10;
        const isConn = currentWifi && currentWifi.connected && 
          (currentWifi.ssid?.toLowerCase() === targetSsid.toLowerCase() || currentWifi.profile?.toLowerCase() === targetSsid.toLowerCase());

        const ipAddress = isConn ? (currentWifi.ipv4 || currentWifi.ipAddress || '192.168.1.108') : `192.168.${sub}.${clientHost}`;
        const gateway = isConn ? (currentWifi.gateway || '192.168.1.1') : `192.168.${sub}.1`;
        const subnet = '255.255.255.0 (/24)';
        const dns = isConn ? '8.8.8.8, 1.1.1.1' : `192.168.${sub}.1, 8.8.8.8`;

        addLog('success', '=======================================================');
        addLog('success', `[+] KEY FOUND! [ ${realPassword || '(Open Network / No Key)'} ]`);
        addLog('success', `[+] Target ESSID       : ${targetSsid}`);
        addLog('success', `[+] Master PMK Hash    : ${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`);
        addLog('info',    `[+] Router Gateway     : ${gateway}`);
        addLog('info',    `[+] Assigned Client IP : ${ipAddress}`);
        addLog('raw',     `[+] Subnet Mask        : ${subnet}`);
        addLog('raw',     `[+] DNS Server         : ${dns}`);
        addLog('success', `[+] Key Status         : ${isKnown ? 'EXTRACTED FROM LOCAL HARDWARE VAULT' : 'SIMULATED HASH RECOVERED'}`);
        addLog('success', '=======================================================');
        if (onShowToast) onShowToast(`Cracked key for ${targetSsid}: ${realPassword}`);
      }
    }, 180);
  };

  // Command Execution Handler
  const executeCommand = (cmdText) => {
    const raw = cmdText.trim();
    if (!raw) return;

    setCmdHistory(prev => [...prev, raw]);
    setHistoryIndex(-1);
    setInputVal('');

    addLog('command', `root@wifi-sentinel:~# ${raw}`);
    playCyberSound('click', audioEnabled);

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim().replace(/^["']|["']$/g, '');

    switch (cmd) {
      case 'help':
      case '?': {
        addLog('info', '================== SENTINEL TACTICAL COMMANDS ==================');
        COMMAND_LIST.forEach(c => {
          addLog('raw', `  ${c.cmd.padEnd(20, ' ')} : ${c.desc}`);
        });
        addLog('info', '================================================================');
        break;
      }

      case 'airdump':
      case 'airodump': {
        addLog('info', '[*] airodump-ng --band 2.4,5 --update 1 --wlan-interface Netsh');
        addLog('info', '[*] Hopping channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 36, 40, 44, 48, 149, 157, 161]');
        
        const allAps = nearbyNetworks.length > 0 ? nearbyNetworks : profiles.map(p => ({
          ssid: p.ssid,
          bssid: p.bssid || 'F4:2D:06:AD:' + Math.floor(Math.random()*89+10) + ':AA',
          signalPercent: p.signal || 78,
          channel: '6',
          authentication: p.type || 'WPA2'
        }));

        setTimeout(() => {
          addLog('success', ' BSSID              PWR   BEACONS   DATA  CH   MB     ENC    CIPHER  AUTH   ESSID');
          addLog('raw', ' -------------------------------------------------------------------------------------');
          allAps.forEach((ap, i) => {
            const bssid = (ap.bssid || `00:14:D1:E8:${i < 10 ? '0' + i : i}:FF`).toUpperCase();
            const pwr = `${ap.signalPercent || 75}%`;
            const ch = (ap.channel || (i % 11 + 1)).toString().padEnd(3);
            const enc = (ap.authentication || 'WPA2').substring(0, 6).padEnd(6);
            const essid = ap.ssid || '<Hidden SSID>';
            addLog('raw', ` ${bssid.padEnd(19)} ${pwr.padEnd(6)} ${(Math.random()*400+50).toFixed(0).padEnd(9)} ${(Math.random()*90+10).toFixed(0).padEnd(5)} ${ch} 300    ${enc} CCMP    PSK    ${essid}`);
          });
          addLog('info', `[*] Total Access Points Monitored: ${allAps.length}`);
        }, 300);
        break;
      }

      case 'scan': {
        addLog('info', '[*] Triggering active hardware RF beacon scan via MediaTek Wi-Fi adapter...');
        if (onRefresh) onRefresh();
        setTimeout(() => {
          addLog('success', `[+] Scan complete. Captured ${nearbyNetworks.length} physical beacon broadcasts in airspace.`);
        }, 1200);
        break;
      }

      case 'crack':
      case 'decrypt': {
        if (!arg) {
          addLog('danger', '[ERROR] Syntax: crack <SSID>');
          addLog('info', '  Example: crack "MyHomeWifi"');
          return;
        }
        runCrackSimulation(arg);
        break;
      }

      case 'recon':
      case 'target': {
        if (!arg) {
          addLog('danger', '[ERROR] Syntax: recon <SSID>');
          return;
        }
        const target = profiles.find(p => p.ssid.toLowerCase() === arg.toLowerCase()) || 
                       nearbyNetworks.find(n => n.ssid.toLowerCase() === arg.toLowerCase());

        let hash = 0;
        for (let i = 0; i < arg.length; i++) hash = ((hash << 5) - hash) + arg.charCodeAt(i);
        const sub = (Math.abs(hash) % 150) + 1;
        const clientHost = (Math.abs(hash * 7) % 200) + 10;
        const isConn = currentWifi && currentWifi.connected && 
          (currentWifi.ssid?.toLowerCase() === arg.toLowerCase() || currentWifi.profile?.toLowerCase() === arg.toLowerCase());

        const ipAddress = isConn ? (currentWifi.ipv4 || currentWifi.ipAddress || '192.168.1.108') : `192.168.${sub}.${clientHost}`;
        const gateway = isConn ? (currentWifi.gateway || '192.168.1.1') : `192.168.${sub}.1`;

        addLog('info', `[*] EXECUTING DEEP RF RECONNAISSANCE: [${arg}]`);
        setTimeout(() => {
          addLog('success', `[+] Target ESSID       : ${arg}`);
          addLog('success', `[+] BSSID MAC Address  : ${target?.bssid || 'F4:2D:06:AD:27:34'}`);
          addLog('info',    `[+] Router Gateway     : ${gateway}`);
          addLog('info',    `[+] Client IPv4        : ${ipAddress}`);
          addLog('success', `[+] Radio Frequencies  : ${target?.band || '2.4 GHz / 5 GHz Dual-Band'}`);
          addLog('success', `[+] Channel Allocation : Channel ${target?.channel || '8'} (2447 MHz)`);
          addLog('success', `[+] Security Protocol  : ${target?.authentication || target?.type || 'WPA2-Personal (AES-CCMP)'}`);
          addLog('success', `[+] WPS Vulnerability  : LOCKED / PIN BRUTE-FORCE MITIGATED`);
          addLog('success', `[+] Known Cleartext Key: ${target?.password ? 'AVAILABLE IN VAULT (' + target.password + ')' : 'REQUIRES 4-WAY HANDSHAKE CRACK'}`);
        }, 200);
        break;
      }

      case 'deauth': {
        if (!arg) {
          addLog('danger', '[ERROR] Syntax: deauth <SSID>');
          return;
        }
        addLog('warn', `[*] INJECTING 802.11 DEAUTH FRAMES [aireplay-ng -0 5 -a ${arg}]`);
        let count = 0;
        const deauthTimer = setInterval(() => {
          count++;
          addLog('raw', `  -> [FRAME ${count}/5] Sending Deauth packet to Broadcast FF:FF:FF:FF:FF:FF on [${arg}]`);
          playCyberSound('type', audioEnabled);
          if (count >= 5) {
            clearInterval(deauthTimer);
            addLog('success', `[+] HANDSHAKE CAPTURED: WPA 4-Way EAPOL Handshake for [${arg}] successfully written to /tmp/handshake.cap!`);
            addLog('info', `[+] You can now run: crack "${arg}"`);
            playCyberSound('success', audioEnabled);
          }
        }, 150);
        break;
      }

      case 'vault':
      case 'dump': {
        addLog('info', `=================== SENTINEL VAULT CREDENTIAL DUMP (${profiles.length} PROFILES) ===================`);
        addLog('raw', '  #   SSID                             AUTH               PASSWORD');
        addLog('raw', ' ----------------------------------------------------------------------------------');
        profiles.forEach((p, idx) => {
          const num = (idx + 1).toString().padStart(2, ' ');
          const ssid = p.ssid.padEnd(32, ' ').substring(0, 32);
          const auth = (p.type || p.authentication || 'WPA2').padEnd(18, ' ').substring(0, 18);
          const pass = p.password || '(Open / None)';
          addLog('raw', `  ${num}  ${ssid} ${auth} ${pass}`);
        });
        addLog('info', '==================================================================================');
        break;
      }

      case 'ping': {
        const host = arg || '192.168.1.1';
        addLog('info', `PING ${host} (56 data bytes)...`);
        let pings = 0;
        const pingTimer = setInterval(() => {
          pings++;
          const latency = (Math.random() * 12 + 4).toFixed(1);
          const ttl = 64;
          addLog('raw', `64 bytes from ${host}: icmp_seq=${pings} ttl=${ttl} time=${latency} ms`);
          playCyberSound('type', audioEnabled);
          if (pings >= 4) {
            clearInterval(pingTimer);
            addLog('success', `--- ${host} ping statistics ---`);
            addLog('success', `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`);
          }
        }, 250);
        break;
      }

      case 'neofetch':
      case 'sysinfo': {
        addLog('info', `
   __   __   _   ___   
   \\ \\ / /  /_\\ / __|  ---------------------------
    \\ V /  / _ \\\\__ \\  OS: Windows 11 Sentinel v2.0
     |_|  /_/ \\_\\___/  Host: NETSH Cyber Core x64
                       Kernel: 10.0.22631-Sent
                       Adapter: MediaTek Wi-Fi 6 MT7921
                       Airspace Status: MONITORING (802.11ax)
                       Active Uplink: ${currentWifi?.ssid || 'STANDBY'} (${currentWifi?.band || '2.4 GHz'})
                       Saved Vault Keys: ${profiles.length} Profiles
                       Animation Engines: GSAP 3 + Framer Motion
                       Shell: Sentinel Tactical CLI v2.5
`);
        break;
      }

      case 'macchanger':
      case 'mac': {
        const newMac = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase();
        addLog('info', `[*] Current MAC: ${currentWifi?.bssid || 'F4:2D:06:AD:27:34'}`);
        addLog('success', `[+] Spoofed MAC: ${newMac} (Vendor: Randomized Tactical Stealth OUI)`);
        break;
      }

      case 'matrix': {
        setMatrixRain(prev => {
          const next = !prev;
          addLog('info', `[*] Digital Matrix Rain Effect: ${next ? 'ENABLED' : 'DISABLED'}`);
          return next;
        });
        break;
      }

      case 'theme': {
        if (['green', 'cyan', 'purple', 'amber'].includes(arg.toLowerCase())) {
          setTheme(arg.toLowerCase());
          addLog('success', `[+] Terminal HUD theme switched to [${arg.toUpperCase()}].`);
        } else {
          addLog('danger', '[ERROR] Unknown theme. Available themes: green, cyan, purple, amber');
        }
        break;
      }

      case 'clear':
      case 'cls': {
        setHistory([]);
        break;
      }

      case 'exit':
      case 'quit': {
        onClose();
        break;
      }

      default: {
        addLog('danger', `[ERROR] Command not recognized: "${raw}". Type 'help' for tactical manual.`);
        playCyberSound('error', audioEnabled);
        break;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIndex + 1 < cmdHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim();
      const match = COMMAND_LIST.find(c => c.cmd.startsWith(current));
      if (match) {
        setInputVal(match.cmd.split(' ')[0] + ' ');
      }
    }
  };

  if (!isOpen) return null;

  const getThemeClass = () => {
    if (theme === 'cyan') return 'theme-cyan';
    if (theme === 'purple') return 'theme-purple';
    if (theme === 'amber') return 'theme-amber';
    return 'theme-green';
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="hacker-terminal-overlay" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={`hacker-terminal-window ${getThemeClass()}`}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.94, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          {/* Matrix Rain Canvas Background */}
          {matrixRain && (
            <canvas ref={canvasRef} className="matrix-rain-canvas" />
          )}

          {/* Window Header */}
          <div className="terminal-topbar">
            <div className="terminal-title-group">
              <span className="term-indicator pulse"></span>
              <Terminal size={15} style={{ marginRight: 6 }} />
              <span className="term-title">SENTINEL TACTICAL HACKER CLI // AIRCRACK-NETSH SUITE</span>
              <span className="term-badge">[ROOT ACCESS ACTIVE]</span>
            </div>

            <div className="terminal-controls">
              <button 
                className={`ctrl-chip ${matrixRain ? 'active' : ''}`}
                onClick={() => setMatrixRain(!matrixRain)}
                title="Toggle Matrix Rain"
              >
                <Sparkles size={12} /> MATRIX FX
              </button>
              <button 
                className="ctrl-close-btn"
                onClick={onClose}
                title="Exit Terminal"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Cracking Status Banner */}
          {isCracking && (
            <div className="cracking-live-banner">
              <div className="cracking-header-row">
                <span className="cracking-pulse">● BRUTE-FORCE RUNNING:</span>
                <span className="target-name">[{crackingTarget}]</span>
                <span className="speed-rate">SPEED: {crackSpeed}</span>
                <span className="word-sample">TESTING: {currentTestedPass}</span>
              </div>
              <div className="cracking-progress-bar">
                <div 
                  className="cracking-progress-fill" 
                  style={{ width: `${crackProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Terminal Body Screen */}
          <div className="terminal-screen" ref={terminalBodyRef}>
            {history.map((item, idx) => (
              <div key={idx} className={`term-line line-${item.type}`}>
                {item.type === 'banner' ? (
                  <pre className="ascii-banner">{item.text}</pre>
                ) : item.type === 'command' ? (
                  <span className="cmd-prompt">{item.text}</span>
                ) : (
                  <span className="output-text">{item.text}</span>
                )}
              </div>
            ))}
          </div>

          {/* Quick Action Chips */}
          <div className="terminal-quick-chips">
            <span className="chip-label">QUICK CMDS:</span>
            {[
              { label: 'help', cmd: 'help' },
              { label: 'airdump', cmd: 'airdump' },
              { label: 'scan', cmd: 'scan' },
              { label: `crack "${profiles[0]?.ssid || 'TargetWifi'}"`, cmd: `crack "${profiles[0]?.ssid || 'TargetWifi'}"` },
              { label: 'recon', cmd: `recon "${profiles[0]?.ssid || 'TargetWifi'}"` },
              { label: 'deauth', cmd: `deauth "${profiles[0]?.ssid || 'TargetWifi'}"` },
              { label: 'vault', cmd: 'vault' },
              { label: 'neofetch', cmd: 'neofetch' },
              { label: 'ping 8.8.8.8', cmd: 'ping 8.8.8.8' },
              { label: 'clear', cmd: 'clear' }
            ].map((chip, idx) => (
              <button 
                key={idx}
                className="quick-chip-btn"
                onClick={() => executeCommand(chip.cmd)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Terminal Interactive Input Prompt */}
          <div className="terminal-input-bar">
            <span className="prompt-prefix">root@wifi-sentinel:~#</span>
            <input 
              ref={inputRef}
              type="text" 
              className="term-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type tactical command (e.g. 'help', 'airdump', 'crack <SSID>', 'vault', 'matrix')..."
              autoFocus
              spellCheck="false"
              autoComplete="off"
            />
            <button 
              className="term-exec-btn"
              onClick={() => executeCommand(inputVal)}
            >
              <Play size={12} style={{ fill: 'currentColor' }} /> EXEC
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
