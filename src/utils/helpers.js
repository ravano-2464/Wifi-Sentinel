// Helper utilities for hashing, radio generation parsing, and formatting

export function simpleHash(str) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRadioGen(radio) {
  if (!radio) return 'Wi-Fi 6';
  if (radio.includes('802.11be')) return 'Wi-Fi 7';
  if (radio.includes('802.11ax')) return 'Wi-Fi 6';
  if (radio.includes('802.11ac')) return 'Wi-Fi 5';
  if (radio.includes('802.11n')) return 'Wi-Fi 4';
  if (radio.includes('802.11g')) return 'Wi-Fi 3';
  return 'Wi-Fi';
}

export function formatTime() {
  return new Date().toTimeString().split(' ')[0];
}
