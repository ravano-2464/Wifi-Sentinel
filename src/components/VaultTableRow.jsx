import React from 'react';

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
    <tr className={isConnected ? 'active-row' : ''}>
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
          <button 
            className="tbl-btn"
            onClick={() => onToggleReveal(profile.name, profile.password)}
            title="Reveal / Hide Password"
          >
            {isRevealed ? 'HIDE' : 'DECODE'}
          </button>
          <button 
            className="tbl-btn"
            onClick={() => onCopy(profile.password, profile.ssid)}
            title="Copy Password"
          >
            COPY
          </button>
          <button 
            className="tbl-btn accent"
            onClick={() => onShowQr(profile.ssid, profile.password, profile.authentication)}
            title="Generate Mobile QR"
          >
            QR
          </button>
        </div>
      </td>
    </tr>
  );
}
