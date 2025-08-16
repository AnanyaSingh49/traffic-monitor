import { NetworkPacket, NetworkMetrics, ThreatAlert, NetworkInterface } from '../types/network';

const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'FTP', 'ICMP'] as const;
const THREAT_TYPES = ['port_scan', 'ddos', 'malware', 'suspicious_traffic', 'brute_force', 'data_exfiltration'] as const;
const COUNTRIES = ['US', 'CN', 'RU', 'DE', 'GB', 'FR', 'JP', 'KR', 'IN', 'BR'];
const ISPS = ['Cloudflare', 'Amazon AWS', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean', 'Akamai'];

class NetworkSimulator {
  private packets: NetworkPacket[] = [];
  private alerts: ThreatAlert[] = [];
  private interfaces: NetworkInterface[] = [
    { name: 'eth0', ip: '192.168.1.100', status: 'active', bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
    { name: 'wlan0', ip: '10.0.0.50', status: 'active', bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
    { name: 'lo', ip: '127.0.0.1', status: 'active', bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 }
  ];
  private startTime = Date.now();

  private generateRandomIp(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  private generatePort(): number {
    const commonPorts = [80, 443, 22, 21, 25, 53, 110, 143, 993, 995, 3389, 5432, 3306];
    return Math.random() < 0.7 ? commonPorts[Math.floor(Math.random() * commonPorts.length)] : Math.floor(Math.random() * 65535);
  }

  private detectThreat(packet: NetworkPacket): { level: NetworkPacket['threatLevel'], type?: NetworkPacket['threatType'] } {
    // Simulate threat detection logic
    if (packet.destinationPort === 22 && Math.random() < 0.1) {
      return { level: 'high', type: 'brute_force' };
    }
    if (packet.protocol === 'ICMP' && packet.size > 1000) {
      return { level: 'medium', type: 'ddos' };
    }
    if (packet.sourcePort < 1024 && packet.destinationPort < 1024 && Math.random() < 0.05) {
      return { level: 'critical', type: 'malware' };
    }
    if (packet.size > 5000 && Math.random() < 0.08) {
      return { level: 'medium', type: 'data_exfiltration' };
    }
    if (Math.random() < 0.02) {
      return { level: 'low', type: 'suspicious_traffic' };
    }
    return { level: 'low' };
  }

  private generatePacket(): NetworkPacket {
    const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
    const sourceIp = this.generateRandomIp();
    const destinationIp = this.generateRandomIp();
    const sourcePort = this.generatePort();
    const destinationPort = this.generatePort();
    const size = Math.floor(Math.random() * 8192) + 64;
    
    const packet: NetworkPacket = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sourceIp,
      destinationIp,
      sourcePort,
      destinationPort,
      protocol,
      size,
      country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
      isp: ISPS[Math.floor(Math.random() * ISPS.length)],
      threatLevel: 'low'
    };

    const threat = this.detectThreat(packet);
    packet.threatLevel = threat.level;
    packet.threatType = threat.type;

    if (protocol === 'TCP') {
      packet.flags = ['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'].filter(() => Math.random() < 0.3);
    }

    return packet;
  }

  private generateAlert(packets: NetworkPacket[]): ThreatAlert | null {
    const highThreatPackets = packets.filter(p => p.threatLevel === 'high' || p.threatLevel === 'critical');
    if (highThreatPackets.length === 0) return null;

    const packet = highThreatPackets[0];
    const alertDescriptions = {
      port_scan: `Port scanning detected from ${packet.sourceIp}`,
      ddos: `Potential DDoS attack detected targeting ${packet.destinationIp}`,
      malware: `Malware communication detected between ${packet.sourceIp} and ${packet.destinationIp}`,
      suspicious_traffic: `Suspicious traffic pattern detected from ${packet.sourceIp}`,
      brute_force: `Brute force attack detected against ${packet.destinationIp}:${packet.destinationPort}`,
      data_exfiltration: `Potential data exfiltration detected from ${packet.sourceIp}`
    };

    const recommendations = {
      port_scan: 'Block source IP and monitor for additional scanning attempts',
      ddos: 'Implement rate limiting and consider DDoS protection services',
      malware: 'Isolate affected systems and run full antivirus scan',
      suspicious_traffic: 'Monitor traffic patterns and consider blocking if confirmed malicious',
      brute_force: 'Implement account lockout policies and consider IP blocking',
      data_exfiltration: 'Review data access logs and implement data loss prevention measures'
    };

    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: packet.threatType || 'unknown',
      severity: packet.threatLevel,
      sourceIp: packet.sourceIp,
      destinationIp: packet.destinationIp,
      description: alertDescriptions[packet.threatType as keyof typeof alertDescriptions] || 'Unknown threat detected',
      recommendation: recommendations[packet.threatType as keyof typeof recommendations] || 'Investigate further',
      packets: [packet]
    };
  }

  generateTraffic(): { packets: NetworkPacket[], metrics: NetworkMetrics, alerts: ThreatAlert[], interfaces: NetworkInterface[] } {
    // Generate 5-15 new packets
    const newPackets = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => this.generatePacket());
    
    // Add to packet history (keep last 1000 packets)
    this.packets.push(...newPackets);
    if (this.packets.length > 1000) {
      this.packets = this.packets.slice(-1000);
    }

    // Generate alerts for high-threat packets
    const newAlert = this.generateAlert(newPackets);
    if (newAlert) {
      this.alerts.push(newAlert);
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(-50);
      }
    }

    // Update interface statistics
    this.interfaces.forEach(iface => {
      const interfacePackets = newPackets.filter(() => Math.random() < 0.3);
      iface.packetsIn += interfacePackets.length;
      iface.packetsOut += Math.floor(interfacePackets.length * 0.8);
      iface.bytesIn += interfacePackets.reduce((sum, p) => sum + p.size, 0);
      iface.bytesOut += Math.floor(iface.bytesIn * 0.9);
    });

    // Calculate metrics
    const now = Date.now();
    const timeWindow = 60000; // 1 minute
    const recentPackets = this.packets.filter(p => now - p.timestamp < timeWindow);
    
    const protocolDistribution: Record<string, number> = {};
    const threatCounts: Record<string, number> = {};
    const ipCounts: Record<string, { packets: number, bytes: number, country?: string }> = {};

    recentPackets.forEach(packet => {
      protocolDistribution[packet.protocol] = (protocolDistribution[packet.protocol] || 0) + 1;
      if (packet.threatType) {
        threatCounts[packet.threatType] = (threatCounts[packet.threatType] || 0) + 1;
      }
      
      if (!ipCounts[packet.sourceIp]) {
        ipCounts[packet.sourceIp] = { packets: 0, bytes: 0, country: packet.country };
      }
      ipCounts[packet.sourceIp].packets++;
      ipCounts[packet.sourceIp].bytes += packet.size;
    });

    const topTalkers = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b.bytes - a.bytes)
      .slice(0, 10)
      .map(([ip, data]) => ({ ip, ...data }));

    const totalBytes = recentPackets.reduce((sum, p) => sum + p.size, 0);
    const uniqueIps = new Set(recentPackets.map(p => p.sourceIp)).size;

    const metrics: NetworkMetrics = {
      totalPackets: this.packets.length,
      totalBytes: this.packets.reduce((sum, p) => sum + p.size, 0),
      packetsPerSecond: Math.round(recentPackets.length / 60),
      bytesPerSecond: Math.round(totalBytes / 60),
      activeConnections: Math.floor(Math.random() * 500) + 100,
      uniqueIps,
      protocolDistribution,
      threatCounts,
      topTalkers,
      bandwidthUtilization: Math.min(95, Math.random() * 80 + 10),
      latency: Math.random() * 50 + 5,
      packetLoss: Math.random() * 2
    };

    return {
      packets: this.packets.slice(-100), // Return last 100 packets
      metrics,
      alerts: this.alerts.slice(-10), // Return last 10 alerts
      interfaces: this.interfaces
    };
  }
}

export const networkSimulator = new NetworkSimulator();