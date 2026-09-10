import React from 'react';
import { motion } from 'framer-motion';

export default function VaultTableRow({
  profile,
  index,
  isConnected,
  isRevealed,
  onToggleReveal,
  onCopy,
  onShowQr
}) {
  const passDisplay = isRevealed 
    ? (profile.password || '(No Password)') 
    : (profile.isOpen ? '(Open Network)' : '••••••••••••');

  let badgeClass = 'security-badge';
  if (profile.type === 'WPA3' || profile.authentication?.includes('WPA3')) badgeClass += ' wpa3';
  else if (profile.isOpen) badgeClass += ' open';

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={isConnected ? 'active-row' : ''}
    >
      <td><span style={{ color: 'var(--text-dim)' }}>{index + 1}</span></td>
      <td>
        <div className="table-ssid">
          <span>{profile.ssid}</span>
          {isConnected && <span className="active-tag">CONNECTED</span>}
        </div>
      </td>
      <td>
        <span className={badgeClass}>{profile.type || 'WPA2'}</span>
        <span className="cipher-sub">{profile.cipher || 'CCMP'}</span>
      </td>
      <td>
        <div className="pass-field-wrapper">
          <span className={`table-pass-text ${isRevealed ? '' : (profile.isOpen ? 'open' : 'masked')}`}>
            {passDisplay}
          </span>
        </div>
      </td>
      <td>
        <div className="table-actions">
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="tbl-btn"
            onClick={() => onToggleReveal(profile.name, profile.password)}
            title="Reveal / Hide Password"
          >
            {isRevealed ? 'HIDE' : 'DECODE'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="tbl-btn"
            onClick={() => onCopy(profile.password, profile.ssid)}
            title="Copy Password"
          >
            COPY
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="tbl-btn accent"
            onClick={() => onShowQr(profile.ssid, profile.password, profile.authentication)}
            title="Generate Mobile QR"
          >
            QR
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}
