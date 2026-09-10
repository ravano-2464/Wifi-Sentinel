import { useState, useEffect, useCallback } from 'react';
import { WifiService } from '../services/wifiService';

export function useWifiTelemetry(onLog) {
  const [currentWifi, setCurrentWifi] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [nearbyNetworks, setNearbyNetworks] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFullAudit = useCallback(async () => {
    setIsRefreshing(true);
    if (onLog) onLog('TRIGGERED FULL SPECTRUM & VAULT SCAN...', 'info');

    try {
      const data = await WifiService.getFullAudit();
      setCurrentWifi(data.current);
      setProfiles(data.profiles || []);
      setNearbyNetworks(data.nearby || []);
      setError(null);
      if (onLog) onLog(`SCAN COMPLETE: Found ${data.profiles?.length || 0} stored profiles, ${data.nearby?.length || 0} live airwaves.`, 'success');
    } catch (err) {
      setError(err.message);
      if (onLog) onLog(`SCAN ERROR: ${err.message}`, 'danger');
    } finally {
      setIsRefreshing(false);
    }
  }, [onLog]);

  // Initial load + periodic live interface poller (every 2.5s)
  useEffect(() => {
    fetchFullAudit();

    const timer = setInterval(async () => {
      try {
        const current = await WifiService.getCurrentInterface();
        setCurrentWifi(current);
      } catch (e) {
        // Silently retry next tick
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [fetchFullAudit]);

  return {
    currentWifi,
    profiles,
    nearbyNetworks,
    isRefreshing,
    error,
    refreshAudit: fetchFullAudit
  };
}
