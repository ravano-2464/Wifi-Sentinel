import React, { useState, useEffect } from 'react';
import { Radar, Volume2, VolumeX, Zap, Download, Database, FileText, Table } from 'lucide-react';
import { ExportService } from '../services/exportService';
import { formatTime } from '../utils/helpers';

export default function HeaderHUD({ 
  audioEnabled, 
  onToggleAudio, 
  onRefresh, 
  isRefreshing, 
  profiles, 
  currentWifi,
  onShowToast,
  onPlaySound
}) {
  const [clock, setClock] = useState(formatTime);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExport = (type) => {
    let fileName = '';
    if (type === 'json') {
      fileName = ExportService.exportToJson(profiles, currentWifi);
    } else if (type === 'csv') {
      fileName = ExportService.exportToCsv(profiles);
    } else if (type === 'txt') {
      fileName = ExportService.exportToTxt(profiles);
    }
    onShowToast(`Exported ${fileName}`);
    setShowExportMenu(false);
  };

  return (
    <header className="hud-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="radar-mini-icon">
            <Radar className="radar-lucide-icon" size={18} />
          </div>
          <div className="brand-text">
            <h1 className="glitch-text" data-text="WIFI//SENTINEL">WIFI//SENTINEL</h1>
            <span className="sub-glitch">MODULAR REACT 18 // TACTICAL AIRSPACE SCANNER</span>
          </div>
        </div>
      </div>

      <div className="header-center hud-status-bar">
        <div className="status-chip active">
          <span className="pulse-dot"></span>
          <span className="label">AIRSPACE:</span>
          <span className="val">MONITORING</span>
        </div>
        <div className="status-chip">
          <span className="label">SYSTEM:</span>
          <span className="val">NETSH WIN-64 // VITE 5</span>
        </div>
        <div className="status-chip">
          <span className="label">TIME:</span>
          <span className="val">{clock}</span>
        </div>
      </div>

      <div className="header-right hud-controls">
        <button 
          onClick={onToggleAudio} 
          className="cyber-btn sm" 
          title="Toggle Cyber Sound Effects"
        >
          {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>{audioEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED'}</span>
        </button>

        <button 
          onClick={() => { onPlaySound('click'); onRefresh(); }} 
          className={`cyber-btn sm primary ${isRefreshing ? 'loading' : ''}`}
          title="Scan spectrum again"
        >
          <Zap size={14} />
          <span>{isRefreshing ? 'SCANNING...' : 'SCAN AIRSPACE'}</span>
        </button>

        <div className="dropdown-wrapper">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPlaySound('click');
              setShowExportMenu(!showExportMenu);
            }} 
            className="cyber-btn sm accent"
          >
            <Download size={14} />
            <span>EXPORT VAULT ▾</span>
          </button>

          {showExportMenu && (
            <div className="dropdown-menu show" onClick={(e) => e.stopPropagation()}>
              <a href="#export" onClick={(e) => { e.preventDefault(); handleExport('json'); }}>
                <Database size={13} style={{ marginRight: 6 }} /> Export JSON
              </a>
              <a href="#export" onClick={(e) => { e.preventDefault(); handleExport('csv'); }}>
                <Table size={13} style={{ marginRight: 6 }} /> Export CSV
              </a>
              <a href="#export" onClick={(e) => { e.preventDefault(); handleExport('txt'); }}>
                <FileText size={13} style={{ marginRight: 6 }} /> Export Plaintext
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
