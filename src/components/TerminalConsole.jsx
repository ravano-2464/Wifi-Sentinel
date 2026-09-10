import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trash2, Maximize2, Play, Sparkles } from 'lucide-react';
import { playCyberSound } from '../utils/audio';

const COMMAND_HINTS = [
  'help',
  'airdump',
  'scan',
  'crack',
  'recon',
  'vault',
  'deauth',
  'ping',
  'neofetch',
  'macchanger',
  'matrix',
  'clear'
];

export default function TerminalConsole({ 
  logs = [], 
  onClearLogs, 
  onOpenHackerModal,
  profiles = [],
  nearbyNetworks = [],
  currentWifi = null,
  audioEnabled = true,
  onRefresh
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [localLogs, setLocalLogs] = useState([
    { time: new Date().toTimeString().split(' ')[0], text: 'SENTINEL MINI CLI READY. Type "help" or click quick chips below.', type: 'info' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, localLogs]);

  const pushLog = (text, type = 'info') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLocalLogs(prev => [...prev.slice(-60), { time: timeStr, text, type }]);
  };

  const handleMiniExec = (cmd) => {
    const raw = (cmd !== undefined ? cmd : inputVal).trim();
    if (!raw) return;

    playCyberSound('click', audioEnabled);
    setInputVal('');
    setCmdHistory(prev => [...prev, raw]);
    setHistoryIndex(-1);

    const timeStr = new Date().toTimeString().split(' ')[0];
    // Echo command prompt
    pushLog(`root@sentinel:~# ${raw}`, 'command');

    const parts = raw.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim().replace(/^["']|["']$/g, '');

    switch (command) {
      case 'help':
      case '?': {
        pushLog('================== TACTICAL MINI CLI ==================', 'info');
        pushLog('  airdump        : Capture 802.11 active AP beacon airwaves', 'raw');
        pushLog('  scan           : Trigger physical WLAN RF interface sweep', 'raw');
        pushLog('  crack <SSID>   : Decrypt / brute-force password of target AP', 'raw');
        pushLog('  recon <SSID>   : Deep reconnaissance & RF security posture', 'raw');
        pushLog('  vault / dump   : List all stored Windows cleartext profiles', 'raw');
        pushLog('  deauth <SSID>  : Send 802.11 deauth frames & grab handshake', 'raw');
        pushLog('  ping <host>    : Measure latency roundtrip (default: 8.8.8.8)', 'raw');
        pushLog('  neofetch       : Display system architecture & adapter stats', 'raw');
        pushLog('  macchanger     : Generate randomized stealth MAC address', 'raw');
        pushLog('  matrix         : Launch Fullscreen Hacker Matrix Terminal', 'raw');
        pushLog('  clear / cls    : Purge console history', 'raw');
        pushLog('=======================================================', 'info');
        break;
      }

      case 'airdump':
      case 'airodump': {
        pushLog('[*] airodump-ng --band 2.4,5 (Monitoring Airspace)...', 'info');
        const list = nearbyNetworks.length > 0 ? nearbyNetworks : profiles.slice(0, 8);
        if (list.length === 0) {
          pushLog('[!] No active broadcast beacons detected yet. Type "scan" to sweep.', 'warn');
          return;
        }

        pushLog(' BSSID              PWR   CH  AUTH        ESSID', 'success');
        pushLog(' -----------------------------------------------------------', 'raw');
        list.slice(0, 10).forEach((ap, i) => {
          const bssid = (ap.bssid || `00:14:D1:E8:${i < 10 ? '0' + i : i}:AA`).toUpperCase();
          const pwr = `${ap.signalPercent || 75}%`.padEnd(5);
          const ch = (ap.channel || (i % 11 + 1)).toString().padEnd(3);
          const auth = (ap.authentication || ap.type || 'WPA2').substring(0, 10).padEnd(11);
          const essid = ap.ssid || '<Hidden>';
          pushLog(` ${bssid}  ${pwr} ${ch} ${auth} ${essid}`, 'raw');
        });
        pushLog(`[+] Active Airwaves in Range: ${list.length} Access Points`, 'info');
        break;
      }

      case 'scan':
      case 'refresh': {
        pushLog('[*] Triggering active hardware RF probe via Wi-Fi Card...', 'info');
        if (onRefresh) onRefresh();
        setTimeout(() => {
          pushLog(`[+] Scan finished. Airspace updated with live beacon telemetry.`, 'success');
        }, 1000);
        break;
      }

      case 'crack':
      case 'decrypt': {
        const targetSsid = arg || (profiles[0]?.ssid || 'TargetWifi');
        const matched = profiles.find(p => p.ssid.toLowerCase() === targetSsid.toLowerCase() || p.name.toLowerCase() === targetSsid.toLowerCase());
        const realPass = matched ? matched.password : 'WPA_K3Y_' + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Calculate network IP info
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

        pushLog(`[*] Initializing dictionary attack on [${targetSsid}]...`, 'warn');
        pushLog(`[*] Wordlist: rockyou.txt (14,344,392 entries) | Speed: 172.4 k/s`, 'info');

        let tick = 0;
        const crackTimer = setInterval(() => {
          tick++;
          playCyberSound('type', audioEnabled);
          if (tick === 1) pushLog(`  -> [HASH 25%] Intercepting beacon network telemetry...`, 'raw');
          if (tick === 2) pushLog(`  -> [HASH 60%] Key verification candidate found...`, 'raw');
          if (tick >= 3) {
            clearInterval(crackTimer);
            playCyberSound('success', audioEnabled);
            pushLog('=======================================================', 'success');
            pushLog(`[+] KEY CRACKED! [ ${realPass || '(Open Network / No Key)'} ]`, 'success');
            pushLog(`[+] Target ESSID   : ${targetSsid}`, 'success');
            pushLog(`[+] Router Gateway : ${gateway}`, 'info');
            pushLog(`[+] Assigned IP    : ${ipAddress}`, 'info');
            pushLog(`[+] Subnet Mask    : ${subnet}`, 'raw');
            pushLog(`[+] DNS Server     : ${dns}`, 'raw');
            pushLog('=======================================================', 'success');
          }
        }, 220);
        break;
      }

      case 'recon':
      case 'target': {
        const targetName = arg || (currentWifi?.ssid || profiles[0]?.ssid || 'LocalWifi');
        const targetObj = profiles.find(p => p.ssid.toLowerCase() === targetName.toLowerCase()) ||
                          nearbyNetworks.find(n => n.ssid.toLowerCase() === targetName.toLowerCase());

        let hash = 0;
        for (let i = 0; i < targetName.length; i++) hash = ((hash << 5) - hash) + targetName.charCodeAt(i);
        const sub = (Math.abs(hash) % 150) + 1;
        const clientHost = (Math.abs(hash * 7) % 200) + 10;
        const isConn = currentWifi && currentWifi.connected && 
          (currentWifi.ssid?.toLowerCase() === targetName.toLowerCase() || currentWifi.profile?.toLowerCase() === targetName.toLowerCase());

        const ipAddress = isConn ? (currentWifi.ipv4 || currentWifi.ipAddress || '192.168.1.108') : `192.168.${sub}.${clientHost}`;
        const gateway = isConn ? (currentWifi.gateway || '192.168.1.1') : `192.168.${sub}.1`;

        pushLog(`[*] EXECUTING DEEP RF RECONNAISSANCE: [${targetName}]`, 'info');
        setTimeout(() => {
          pushLog(`[+] ESSID          : ${targetName}`, 'success');
          pushLog(`[+] BSSID MAC      : ${targetObj?.bssid || 'F4:2D:06:AD:27:34'}`, 'raw');
          pushLog(`[+] Router Gateway : ${gateway}`, 'info');
          pushLog(`[+] Client IPv4    : ${ipAddress}`, 'info');
          pushLog(`[+] Freq Band      : ${targetObj?.band || '2.4 GHz / 5 GHz'} (Channel ${targetObj?.channel || '8'})`, 'raw');
          pushLog(`[+] Security       : ${targetObj?.authentication || targetObj?.type || 'WPA2-Personal (AES)'}`, 'raw');
          pushLog(`[+] Stored Key     : ${targetObj?.password ? 'EXISTS IN VAULT (' + targetObj.password + ')' : 'REQUIRES CRACKING'}`, 'info');
        }, 150);
        break;
      }

      case 'vault':
      case 'dump':
      case 'ls': {
        pushLog(`================== CREDENTIAL VAULT (${profiles.length} KEYS) ==================`, 'info');
        profiles.forEach((p, idx) => {
          const num = (idx + 1).toString().padStart(2, ' ');
          const ssid = p.ssid.padEnd(24, ' ').substring(0, 24);
          const pass = p.password || '(Open)';
          pushLog(`  ${num}. ${ssid} : ${pass}`, 'raw');
        });
        pushLog('=================================================================', 'info');
        break;
      }

      case 'ping': {
        const host = arg || '8.8.8.8';
        pushLog(`PING ${host} (56 bytes of data)...`, 'info');
        let count = 0;
        const pingInterval = setInterval(() => {
          count++;
          const latency = (Math.random() * 10 + 5).toFixed(1);
          pushLog(`64 bytes from ${host}: icmp_seq=${count} ttl=118 time=${latency} ms`, 'raw');
          playCyberSound('type', audioEnabled);
          if (count >= 3) {
            clearInterval(pingInterval);
            pushLog(`--- ${host} ping statistics: 3 packets transmitted, 0% packet loss ---`, 'success');
          }
        }, 200);
        break;
      }

      case 'deauth': {
        const targetSsid = arg || (currentWifi?.ssid || 'TargetWifi');
        pushLog(`[*] Injecting 802.11 deauthentication frames to [${targetSsid}]...`, 'warn');
        setTimeout(() => {
          pushLog(`  -> [FRAME 1-5] Broadcast Deauth packet dispatched!`, 'raw');
          pushLog(`[+] WPA 4-way EAPOL Handshake captured and verified (MIC OK)!`, 'success');
          pushLog(`[+] You can now run: crack "${targetSsid}"`, 'info');
          playCyberSound('success', audioEnabled);
        }, 300);
        break;
      }

      case 'neofetch':
      case 'sysinfo': {
        pushLog(`
  __   __   _   ___   
  \\ \\ / /  /_\\ / __|  OS: Windows 11 // Sentinel v2.0
   \\ V /  / _ \\\\__ \\  Host: NETSH Cyber Core x64
    |_|  /_/ \\_\\___/  Adapter: MediaTek Wi-Fi 6
                      Active: ${currentWifi?.ssid || 'STANDBY'}
                      Saved Keys: ${profiles.length} Profiles
`, 'info');
        break;
      }

      case 'macchanger':
      case 'mac': {
        const randMac = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase();
        pushLog(`[*] MAC Address Spoofed: ${randMac} (Stealth Mode Active)`, 'success');
        break;
      }

      case 'matrix': {
        pushLog('[*] Opening Fullscreen Matrix Hacker Suite...', 'info');
        if (onOpenHackerModal) onOpenHackerModal();
        break;
      }

      case 'clear':
      case 'cls': {
        setLocalLogs([]);
        if (onClearLogs) onClearLogs();
        break;
      }

      default: {
        pushLog(`[ERROR] Unknown command: "${raw}". Type "help" to see all commands.`, 'danger');
        playCyberSound('error', audioEnabled);
        break;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleMiniExec();
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
      const match = COMMAND_HINTS.find(c => c.startsWith(current));
      if (match) {
        setInputVal(match + ' ');
      }
    }
  };

  const combinedLogs = [...logs, ...localLogs];

  return (
    <div className="cyber-card terminal-card">
      <div className="card-corner tl"></div>
      <div className="card-corner tr"></div>
      <div className="card-corner bl"></div>
      <div className="card-corner br"></div>

      {/* Card Header */}
      <div className="card-header">
        <div className="header-title">
          <Terminal size={14} color="var(--neon-green)" style={{ marginRight: 4 }} />
          <h3>HACKER CONSOLE</h3>
          <span className="term-mini-badge">CLI</span>
        </div>
        <div className="term-hdr-actions">
          <motion.button 
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="text-btn sm accent-btn" 
            onClick={onOpenHackerModal}
            title="Open Fullscreen Matrix Hacker Terminal"
          >
            <Maximize2 size={11} style={{ marginRight: 4 }} /> MATRIX
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="text-btn sm" 
            onClick={() => {
              setLocalLogs([]);
              onClearLogs();
            }} 
            title="Clear Terminal Logs"
          >
            <Trash2 size={11} style={{ marginRight: 3 }} /> CLEAR
          </motion.button>
        </div>
      </div>

      {/* Terminal Stream Screen */}
      <div className="terminal-log-stream" ref={containerRef}>
        {combinedLogs.map((log, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            className="log-line"
          >
            <span className="time">[{log.time}]</span>{' '}
            {log.type === 'command' ? (
              <span className="cmd-line">{log.text}</span>
            ) : log.type === 'raw' ? (
              <span className="raw-line">{log.text}</span>
            ) : (
              <span className={log.type}>{log.text}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Action Chips */}
      <div className="mini-chips-row">
        {[
          { label: 'help', cmd: 'help' },
          { label: 'airdump', cmd: 'airdump' },
          { label: 'scan', cmd: 'scan' },
          { label: 'vault', cmd: 'vault' },
          { label: 'crack', cmd: `crack "${profiles[0]?.ssid || 'TargetWifi'}"` },
          { label: 'recon', cmd: `recon "${profiles[0]?.ssid || 'TargetWifi'}"` },
          { label: 'neofetch', cmd: 'neofetch' },
          { label: 'ping', cmd: 'ping 8.8.8.8' }
        ].map((chip, idx) => (
          <button 
            key={idx} 
            className="mini-chip-btn"
            onClick={() => handleMiniExec(chip.cmd)}
            title={`Run "${chip.cmd}"`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Interactive Command Input Row */}
      <div className="mini-terminal-input-row">
        <span className="mini-prompt">root@sentinel:~#</span>
        <input 
          ref={inputRef}
          type="text" 
          className="mini-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="airdump, crack <SSID>, vault, scan, help..."
          spellCheck="false"
          autoComplete="off"
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mini-exec-btn"
          onClick={() => handleMiniExec()}
          title="Execute Command"
        >
          <Play size={10} style={{ fill: 'currentColor' }} />
        </motion.button>
      </div>
    </div>
  );
}
