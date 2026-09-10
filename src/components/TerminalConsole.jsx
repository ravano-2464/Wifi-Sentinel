import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trash2 } from 'lucide-react';

export default function TerminalConsole({ logs, onClearLogs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="cyber-card terminal-card">
      <div className="card-corner tl"></div>
      <div className="card-corner tr"></div>
      <div className="card-corner bl"></div>
      <div className="card-corner br"></div>

      <div className="card-header">
        <div className="header-title">
          <Terminal size={14} color="var(--neon-green)" style={{ marginRight: 4 }} />
          <h3>NETSH DIAGNOSTIC CONSOLE</h3>
        </div>
        <motion.button 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="text-btn sm" 
          onClick={onClearLogs} 
          title="Clear Terminal Logs"
        >
          <Trash2 size={12} style={{ display: 'inline', marginRight: 4 }} /> CLEAR
        </motion.button>
      </div>

      <div className="terminal-log-stream" ref={containerRef}>
        {logs.map((log, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="log-line"
          >
            <span className="time">[{log.time}]</span>{' '}
            <span className={log.type}>{log.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
