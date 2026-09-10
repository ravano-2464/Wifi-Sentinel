import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Zap, Layers, Eye, ShieldAlert, Wifi } from 'lucide-react';
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
  const [radarMode, setRadarMode] = useState('OMNI'); // 'OMNI' (100% Real Wi-Fi Card Scan) | 'HYBRID' (Live + Stored Profiles)
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

    // Always add active connected network at primary lock position
    if (currentWifi && currentWifi.connected) {
      const activeSig = currentWifi.signalPercent || 85;
      // Distance inversely proportional to physical signal strength
      const dist = Math.max(0.2, 1.0 - (activeSig / 100) * 0.75);
      
      const activeProf = profiles.find(p => p.ssid === currentWifi.ssid || p.name === currentWifi.profile);

      nodes.push({
        ssid: currentWifi.ssid,
        bssid: currentWifi.bssid || 'f4:2d:06:ad:27:34',
        band: currentWifi.band || '2.4 GHz',
        channel: currentWifi.channel || '8',
        signal: activeSig,
        type: 'active',
        status: 'CONNECTED AP (ACTIVE)',
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

    const addedSsidSet = new Set(nodes.map(n => n.ssid.toLowerCase()));

    // 1. Process Genuine Real-Time Wi-Fi Card Broadcasts (In physical wireless range)
    if (nearbyNetworks && nearbyNetworks.length > 0) {
      nearbyNetworks.forEach((net, i) => {
        if (addedSsidSet.has(net.ssid.toLowerCase())) return;
        addedSsidSet.add(net.ssid.toLowerCase());

        const hash = simpleHash(net.ssid + (net.bssid || i));
        const angle = (hash % 360) * (Math.PI / 180);
        const sig = net.signal || 50;
        // Radial distance directly calculated from real physical antenna signal
        const distRatio = Math.max(0.25, Math.min(0.90, 1.0 - (sig / 100) * 0.72));

        let nodeType = 'nearby';
        let status = `AIRWAVE TARGET // CH.${net.channel || 'Auto'}`;

        if (net.isOpen) {
          nodeType = 'open';
          status = `OPEN AIRWAVE // CH.${net.channel || 'Auto'}`;
        } else if (net.isSaved) {
          nodeType = 'cracked';
          status = `CRACKED // CH.${net.channel || 'Auto'}`;
        }

        nodes.push({
          ssid: net.ssid,
          bssid: net.bssid || 'BROADCAST AP',
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

    // 2. HYBRID MODE: Show live broadcasts + saved offline profiles on outer perimeter
    if (radarMode === 'HYBRID') {
      profiles.forEach((p) => {
        if (addedSsidSet.has(p.ssid.toLowerCase())) return;
        addedSsidSet.add(p.ssid.toLowerCase());

        const hash = simpleHash(p.ssid);
        const angle = (hash % 360) * (Math.PI / 180);
        const is5G = p.ssid.includes('5G') || p.ssid.includes('5g');
        const distRatio = is5G ? 0.84 + ((hash % 10) / 100) : 0.76 + ((hash % 12) / 100);

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
      const maxRadius = width / 2 - 36;

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
        ctx.fillText(labels[i], cx + maxRadius * ratio - 22, cy - 5);
      });

      // 2. Crosshairs
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, 16); ctx.lineTo(cx, height - 16);
      ctx.moveTo(16, cy); ctx.lineTo(width - 16, cy);
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
        else if (node.type === 'omni') color = '#d946ef'; // Live Omni Discovery Node (Neon Magenta)
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
        ctx.arc(nx, ny, node.type === 'active' ? 5.5 : (node.type === 'omni' ? 4.5 : 4), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = node.type === 'omni' ? 12 : 9;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner white dot for cracked / connected / omni
        if (node.isSaved || node.type === 'active' || node.type === 'omni') {
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
        const line1 = hoveredNode.ssid.length > 26 ? hoveredNode.ssid.substring(0, 24) + '...' : hoveredNode.ssid;
        const line2 = `${hoveredNode.band} | ${hoveredNode.signal}% SIGNAL`;
        const line3 = `${hoveredNode.status} // ${hoveredNode.auth || 'WPA2'}`;
        const line4 = hoveredNode.password ? `KEY: ${hoveredNode.password}` : null;

        // Measure maximum text width for dynamic box sizing
        ctx.font = 'bold 12px Rajdhani, sans-serif';
        const w1 = ctx.measureText(line1).width;
        ctx.font = '10px "JetBrains Mono", monospace';
        const w2 = ctx.measureText(line2).width;
        const w3 = ctx.measureText(line3).width;
        const w4 = line4 ? ctx.measureText(line4).width : 0;

        const maxTextWidth = Math.max(w1, w2, w3, w4);
        const tw = Math.max(225, Math.ceil(maxTextWidth + 28));
        const th = line4 ? 68 : 54;

        // Smart positioning to prevent overflow outside radar canvas
        let tx = hoveredNode.canvasX + 12;
        if (tx + tw > width - 10) {
          tx = hoveredNode.canvasX - tw - 12;
        }
        tx = Math.max(10, Math.min(tx, width - tw - 10));

        let ty = hoveredNode.canvasY - th - 12;
        if (ty < 10) {
          ty = hoveredNode.canvasY + 16;
        }
        ty = Math.max(10, Math.min(ty, height - th - 10));

        // Border color based on node type
        let borderColor = '#00f0ff';
        if (hoveredNode.type === 'active') borderColor = '#00ff9d';
        else if (hoveredNode.type === 'omni') borderColor = '#d946ef';
        else if (hoveredNode.type === 'open') borderColor = '#ff0055';

        // Draw background and glowing border
        ctx.fillStyle = 'rgba(4, 8, 14, 0.96)';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.2;
        ctx.fillRect(tx, ty, tw, th);
        ctx.strokeRect(tx, ty, tw, th);

        // Cyberpunk decorative corner accents
        ctx.fillStyle = borderColor;
        ctx.fillRect(tx, ty, 3, 3);
        ctx.fillRect(tx + tw - 3, ty, 3, 3);
        ctx.fillRect(tx, ty + th - 3, 3, 3);
        ctx.fillRect(tx + tw - 3, ty + th - 3, 3, 3);

        // Text rendering with comfortable margins
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Rajdhani, sans-serif';
        ctx.fillText(line1, tx + 10, ty + 15);

        ctx.fillStyle = '#00ff9d';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(line2, tx + 10, ty + 28);

        ctx.fillStyle = hoveredNode.type === 'omni' ? '#f0abfc' : '#00f0ff';
        ctx.fillText(line3, tx + 10, ty + 41);

        if (line4) {
          ctx.fillStyle = '#ffe600';
          ctx.fillText(line4, tx + 10, ty + 55);
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
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`cyber-btn sm ${radarMode === 'OMNI' ? 'primary' : ''}`}
            onClick={() => {
              playCyberSound('click', audioEnabled);
              setRadarMode('OMNI');
              onLogTerminal('RADAR FILTER: Switched to LIVE OMNI (Wi-Fi Card Hardware Scan).', 'success');
            }}
            title="Scan real-time broadcast signals in physical range using your Wi-Fi card adapter"
          >
            <Radio size={11} />
            <span>LIVE OMNI SCAN</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`cyber-btn sm ${radarMode === 'HYBRID' ? 'accent' : ''}`}
            onClick={() => {
              playCyberSound('click', audioEnabled);
              setRadarMode('HYBRID');
              onLogTerminal('RADAR FILTER: Switched to HYBRID (Live Airwaves + Saved Vault Profiles).', 'info');
            }}
            title="Show live broadcasts + saved offline profiles"
          >
            <Layers size={11} />
            <span>HYBRID (LIVE + VAULT)</span>
          </motion.button>
        </div>
      </div>

      {/* Radar Canvas */}
      <div className="radar-canvas-box">
        <canvas 
          ref={canvasRef} 
          width="480" 
          height="480"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{ cursor: 'crosshair', width: '100%', height: '100%' }}
        />
        <div className="radar-sweep-coords">{coordsText}</div>
      </div>

      {/* Stats */}
      <div className="radar-stats-grid">
        <div className="r-stat">
          <span className="r-label">AIRSPACE TARGETS</span>
          <span className="r-val highlight">{targetCount} IN RANGE</span>
        </div>
        <div className="r-stat">
          <span className="r-label">PRIMARY LOCK</span>
          <span className="r-val highlight">{lockedSsid}</span>
        </div>
        <div className="r-stat">
          <span className="r-label">SCAN MODE</span>
          <span className="r-val">
            {radarMode === 'OMNI' ? 'LIVE WI-FI CARD' : 'HYBRID AIRSPACE'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="radar-legend">
        <div className="leg-item"><span className="dot active"></span> Connected</div>
        <div className="leg-item"><span className="dot saved"></span> Key In Vault</div>
        <div className="leg-item"><span className="dot nearby"></span> Uncracked Airwave</div>
        <div className="leg-item"><span className="dot open"></span> Open Wi-Fi</div>
      </div>
    </div>
  );
}
