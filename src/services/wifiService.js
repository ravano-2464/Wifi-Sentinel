// Wi-Fi Telemetry & Netsh API service layer

export const WifiService = {
  async getFullAudit() {
    const res = await fetch('/api/wifi/full-audit');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async getCurrentInterface() {
    const res = await fetch('/api/wifi/current');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async getSavedProfiles() {
    const res = await fetch('/api/wifi/profiles');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async getNearbyNetworks() {
    const res = await fetch('/api/wifi/scan');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }
};
