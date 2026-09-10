// Export service for generating JSON, CSV, and TXT cyber reports

function triggerDownload(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const ExportService = {
  exportToJson(profiles, currentWifi) {
    const data = {
      timestamp: new Date().toISOString(),
      activeConnection: currentWifi,
      totalSavedProfiles: profiles.length,
      profiles
    };
    const fileName = `wifi_vault_${Date.now()}.json`;
    triggerDownload(JSON.stringify(data, null, 2), fileName, 'application/json');
    return fileName;
  },

  exportToCsv(profiles) {
    let csv = 'SSID,Password,Authentication,Cipher,ConnectionMode,RadioType\n';
    profiles.forEach(p => {
      csv += `"${p.ssid.replace(/"/g, '""')}","${p.password.replace(/"/g, '""')}","${p.authentication}","${p.cipher}","${p.connectionMode}","${p.radioType}"\n`;
    });
    const fileName = `wifi_passwords_${Date.now()}.csv`;
    triggerDownload(csv, fileName, 'text/csv');
    return fileName;
  },

  exportToTxt(profiles) {
    let txt = `==================================================================\n`;
    txt += `  CYBER//WIFI-SENTINEL - EXTRACTED WI-FI CREDENTIALS REPORT\n`;
    txt += `  Export Date: ${new Date().toLocaleString()}\n`;
    txt += `  Total Profiles: ${profiles.length}\n`;
    txt += `==================================================================\n\n`;

    profiles.forEach((p, idx) => {
      txt += `[${idx + 1}] SSID: ${p.ssid}\n`;
      txt += `    PASSWORD       : ${p.password}\n`;
      txt += `    SECURITY       : ${p.authentication}\n`;
      txt += `    CIPHER         : ${p.cipher}\n`;
      txt += `    RADIO / MODE   : ${p.radioType} // ${p.connectionMode}\n`;
      txt += `------------------------------------------------------------------\n`;
    });
    const fileName = `wifi_credentials_report_${Date.now()}.txt`;
    triggerDownload(txt, fileName, 'text/plain');
    return fileName;
  }
};
