import React, { useState, useCallback } from 'react';
import HeaderHUD from './components/HeaderHUD';
import ActiveUplink from './components/ActiveUplink';
import TacticalRadar from './components/TacticalRadar';
import TerminalConsole from './components/TerminalConsole';
import CredentialVault from './components/CredentialVault';
import QrModal from './components/QrModal';
import ToastContainer from './components/ToastContainer';
import { useWifiTelemetry } from './hooks/useWifiTelemetry';
import { useAudioFx } from './hooks/useAudioFx';
import { formatTime } from './utils/helpers';

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [logs, setLogs] = useState([
    { time: formatTime(), text: 'MODULAR REACT 18 + VITE INITIALIZED // Scalable Architecture Active.', type: 'info' }
  ]);

  const logTerminal = useCallback((text, type = 'info') => {
    setLogs(prev => [...prev.slice(-40), { time: formatTime(), text, type }]);
  }, []);

  const showToast = useCallback((text) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  // Custom Hooks
  const { audioEnabled, toggleAudio, play: playSound } = useAudioFx(showToast);
  const { currentWifi, profiles, nearbyNetworks, isRefreshing, refreshAudit } = useWifiTelemetry(logTerminal);

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [revealedMap, setRevealedMap] = useState({});
  const [qrModalData, setQrModalData] = useState(null);

  // Password Reveal Handlers
  const handleToggleReveal = (name) => {
    playSound('decode');
    setRevealedMap(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleRevealAll = () => {
    playSound('decode');
    const allRevealed = profiles.length > 0 && profiles.every(p => revealedMap[p.name]);
    const nextMap = {};
    if (!allRevealed) {
      profiles.forEach(p => { nextMap[p.name] = true; });
    }
    setRevealedMap(nextMap);
  };

  const handleShowQr = (ssid, password, auth) => {
    setQrModalData({ ssid, password, auth });
    logTerminal(`GENERATED INSTANT QR FOR [${ssid}]`, 'info');
  };

  return (
    <div className="app-container">
      {/* HUD Header */}
      <HeaderHUD 
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        onRefresh={refreshAudit}
        isRefreshing={isRefreshing}
        profiles={profiles}
        currentWifi={currentWifi}
        onShowToast={showToast}
        onPlaySound={playSound}
      />

      {/* Hero Active Uplink Matrix */}
      <ActiveUplink 
        currentWifi={currentWifi}
        profiles={profiles}
        onShowQr={handleShowQr}
        onShowToast={showToast}
        onLogTerminal={logTerminal}
        onPlaySound={playSound}
      />

      {/* Main Two-Column Workspace */}
      <main className="main-workspace-grid">
        {/* Left Column: Tactical Radar & Console */}
        <aside className="radar-column">
          <TacticalRadar 
            currentWifi={currentWifi}
            profiles={profiles}
            nearbyNetworks={nearbyNetworks}
            onSelectSsid={(ssid) => setSearchQuery(ssid)}
            audioEnabled={audioEnabled}
            onLogTerminal={logTerminal}
          />

          <TerminalConsole 
            logs={logs}
            onClearLogs={() => setLogs([{ time: formatTime(), text: 'NETSH CONSOLE CLEARED.', type: 'info' }])}
          />
        </aside>

        {/* Right Column: Credential Vault */}
        <section className="vault-column">
          <CredentialVault 
            profiles={profiles}
            nearbyNetworks={nearbyNetworks}
            currentWifi={currentWifi}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            revealedMap={revealedMap}
            onToggleReveal={handleToggleReveal}
            onRevealAll={handleRevealAll}
            onShowQr={handleShowQr}
            onShowToast={showToast}
            onLogTerminal={logTerminal}
            onPlaySound={playSound}
          />
        </section>
      </main>

      {/* HUD Footer */}
      <footer className="hud-footer">
        <div className="footer-left">
          <span>CYBER//WIFI-SENTINEL (REACT 18 + VITE)</span> • <span>MODULAR COMPONENT ARCHITECTURE</span>
        </div>
        <div className="footer-right">
          <span className="status-ok">● SYSTEM OPERATIONAL</span>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QrModal 
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        data={qrModalData}
        audioEnabled={audioEnabled}
        onShowToast={showToast}
      />

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
