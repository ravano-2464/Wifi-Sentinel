import React, { useState } from 'react';
import { Eye, EyeOff, Copy, QrCode, Wifi, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getRadioGen } from '../utils/helpers';

export default function ActiveUplink({ 
  currentWifi, 
  profiles, 
  onShowQr, 
  onShowToast, 
  onLogTerminal,
  onPlaySound 
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!currentWifi || !currentWifi.connected) {
    return (
      <section className="active-uplink-section">
        <div className="cyber-card uplink-hero-card">
          <div className="card-corner tl"></div>
          <div className="card-corner tr"></div>
          <div className="card-corner bl"></div>
          <div className="card-corner br"></div>
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--neon-cyan)' }}>
            <Wifi size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
            <h3>NO ACTIVE WI-FI UPLINK DETECTED</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Adapter: {currentWifi ? currentWifi.description : 'Wi-Fi Interface Standby'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const activeProfile = profiles.find(p => p.ssid === currentWifi.ssid || p.name === currentWifi.profile);
  const clearPassword = activeProfile ? activeProfile.password : '';

  const handleReveal = () => {
    onPlaySound('decode');
    setIsRevealed(!isRevealed);
  };

  const handleCopy = () => {
    if (clearPassword) {
      navigator.clipboard.writeText(clearPassword);
      onShowToast(`Copied password for "${currentWifi.ssid}"`);
      onLogTerminal(`COPIED ACTIVE PASSWORD FOR [${currentWifi.ssid}] TO CLIPBOARD`, 'success');
      onPlaySound('click');
    }
  };

  const handleQr = () => {
    onShowQr(currentWifi.ssid, clearPassword, currentWifi.authentication);
  };

  const tx = currentWifi.transmitRateMbps || 0;
  const rx = currentWifi.receiveRateMbps || 0;
  const sig = currentWifi.signalPercent || 0;

  return (
    <section className="active-uplink-section">
      <div className="cyber-card uplink-hero-card">
        <div className="card-corner tl"></div>
        <div className="card-corner tr"></div>
        <div className="card-corner bl"></div>
        <div className="card-corner br"></div>

        <div className="uplink-grid">
          {/* Column 1: SSID Identity & Password */}
          <div className="uplink-col-identity">
            <div className="badge-row">
              <span className="cyber-badge active-badge">
                <span className="pulse-dot"></span> ACTIVE UPLINK ESTABLISHED
              </span>
              <span className="cyber-badge freq-badge">{currentWifi.band || '2.4 GHz'}</span>
              <span className="cyber-badge channel-badge">CH {currentWifi.channel || '8'}</span>
            </div>

            <div className="ssid-display-box">
              <span className="field-label">CONNECTED NETWORK SSID</span>
              <h2 className="active-ssid-name">{currentWifi.ssid || 'Active Network'}</h2>
              <div className="adapter-info">
                Adapter: {currentWifi.description || 'MediaTek Wi-Fi 6 Adapter'}
              </div>
            </div>

            {/* Active Password Box */}
            <div className="active-password-container">
              <div className="pass-label-row">
                <span className="field-label">ACTIVE NETWORK CREDENTIAL:</span>
                <span className="security-type-tag">{(currentWifi.authentication || 'WPA2').toUpperCase()}</span>
              </div>
              <div className="password-box-glow">
                <input 
                  type="text" 
                  className="pass-input" 
                  value={isRevealed ? (clearPassword || '(Open Network / No Password)') : '••••••••••••'} 
                  readOnly 
                />
                <div className="pass-actions">
                  <button onClick={handleReveal} className="action-btn" title="Reveal / Hide Password">
                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{isRevealed ? 'HIDE' : 'REVEAL'}</span>
                  </button>
                  <button onClick={handleCopy} className="action-btn" title="Copy to Clipboard">
                    <Copy size={13} />
                    <span>COPY</span>
                  </button>
                  <button onClick={handleQr} className="action-btn accent" title="Generate Mobile QR">
                    <QrCode size={13} />
                    <span>QR CODE</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Live Speed & Telemetry */}
          <div className="uplink-col-speed">
            <div className="speed-header">
              <span className="section-tag">HARDWARE TELEMETRY</span>
              <span className="live-tag">LIVE LINK SPEEDS</span>
            </div>

            <div className="speed-meters-container">
              {/* TX Meter */}
              <div className="speed-gauge-card">
                <div className="gauge-meta">
                  <span className="gauge-icon">
                    <ArrowUpRight size={13} style={{ display: 'inline', marginRight: 4 }} /> TX (TRANSMIT)
                  </span>
                  <span className="gauge-val">{tx.toFixed(1)} <small>Mbps</small></span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill tx-fill" 
                    style={{ width: `${Math.min(100, Math.max(4, (tx / 600) * 100))}%` }}
                  ></div>
                </div>
                <div className="speed-scale">
                  <span>0</span><span>150</span><span>300</span><span>600+ Mbps</span>
                </div>
              </div>

              {/* RX Meter */}
              <div className="speed-gauge-card">
                <div className="gauge-meta">
                  <span className="gauge-icon">
                    <ArrowDownLeft size={13} style={{ display: 'inline', marginRight: 4 }} /> RX (RECEIVE)
                  </span>
                  <span className="gauge-val">{rx.toFixed(1)} <small>Mbps</small></span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill rx-fill" 
                    style={{ width: `${Math.min(100, Math.max(4, (rx / 600) * 100))}%` }}
                  ></div>
                </div>
                <div className="speed-scale">
                  <span>0</span><span>150</span><span>300</span><span>600+ Mbps</span>
                </div>
              </div>
            </div>

            {/* Signal & RSSI Level */}
            <div className="signal-row">
              <div className="signal-item">
                <span className="sig-label">SIGNAL STRENGTH</span>
                <div className="sig-display">
                  <div className="cyber-signal-bars">
                    <span className={`bar ${sig >= 15 ? 'active' : ''}`}></span>
                    <span className={`bar ${sig >= 40 ? 'active' : ''}`}></span>
                    <span className={`bar ${sig >= 65 ? 'active' : ''}`}></span>
                    <span className={`bar ${sig >= 85 ? 'active' : ''}`}></span>
                  </div>
                  <span className="sig-num">{sig}%</span>
                </div>
              </div>
              <div className="signal-item">
                <span className="sig-label">RSSI POWER</span>
                <span className="rssi-val">{currentWifi.rssi || '-69 dBm'}</span>
              </div>
              <div className="signal-item">
                <span className="sig-label">RADIO STANDARD</span>
                <span className="radio-val">{currentWifi.radioType || '802.11n'} ({getRadioGen(currentWifi.radioType)})</span>
              </div>
            </div>
          </div>

          {/* Column 3: Security & Cipher Suite */}
          <div className="uplink-col-security">
            <div className="sec-header">
              <span className="section-tag">SECURITY MATRIX</span>
              <span className="status-verified">LOCK: SECURE</span>
            </div>
            <div className="crypto-meta-list">
              <div className="crypto-item">
                <span className="k">AUTH PROTOCOL:</span>
                <span className="v highlight-neon">{currentWifi.authentication || 'WPA2-Personal'}</span>
              </div>
              <div className="crypto-item">
                <span className="k">CIPHER SUITE:</span>
                <span className="v">{currentWifi.cipher || 'CCMP / AES'}</span>
              </div>
              <div className="crypto-item">
                <span className="k">ACCESS POINT MAC:</span>
                <span className="v monospace">{currentWifi.bssid || 'f4:2d:06:ad:27:34'}</span>
              </div>
              <div className="crypto-item">
                <span className="k">FREQUENCY BAND:</span>
                <span className="v">{currentWifi.band || '2.4 GHz'} (Channel {currentWifi.channel || '8'})</span>
              </div>
              <div className="crypto-item">
                <span className="k">PROFILE STATUS:</span>
                <span className="v">Auto-Connect Enabled // Cleartext Key Stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
