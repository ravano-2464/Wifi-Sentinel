import React, { useRef, useEffect, useState } from 'react';
import { Radio, Layers, Eye, ShieldAlert, Wifi } from 'lucide-react';
import { playCyberSound } from '../utils/audio';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function TacticalRadar({ 
  currentWifi, 
  profiles, 
  nearbyNetworks,
  onSelectSsid, 
  audioEnabled, 
  onLogTerminal 
}) {
  const canvasRef = useRef(null);
  const [radarMode, setRadarMode] = useState('AIRWAVES'); // 'AIRWAVES' | 'HYBRID'
  const [coordsText, setCoordsText] = useState('AZ: 0° | LIVE BEACONS: 0');
  const [lockedSsid, setLockedSsid] = useState('-');
  const [targetCount, setTargetCount] = useState(0);

  const stateRef = useRef({
    angle: 0,
    speed: 0.03,
    nodes: [],
    mousePos: null
  });

  // Recompute radar nodes when surrounding networks or mode change
  useEffect(() => {
    const nodes = [];
    const currentSsid = currentWifi && currentWifi.connected ? currentWifi.ssid : '';

    // Always add active connected network at primary lock position
    if (currentWifi && currentWifi.connected) {
      const activeSig = currentWifi.signalPercent || 85;
      // Distance inversely proportional to signal: 100% signal = 0.25 (close), 30% = 0.85
      const dist = Math.max(0.2, 1.0 - (activeSig / 100) * 0.75);
      
      const activeProf = profiles.find(p => p.ssid === currentWifi.ssid || p.name === currentWifi.profile);

      nodes.push({
        ssid: currentWifi.ssid,
        bssid: currentWifi.bssid || 'f4:2d:06:ad:27:34',
        band: currentWifi.band || '2.4 GHz',
        channel: currentWifi.channel || '8',
        signal: activeSig,
        type: 'active',
        status: 'CONNECTED AP',
        angle: 1.2,
        distRatio: dist,
        auth: currentWifi.authentication || 'WPA2-Personal',
        password: activeProf ? activeProf.password : null,
        isSaved: true
      });
      setLockedSsid(currentWifi.ssid);
    } else {
      setLockedSsid('-');
    }

    // 1. Process Live Surrounding Broadcasts (In-The-Air Airwaves)
    const addedSsidSet = new Set(nodes.map(n => n.ssid.toLowerCase()));

    if (nearbyNetworks && nearbyNetworks.length > 0) {
      nearbyNetworks.forEach((net, i) => {
        if (addedSsidSet.has(net.ssid.toLowerCase())) return;
        addedSsidSet.add(net.ssid.toLowerCase());

        const hash = simpleHash(net.ssid + (net.bssid || i));
        const angle = (hash % 360) * (Math.PI / 180);
        const sig = net.signal || 50;
        // Radial distance based on physical signal strength
        const distRatio = Math.max(0.25, Math.min(0.92, 1.0 - (sig / 100) * 0.7));

        let nodeType = 'nearby';
        let status = 'AIRWAVE TARGET';

        if (net.isOpen) {
          nodeType = 'open';
          status = 'OPEN AIRWAVE (NO PASS)';
        } else if (net.isSaved) {
          nodeType = 'cracked';
          status = 'CRACKED (KEY IN VAULT)';
        }

        nodes.push({
          ssid: net.ssid,
          bssid: net.bssid || 'BROADCAST',
          band: net.band || '2.4 GHz',
          channel: net.channel || 'Auto',
          signal: sig,
          type: nodeType,
          status,
          angle,
          distRatio,
          auth: net.authentication,
          password: net.savedPassword,
          isSaved: net.isSaved
        });
      });
    }

    // 2. If HYBRID mode is enabled, add remaining saved local profiles to outer perimeter
    if (radarMode === 'HYBRID') {
      profiles.forEach((p) => {
        if (addedSsidSet.has(p.ssid.toLowerCase())) return;
        addedSsidSet.add(p.ssid.toLowerCase());

        const hash = simpleHash(p.ssid);
        const angle = (hash % 360) * (Math.PI / 180);
        const is5G = p.ssid.includes('5G') || p.ssid.includes('5g');
        const distRatio = is5G ? 0.82 + ((hash % 12) / 100) : 0.72 + ((hash % 15) / 100);

        nodes.push({
          ssid: p.ssid,
          bssid: 'SAVED PROFILE',
          band: is5G ? '5 GHz' : '2.4 GHz',
          channel: 'Profile',
          signal: 30 + (hash % 30),
          type: p.isOpen ? 'open' : 'saved',
          status: 'SAVED VAULT PROFILE',
          angle,
          distRatio,
          auth: p.authentication,
          password: p.password,
          isSaved: true
        });
      });
    }

    stateRef.current.nodes = nodes;
    setTargetCount(nodes.length);
  }, [currentWifi, profiles, nearbyNetworks, radarMode]);

  // Canvas render animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = width / 2 - 20;

      ctx.clearRect(0, 0, width, height);

      // 1. Concentric distance circles (Signal: 100%, 75%, 50%, 25%)
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.2)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1.0].forEach((ratio, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();

        // Signal ring labels
        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.font = '8px "JetBrains Mono", monospace';
        const labels = ['90%', '70%', '45%', '20%'];
        ctx.fillText(labels[i], cx + maxRadius * ratio - 18, cy - 4);
      });

      // 2. Crosshairs
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, 10); ctx.lineTo(cx, height - 10);
      ctx.moveTo(10, cy); ctx.lineTo(width - 10, cy);
      ctx.stroke();

      // 3. Diagonal angle markings
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius * 0.7, cy - maxRadius * 0.7);
      ctx.lineTo(cx + maxRadius * 0.7, cy + maxRadius * 0.7);
      ctx.moveTo(cx - maxRadius * 0.7, cy + maxRadius * 0.7);
      ctx.lineTo(cx + maxRadius * 0.7, cy - maxRadius * 0.7);
      ctx.stroke();

      // 4. Sweeping beam
      stateRef.current.angle = (stateRef.current.angle + stateRef.current.speed) % (Math.PI * 2);
      const sweepAngle = stateRef.current.angle;

      const grad = ctx.createConicGradient(sweepAngle, cx, cy);
      grad.addColorStop(0, 'rgba(0, 255, 157, 0.4)');
      grad.addColorStop(0.12, 'rgba(0, 255, 157, 0.08)');
      grad.addColorStop(0.25, 'transparent');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sweep Line
      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxRadius, cy + Math.sin(sweepAngle) * maxRadius);
      ctx.stroke();

      // 5. Draw Blips
      const nowMs = Date.now();
      let hoveredNode = null;

      stateRef.current.nodes.forEach(node => {
        const nx = cx + Math.cos(node.angle) * (maxRadius * node.distRatio);
        const ny = cy + Math.sin(node.angle) * (maxRadius * node.distRatio);
        node.canvasX = nx;
        node.canvasY = ny;

        let diff = (sweepAngle - node.angle) % (Math.PI * 2);
        if (diff < 0) diff += Math.PI * 2;
        const isPinged = diff < 0.25;

        // Color coding
        let color = '#ffb700'; // Default nearby uncracked airwave
        if (node.type === 'active') color = '#00ff9d'; // Active connected
        else if (node.type === 'cracked') color = '#00f0ff'; // Surrounding with cracked pass
        else if (node.type === 'open') color = '#ff0055'; // Open network
        else if (node.type === 'saved') color = '#64748b'; // Saved local profile

        // Ping ripple
        if (isPinged) {
          ctx.beginPath();
          ctx.arc(nx, ny, 10 + Math.sin(nowMs / 100) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Blip core
        ctx.beginPath();
        ctx.arc(nx, ny, node.type === 'active' ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner white dot for cracked / connected
        if (node.isSaved || node.type === 'active') {
          ctx.beginPath();
          ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        }

        if (stateRef.current.mousePos) {
          const dist = Math.hypot(stateRef.current.mousePos.x - nx, stateRef.current.mousePos.y - ny);
          if (dist < 13) hoveredNode = node;
        }
      });

      // 6. Tooltip for Hovered Node
      if (hoveredNode) {
        const tw = 160;
        const th = hoveredNode.password ? 64 : 52;
        const tx = Math.min(Math.max(hoveredNode.canvasX + 10, 20), width - tw - 10);
        const ty = Math.max(hoveredNode.canvasY - th - 10, 20);

        ctx.fillStyle = 'rgba(4, 8, 14, 0.95)';
        ctx.strokeStyle = hoveredNode.type === 'active' ? '#00ff9d' : '#00f0ff';
        ctx.lineWidth = 1;
        ctx.fillRect(tx, ty, tw, th);
        ctx.strokeRect(tx, ty, tw, th);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Rajdhani, sans-serif';
        ctx.fillText(hoveredNode.ssid.substring(0, 18), tx + 8, ty + 15);

        ctx.fillStyle = '#00ff9d';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${hoveredNode.band} | ${hoveredNode.signal}% SIGNAL`, tx + 8, ty + 28);

        ctx.fillStyle = '#00f0ff';
        ctx.fillText(`${hoveredNode.status} // ${hoveredNode.auth || 'WPA2'}`, tx + 8, ty + 40);

        if (hoveredNode.password) {
          ctx.fillStyle = '#ffe600';
          ctx.fillText(`KEY: ${hoveredNode.password}`, tx + 8, ty + 54);
        }
      }

      const deg = Math.round((sweepAngle * 180) / Math.PI);
      setCoordsText(`AZ: ${deg}° | TARGETS: ${stateRef.current.nodes.length}`);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    stateRef.current.mousePos = {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleMouseLeave = () => {
    stateRef.current.mousePos = null;
  };

  const handleClick = () => {
    if (stateRef.current.mousePos) {
      const hovered = stateRef.current.nodes.find(n => 
        Math.hypot(stateRef.current.mousePos.x - n.canvasX, stateRef.current.mousePos.y - n.canvasY) < 14
      );
      if (hovered) {
        playCyberSound('click', audioEnabled);
        onSelectSsid(hovered.ssid);
        onLogTerminal(`RADAR TARGET LOCKED: [${hovered.ssid}] // Signal: ${hovered.signal}% // ${hovered.status}`, 'info');
      }
    }
  };

  return (
    <div className="cyber-card radar-card">
      <div className="card-corner tl"></div>
      <div className="card-corner tr"></div>
      <div className="card-corner bl"></div>
      <div className="card-corner br"></div>

      {/* Header with Mode Switcher */}
      <div className="card-header">
        <div className="header-title">
          <span className="prefix">//</span>
          <h3>AIRSPACE TACTICAL RADAR</h3>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button 
            className={`cyber-btn sm ${radarMode === 'AIRWAVES' ? 'primary' : ''}`}
            onClick={() => {
              playCyberSound('click', audioEnabled);
              setRadarMode('AIRWAVES');
              onLogTerminal('RADAR FILTER: Switched to SURROUNDING AIRWAVES ONLY.', 'info');
            }}
            title="Scan only real-time broadcast signals in the surrounding room"
          >
            <Radio size={11} />
            <span>LIVE AIRWAVES</span>
          </button>

          <button 
            className={`cyber-btn sm ${radarMode === 'HYBRID' ? 'accent' : ''}`}
            onClick={() => {
              playCyberSound('click', audioEnabled);
              setRadarMode('HYBRID');
              onLogTerminal('RADAR FILTER: Switched to HYBRID (Airwaves + Saved Profiles).', 'info');
            }}
            title="Show live broadcasts + saved profiles"
          >
            <Layers size={11} />
            <span>HYBRID</span>
          </button>
        </div>
      </div>

      {/* Radar Canvas */}
      <div className="radar-canvas-box">
        <canvas 
          ref={canvasRef} 
          width="460" 
          height="460"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ cursor: 'crosshair' }}
        />
        <div className="radar-sweep-coords">{coordsText}</div>
      </div>

      {/* Stats */}
      <div className="radar-stats-grid">
        <div className="r-stat">
          <span className="r-label">AIRSPACE TARGETS</span>
          <span className="r-val highlight">{targetCount} NODES</span>
        </div>
        <div className="r-stat">
          <span className="r-label">PRIMARY LOCK</span>
          <span className="r-val highlight">{lockedSsid}</span>
        </div>
        <div className="r-stat">
          <span className="r-label">SCAN MODE</span>
          <span className="r-val">{radarMode === 'AIRWAVES' ? 'LIVE SURROUNDING' : 'HYBRID AIRSPACE'}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="radar-legend">
        <div className="leg-item"><span className="dot active"></span> Connected</div>
        <div className="leg-item"><span className="dot saved"></span> Cracked / Saved</div>
        <div className="leg-item"><span className="dot nearby"></span> Uncracked Airwave</div>
        <div className="leg-item"><span className="dot open"></span> Open Wi-Fi</div>
      </div>
    </div>
  );
}
