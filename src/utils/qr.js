import QRCode from 'qrcode';

export const CyberQR = {
  /**
   * Render QR Code directly to an HTML Canvas
   */
  render: async function(canvas, text, options = {}) {
    if (!canvas || !text) return;
    const size = options.size || 220;
    const darkColor = options.darkColor || '#00ff9d';
    const lightColor = options.lightColor || '#06090e';

    try {
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor
        },
        errorCorrectionLevel: 'M'
      });
    } catch (err) {
      console.error('CyberQR render error:', err);
    }
  },

  /**
   * Generate base64 Data URL for image download
   */
  toDataURL: async function(text, options = {}) {
    if (!text) return '';
    const size = options.size || 300;
    const darkColor = options.darkColor || '#00ff9d';
    const lightColor = options.lightColor || '#06090e';

    try {
      return await QRCode.toDataURL(text, {
        width: size,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor
        },
        errorCorrectionLevel: 'M'
      });
    } catch (err) {
      console.error('CyberQR toDataURL error:', err);
      return '';
    }
  },

  /**
   * Build standard ZXing Wi-Fi configuration string
   * Format: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<PASSWORD>;;
   */
  wifiPayload: function(ssid = '', password = '', authType = 'WPA') {
    let type = 'WPA';
    const authLower = (authType || '').toLowerCase();
    
    if (!password || authLower.includes('open') || authLower.includes('none')) {
      type = 'nopass';
    } else if (authLower.includes('wep')) {
      type = 'WEP';
    } else if (authLower.includes('wpa3')) {
      type = 'WPA'; // Most Android/iOS QR scanners use WPA for WPA2/WPA3
    } else {
      type = 'WPA';
    }

    // Escape special characters as per standard Wi-Fi barcode specification
    const escapeVal = (str) => String(str || '').replace(/([\\;,:"])/g, '\\$1');

    if (type === 'nopass') {
      return `WIFI:S:${escapeVal(ssid)};T:nopass;;`;
    }
    return `WIFI:S:${escapeVal(ssid)};T:${type};P:${escapeVal(password)};;`;
  }
};
