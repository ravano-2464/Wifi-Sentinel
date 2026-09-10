import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, QrCode, Copy, Download } from 'lucide-react';
import { CyberQR } from '../utils/qr';
import { playCyberSound } from '../utils/audio';

export default function QrModal({ isOpen, onClose, data, audioEnabled, onShowToast }) {
  const canvasRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && data && canvasRef.current) {
      const payload = CyberQR.wifiPayload(data.ssid, data.password, data.auth);
      CyberQR.render(canvasRef.current, payload, {
        size: 220,
        darkColor: '#00ff9d',
        lightColor: '#06090e'
      }).then(() => {
        if (isMounted) setIsRendered(true);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const payload = CyberQR.wifiPayload(data.ssid, data.password, data.auth);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    onShowToast('Copied raw Wi-Fi QR barcode payload!');
    playCyberSound('click', audioEnabled);
  };

  const handleDownload = async () => {
    if (data) {
      const url = await CyberQR.toDataURL(payload, { 
        size: 400, 
        darkColor: '#00ff9d', 
        lightColor: '#06090e' 
      });
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        const safeName = (data.ssid || 'network').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `wifi_qr_${safeName}.png`;
        a.click();
        onShowToast(`Downloaded Wi-Fi QR for ${data.ssid}!`);
        playCyberSound('click', audioEnabled);
      }
    }
  };

  return (
    <motion.div 
      className="cyber-modal-backdrop show" 
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="cyber-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.88, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 25 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
      >
        <div className="modal-corner tl"></div>
        <div className="modal-corner tr"></div>
        <div className="modal-corner bl"></div>
        <div className="modal-corner br"></div>

        <div className="modal-header">
          <div className="modal-title">
            <QrCode size={16} color="var(--neon-green)" style={{ marginRight: 6 }} />
            <h3>MOBILE INSTANT CONNECT QR</h3>
          </div>
          <motion.button 
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            className="modal-close-btn" 
            onClick={onClose}
            title="Close Modal"
          >
            <X size={14} />
          </motion.button>
        </div>

        <div className="modal-body">
          <p className="modal-instruction">
            Arahkan kamera smartphone Anda ke QR code berikut untuk langsung tersambung otomatis ke Wi-Fi tanpa perlu mengetik password secara manual.
          </p>
          
          <div className="qr-preview-box">
            <canvas 
              ref={canvasRef} 
              width="220" 
              height="220" 
              style={{ 
                imageRendering: 'pixelated', 
                borderRadius: '4px',
                display: 'block'
              }} 
            />
          </div>

          <div className="qr-details-card">
            <div className="qr-info-row">
              <span className="qr-k">SSID:</span>
              <span className="qr-v highlight">{data.ssid}</span>
            </div>
            <div className="qr-info-row">
              <span className="qr-k">PASSWORD:</span>
              <span className="qr-v monospace">{data.password || '(Open / None)'}</span>
            </div>
            <div className="qr-info-row">
              <span className="qr-k">AUTH:</span>
              <span className="qr-v">{data.auth || 'WPA2-Personal'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="cyber-btn sm" 
            onClick={handleCopyPayload}
          >
            <Copy size={13} />
            <span>COPY PAYLOAD</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="cyber-btn sm primary" 
            onClick={handleDownload}
          >
            <Download size={13} />
            <span>SAVE QR IMAGE</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
