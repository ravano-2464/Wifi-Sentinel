import { useState, useCallback } from 'react';
import { playCyberSound } from '../utils/audio';

export function useAudioFx(onToast) {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('wifi_audio_enabled') !== 'false';
  });

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      const next = !prev;
      localStorage.setItem('wifi_audio_enabled', next);
      if (onToast) onToast(next ? 'Audio FX: Enabled' : 'Audio FX: Muted');
      return next;
    });
  }, [onToast]);

  const play = useCallback((type) => {
    playCyberSound(type, audioEnabled);
  }, [audioEnabled]);

  return {
    audioEnabled,
    toggleAudio,
    play
  };
}
