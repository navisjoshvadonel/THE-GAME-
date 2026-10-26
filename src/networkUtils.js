const os = require('os');

/**
 * Get all active local IPv4 addresses to display in the console banner
 * and help the host know which URL to share with students.
 * Prioritizes active Wi-Fi and real physical network interfaces over virtual adapters.
 */
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  // 1. Allow manual override via HOST_IP environment variable
  if (process.env.HOST_IP && process.env.HOST_IP.trim()) {
    addresses.push({
      interface: 'Custom Host IP (Environment Override)',
      address: process.env.HOST_IP.trim()
    });
  }

  const detected = [];

  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    for (const iface of interfaces[name]) {
      // Skip internal (127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        // Skip link-local autoconfiguration addresses (169.254.x.x)
        if (iface.address.startsWith('169.254.')) continue;

        const isVirtual = lowerName.includes('virtualbox') || 
                          lowerName.includes('vmware') || 
                          lowerName.includes('vethernet') ||
                          lowerName.includes('wsl') ||
                          iface.address.startsWith('192.168.56.'); // Common VirtualBox host-only subnet
        
        const isWifi = lowerName.includes('wi-fi') || lowerName.includes('wireless') || lowerName.includes('wlan');
        const isEthernet = lowerName.includes('ethernet') || lowerName.includes('eth') || lowerName.includes('local area connection') || lowerName.includes('lan');

        detected.push({
          interface: name,
          address: iface.address,
          isWifi,
          isEthernet,
          isVirtual
        });
      }
    }
  }

  // Sort real physical Ethernet and Wi-Fi first, then other real adapters, virtual adapters last
  detected.sort((a, b) => {
    if (a.isVirtual !== b.isVirtual) return a.isVirtual ? 1 : -1;
    const aPhysical = a.isEthernet || a.isWifi;
    const bPhysical = b.isEthernet || b.isWifi;
    if (aPhysical !== bPhysical) return aPhysical ? -1 : 1;
    return 0;
  });

  detected.forEach(d => {
    if (!addresses.some(a => a.address === d.address)) {
      let label = d.interface;
      if (d.isEthernet) label = `${d.interface} (Lab LAN / Ethernet Switch)`;
      else if (d.isWifi) label = `${d.interface} (Wi-Fi / Campus Wireless)`;
      else if (d.isVirtual) label = `${d.interface} [Virtual Adapter]`;

      addresses.push({
        interface: label,
        address: d.address
      });
    }
  });

  return addresses;
}

function printServerBanner(port, adminPassword) {
  const ips = getLocalIpAddresses();
  const primaryIp = ips.length > 0 ? ips[0].address : 'localhost';

  console.log('\n' + '='.repeat(68));
  console.log('   CAMPUS LAN TEAM PUZZLE GAME SERVER — ACTIVATED');
  console.log('='.repeat(68));
  console.log('  Mode: 100% Offline LAN / Wi-Fi Multiplayer (No Internet Needed)');
  console.log('  Transport: WebSocket only (Zero long-polling overhead)');
  console.log('-'.repeat(68));
  console.log('  STUDENT ACCESS URL:');
  if (ips.length > 0) {
    ips.forEach((ip, idx) => {
      const isPrimary = idx === 0 ? '  ★ RECOMMENDED' : '';
      console.log(`    -> http://${ip.address}:${port}   (${ip.interface})${isPrimary}`);
    });
  } else {
    console.log(`    -> http://localhost:${port}`);
  }
  console.log('\n  HOST / PROJECTOR DISPLAY URL (Low-GPU Leaderboard & Timer):');
  console.log(`    -> http://${primaryIp}:${port}/display`);
  console.log('\n  ADMIN CONTROL PANEL:');
  console.log(`    -> http://${primaryIp}:${port}/admin`);
  console.log(`    Admin Secret Password: ${adminPassword}`);
  console.log('-'.repeat(68));
  console.log('  IMPORTANT PRE-EVENT CHECKS:');
  console.log('  1. Ensure Windows Firewall allows incoming connections on port ' + port);
  console.log('  2. Confirm College WiFi / Firewall router does not block AP/client isolation.');
  console.log('='.repeat(68) + '\n');
}

module.exports = {
  getLocalIpAddresses,
  printServerBanner
};
