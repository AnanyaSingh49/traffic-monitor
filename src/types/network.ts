export interface NetworkPacket {
  id: string;
  timestamp: number;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'FTP';
  size: number;
  flags?: string[];
  payload?: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatType?: 'port_scan' | 'ddos' | 'malware' | 'suspicious_traffic' | 'brute_force' | 'data_exfiltration';
  country?: string;
  isp?: string;
}

export interface NetworkMetrics {
  totalPackets: number;
  totalBytes: number;
  packetsPerSecond: number;
  bytesPerSecond: number;
  activeConnections: number;
  uniqueIps: number;
  protocolDistribution: Record<string, number>;
  threatCounts: Record<string, number>;
  topTalkers: Array<{
    ip: string;
    packets: number;
    bytes: number;
    country?: string;
  }>;
  bandwidthUtilization: number;
  latency: number;
  packetLoss: number;
}

export interface ThreatAlert {
  id: string;
  timestamp: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp: string;
  destinationIp: string;
  description: string;
  recommendation: string;
  packets: NetworkPacket[];
}

export interface NetworkInterface {
  name: string;
  ip: string;
  status: 'active' | 'inactive';
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
}