import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trash2, Maximize2, Play, Sparkles } from 'lucide-react';
import { playCyberSound } from '../utils/audio';

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
  const [localLogs, setLocalLogs] = useState([]);
  const [inputVal, setInputVal] = useState('');

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, localLogs]);

  const handleMiniExec = (cmd) => {
    const raw = (cmd || inputVal).trim();
    if (!raw) return;

    playCyberSound('click', audioEnabled);
    setInputVal('');

    const timeStr = new Date().toTimeString().split(' ')[0];
    const newLogs = [
      { time: timeStr, text: `root@sentinel:~# ${raw}`, type: 'command' }
    ];

    const lower = raw.toLowerCase();
    if (lower === 'help') {
      newLogs.push({ time: timeStr, text: 'AVAILABLE CMDS: airdump, scan, vault, matrix, crack <SSID>, neofetch, clear', type: 'info' });
    } else if (lower === 'scan' || lower === 'refresh') {
      newLogs.push({ time: timeStr, text: 'Triggering WLAN active interface airwave sweep...', type: 'info' });
      if (onRefresh) onRefresh();
    } else if (lower === 'vault' || lower === 'dump') {
      newLogs.push({ time: timeStr, text: `--- CREDENTIAL VAULT (${profiles.length} KEYS) ---`, type: 'success' });
      profiles.slice(0, 5).forEach(p => {
        newLogs.push({ time: timeStr, text: `> ${p.ssid} : ${p.password || '(Open)'}`, type: 'success' });
      });
      if (profiles.length > 5) {
        newLogs.push({ time: timeStr, text: `... and ${profiles.length - 5} more. Open Fullscreen CLI to see all.`, type: 'info' });
      }
    } else if (lower.startsWith('crack')) {
      newLogs.push({ time: timeStr, text: `[!] Launching deep cracking suite in Full Matrix CLI...`, type: 'warn' });
      if (onOpenHackerModal) onOpenHackerModal();
    } else if (lower === 'clear' || lower === 'cls') {
      setLocalLogs([]);
      if (onClearLogs) onClearLogs();
      return;
    } else {
      newLogs.push({ time: timeStr, text: `Command executed: "${raw}". Type "help" or click EXPAND for Full Matrix CLI.`, type: 'info' });
    }

    setLocalLogs(prev => [...prev, ...newLogs]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleMiniExec();
    }
  };

  const combinedLogs = [...logs, ...localLogs];

  return (
    <div className="cyber-card terminal-card">
      <div className="card-corner tl"></div>
      <div className="card-corner tr"></div>
      <div className="card-corner bl"></div>
      <div className="card-corner br"></div>

      <div className="card-header">
        <div className="header-title">
          <Terminal size={14} color="var(--neon-green)" style={{ marginRight: 4 }} />
          <h3>NETSH HACKER CONSOLE</h3>
          <span className="term-mini-badge">INTERACTIVE CLI</span>
        </div>
        <div className="term-hdr-actions">
          <motion.button 
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="text-btn sm accent-btn" 
            onClick={onOpenHackerModal}
            title="Open Fullscreen Matrix Hacker Terminal"
          >
            <Maximize2 size={11} style={{ marginRight: 4 }} /> HACKER MATRIX
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
            ) : (
              <span className={log.type}>{log.text}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mini Command Input & Quick Pills */}
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
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mini-exec-btn"
          onClick={() => handleMiniExec()}
        >
          <Play size={10} style={{ fill: 'currentColor' }} />
        </motion.button>
      </div>
    </div>
  );
}
