// server.js
const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const WebSocket = require('ws');
const os = require('os');

// === WebSocket Server ===
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

// === Select network interface ===
const localIP = 'YOUR_LOCAL_IP'; // Replace with your machine's IP
const device = Cap.findDevice(localIP);

if (!device) {
  console.error('No device found for IP:', localIP);
  process.exit(1);
}

const c = new Cap();
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(65535);
const filter = ''; // You can add pcap filter if needed
const linkType = c.open(device, filter, bufSize, buffer);

console.log('Capturing packets on', device);

// === Packet capture ===
c.on('packet', (nbytes, trunc) => {
  try {
    const ret = decoders.Ethernet(buffer);

    if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
      const ip = decoders.IPV4(buffer, ret.offset);

      let packet = {
        timestamp: Date.now(),
        size: nbytes,
        sourceIp: ip.info.srcaddr,
        destinationIp: ip.info.dstaddr,
        protocol: ['TCP', 'UDP', 'ICMP'][ip.info.protocol - 1] || 'OTHER',
        threatLevel: 'low',      // default threat level
        threatType: null,
        country: 'Unknown',      // could integrate geoIP
        isp: 'Unknown'
      };

      // === Simple threat detection ===
      if (packet.protocol === 'TCP' && packet.destinationIp.endsWith('.1')) {
        packet.threatLevel = 'medium';
        packet.threatType = 'port_scan';
      }

      // Broadcast packet to all connected WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ packets: [packet] }));
        }
      });
    }
  } catch (err) {
    console.error('Packet decode error:', err);
  }
});

// === WebSocket connection logging ===
wss.on('connection', ws => {
  console.log('Client connected. Total clients:', wss.clients.size);
  ws.on('close', () => console.log('Client disconnected. Total clients:', wss.clients.size));
});