import React, { useRef, useEffect } from 'react';
import { X, QrCode, Copy, Download } from 'lucide-react';
import { CyberQR } from '../utils/qr';
import { playCyberSound } from '../utils/audio';

export default function QrModal({ isOpen, onClose, data, audioEnabled, onShowToast }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && data && canvasRef.current) {
      const payload = CyberQR.wifiPayload(data.ssid, data.password, data.auth);
      CyberQR.render(canvasRef.current, payload, {
        size: 200,
        darkColor: '#00ff9d',
        lightColor: '#06090e'
      });
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const payload = CyberQR.wifiPayload(data.ssid, data.password, data.auth);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    onShowToast('Copied raw Wi-Fi QR barcode payload!');
    playCyberSound('click', audioEnabled);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const a = document.createElement('a');
      a.href = canvasRef.current.toDataURL('image/png');
      a.download = `wifi_qr_${data.ssid || 'network'}.png`;
      a.click();
      onShowToast('Downloaded Wi-Fi QR Image!');
      playCyberSound('click', audioEnabled);
    }
  };

  return (
    <div className="cyber-modal-backdrop show" onClick={onClose}>
      <div className="cyber-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-corner tl"></div>
        <div className="modal-corner tr"></div>
        <div className="modal-corner bl"></div>
        <div className="modal-corner br"></div>

        <div className="modal-header">
          <div className="modal-title">
            <QrCode size={16} color="var(--neon-green)" style={{ marginRight: 6 }} />
            <h3>MOBILE INSTANT CONNECT QR</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-instruction">
            Arahkan kamera smartphone Anda ke QR code berikut untuk langsung tersambung otomatis ke Wi-Fi tanpa perlu mengetik password.
          </p>
          
          <div className="qr-preview-box">
            <canvas ref={canvasRef} width="200" height="200" style={{ imageRendering: 'pixelated' }} />
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
              <span className="qr-v">{data.auth || 'WPA2/WPA3'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cyber-btn sm" onClick={handleCopyPayload}>
            <Copy size={13} />
            <span>COPY PAYLOAD</span>
          </button>
          <button className="cyber-btn sm primary" onClick={handleDownload}>
            <Download size={13} />
            <span>SAVE QR IMAGE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
