import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, Network, Zap, Globe, Server, Eye } from 'lucide-react';
import { NetworkPacket, NetworkMetrics, ThreatAlert, NetworkInterface } from '../types/network';
import { networkSimulator } from '../utils/networkSimulator';
import PacketTable from './PacketTable';
import ThreatAlerts from './ThreatAlerts';
import MetricsCards from './MetricsCards';
import TrafficChart from './TrafficChart';
import ProtocolChart from './ProtocolChart';
import ThreatMap from './ThreatMap';
import InterfaceStatus from './InterfaceStatus';

const NetworkDashboard: React.FC = () => {
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'packets' | 'threats' | 'interfaces'>('overview');

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const data = networkSimulator.generateTraffic();
      setPackets(data.packets);
      setMetrics(data.metrics);
      setAlerts(data.alerts);
      setInterfaces(data.interfaces);
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'packets', label: 'Packets', icon: Network },
    { id: 'threats', label: 'Threats', icon: Shield },
    { id: 'interfaces', label: 'Interfaces', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Network Monitor</h1>
                <p className="text-sm text-gray-500">Real-time traffic analysis & threat detection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </span>
              </div>
              
              <button
                onClick={toggleMonitoring}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMonitoring 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? 'Stop' : 'Start'} Monitoring
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            {metrics && <MetricsCards metrics={metrics} />}
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics && <TrafficChart metrics={metrics} />}
              {metrics && <ProtocolChart metrics={metrics} />}
            </div>
            
            {/* Threat Map and Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ThreatMap packets={packets} />
              </div>
              <div>
                <ThreatAlerts alerts={alerts.slice(0, 5)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packets' && (
          <PacketTable packets={packets} />
        )}

        {activeTab === 'threats' && (
          <ThreatAlerts alerts={alerts} showAll />
        )}

        {activeTab === 'interfaces' && (
          <InterfaceStatus interfaces={interfaces} />
        )}
      </div>
    </div>
  );
};

export default NetworkDashboard;