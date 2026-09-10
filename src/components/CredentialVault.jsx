import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Eye, EyeOff, Copy, Key } from 'lucide-react';
import VaultTableRow from './VaultTableRow';

export default function CredentialVault({
  profiles,
  nearbyNetworks = [],
  currentWifi,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  revealedMap,
  onToggleReveal,
  onRevealAll,
  onShowQr,
  onShowToast,
  onLogTerminal,
  onPlaySound
}) {
  const q = searchQuery.toLowerCase();
  const currentSsid = currentWifi && currentWifi.connected ? currentWifi.ssid : '';

  // Calculate stats
  let wpa3Count = 0;
  let wpa2Count = 0;
  let openCount = 0;

  profiles.forEach(p => {
    if (p.type === 'WPA3' || p.authentication?.includes('WPA3')) wpa3Count++;
    else if (p.isOpen || p.type === 'OPEN') openCount++;
    else wpa2Count++;
  });

  const nearbySsidSet = new Set(nearbyNetworks.map(n => n.ssid.toLowerCase()));

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = !q || 
      p.ssid.toLowerCase().includes(q) ||
      p.password.toLowerCase().includes(q) ||
      p.authentication?.toLowerCase().includes(q) ||
      p.cipher?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'SURROUNDING') return nearbySsidSet.has(p.ssid.toLowerCase());
    if (activeFilter === 'WPA3') return p.type === 'WPA3' || p.authentication?.includes('WPA3');
    if (activeFilter === 'WPA2') return p.type === 'WPA2' || p.authentication?.includes('WPA2');
    if (activeFilter === '5G') return p.ssid.includes('5G') || p.ssid.includes('5g');
    if (activeFilter === 'OPEN') return p.isOpen || p.type === 'OPEN';

    return true;
  });

  const handleCopy = (pass, ssid) => {
    if (pass) {
      navigator.clipboard.writeText(pass);
      onShowToast(`Copied password for "${ssid}"`);
      onLogTerminal(`COPIED PASSWORD FOR [${ssid}] TO CLIPBOARD`, 'success');
      onPlaySound('click');
    }
  };

  const handleCopyAll = () => {
    let text = '=== EXTRACTED WI-FI PASSWORDS ===\n';
    profiles.forEach(p => {
      text += `${p.ssid} : ${p.password}\n`;
    });
    navigator.clipboard.writeText(text);
    onShowToast(`Copied all ${profiles.length} Wi-Fi credentials!`);
    onLogTerminal(`BULK COPIED ${profiles.length} WI-FI CREDENTIALS TO CLIPBOARD`, 'success');
    onPlaySound('click');
  };

  const allRevealed = filteredProfiles.length > 0 && filteredProfiles.every(p => revealedMap[p.name]);

  return (
    <div className="cyber-card vault-card">
      <div className="card-corner tl"></div>
      <div className="card-corner tr"></div>
      <div className="card-corner bl"></div>
      <div className="card-corner br"></div>

      {/* Header */}
      <div className="card-header flex-between">
        <div className="header-title">
          <Key size={16} color="var(--neon-green)" style={{ marginRight: 4 }} />
          <h3>WI-FI CREDENTIAL VAULT</h3>
          <span className="badge-counter">{profiles.length} PROFILES</span>
        </div>
        
        <div className="vault-summary-pills">
          <span className="summary-pill wpa3"><strong>{wpa3Count}</strong> WPA3</span>
          <span className="summary-pill wpa2"><strong>{wpa2Count}</strong> WPA2</span>
          <span className="summary-pill open"><strong>{openCount}</strong> OPEN</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="vault-filter-toolbar">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Filter SSID, password, authentication, or radio type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearchChange('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-tabs">
          {[
            { id: 'ALL', label: `ALL NETWORKS (${profiles.length})` },
            { id: 'SURROUNDING', label: `📡 LIVE SURROUNDING (${nearbyNetworks.length})` },
            { id: 'WPA3', label: `WPA3 HIGH-SEC (${wpa3Count})` },
            { id: 'WPA2', label: `WPA2 (${wpa2Count})` },
            { id: '5G', label: '5G BANDS' },
            { id: 'OPEN', label: `OPEN (${openCount})` }
          ].map(tab => (
            <motion.button 
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
              onClick={() => onFilterChange(tab.id)}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="vault-table-container">
        <table className="cyber-table">
          <thead>
            <tr>
              <th width="40px">#</th>
              <th>NETWORK SSID</th>
              <th>SECURITY / CIPHER</th>
              <th>CLEARTEXT PASSWORD</th>
              <th width="190px">QUICK ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredProfiles.length === 0 ? (
                <motion.tr 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="loading-state">
                    <span>NO WI-FI CREDENTIAL MATCHES FOUND FOR "{searchQuery}"</span>
                  </td>
                </motion.tr>
              ) : (
                filteredProfiles.map((p, idx) => (
                  <VaultTableRow
                    key={p.name}
                    profile={p}
                    index={idx}
                    isConnected={Boolean(currentSsid && (p.ssid === currentSsid || p.name === currentSsid))}
                    isRevealed={Boolean(revealedMap[p.name])}
                    onToggleReveal={onToggleReveal}
                    onCopy={handleCopy}
                    onShowQr={onShowQr}
                  />
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="vault-footer">
        <div className="footer-meta">
          <span>Showing {filteredProfiles.length} of {profiles.length} profiles</span>
        </div>
        <div className="footer-actions">
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="cyber-btn sm" 
            onClick={onRevealAll}
          >
            {allRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{allRevealed ? 'CONCEAL ALL PASSWORDS' : 'REVEAL ALL PASSWORDS'}</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="cyber-btn sm accent" 
            onClick={handleCopyAll}
          >
            <Copy size={13} />
            <span>COPY ALL AS LIST</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
