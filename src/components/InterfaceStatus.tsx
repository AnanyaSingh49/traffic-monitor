import React from 'react';
import { Server, Wifi, Activity, ArrowUp, ArrowDown, Circle } from 'lucide-react';
import { NetworkInterface } from '../types/network';

interface InterfaceStatusProps {
  interfaces: NetworkInterface[];
}

const InterfaceStatus: React.FC<InterfaceStatusProps> = ({ interfaces }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getInterfaceIcon = (name: string) => {
    if (name.includes('wlan') || name.includes('wifi')) {
      return <Wifi className="w-5 h-5" />;
    }
    return <Server className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (status: string) => {
    return status === 'active' ? 'bg-green-50' : 'bg-red-50';
  };

  const getTotalTraffic = (iface: NetworkInterface) => {
    return iface.bytesIn + iface.bytesOut;
  };

  const getUtilization = (iface: NetworkInterface) => {
    // Mock utilization calculation (in real scenario, this would be based on interface capacity)
    const totalBytes = getTotalTraffic(iface);
    const maxCapacity = 1000000000; // 1GB mock capacity
    return Math.min(100, (totalBytes / maxCapacity) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Server className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Network Interfaces</h2>
            <p className="text-sm text-gray-500">Monitor interface status and traffic statistics</p>
          </div>
        </div>
      </div>

      {/* Interface Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {interfaces.map((iface) => (
          <div key={iface.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Interface Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusBg(iface.status)}`}>
                  {getInterfaceIcon(iface.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{iface.name}</h3>
                  <p className="text-sm text-gray-500">{iface.ip}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Circle className={`w-3 h-3 ${getStatusColor(iface.status)} ${iface.status === 'active' ? 'animate-pulse' : ''}`} fill="currentColor" />
                <span className={`text-sm font-medium ${getStatusColor(iface.status)}`}>
                  {iface.status.charAt(0).toUpperCase() + iface.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Traffic Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowDown className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Incoming</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-blue-900">
                    {formatBytes(iface.bytesIn)}
                  </div>
                  <div className="text-sm text-blue-700">
                    {iface.packetsIn.toLocaleString()} packets
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Outgoing</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-green-900">
                    {formatBytes(iface.bytesOut)}
                  </div>
                  <div className="text-sm text-green-700">
                    {iface.packetsOut.toLocaleString()} packets
                  </div>
                </div>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Utilization</span>
                <span className="text-sm text-gray-500">{getUtilization(iface).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getUtilization(iface) > 80 ? 'bg-red-500' :
                    getUtilization(iface) > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${getUtilization(iface)}%` }}
                />
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatBytes(getTotalTraffic(iface))}
                </div>
                <div className="text-xs text-gray-500">Total Traffic</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {(iface.packetsIn + iface.packetsOut).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Total Packets</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(Math.random() * 50 + 10)}ms
                </div>
                <div className="text-xs text-gray-500">Latency</div>
              </div>
            </div>

            {/* Interface Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View Details
              </button>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                  Reset Stats
                </button>
                <button className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  iface.status === 'active' 
                    ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                }`}>
                  {iface.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {interfaces.filter(i => i.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active Interfaces</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(interfaces.reduce((sum, i) => sum + i.bytesIn + i.bytesOut, 0))}
            </div>
            <div className="text-sm text-gray-500">Total Traffic</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {interfaces.reduce((sum, i) => sum + i.packetsIn + i.packetsOut, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Packets</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {(interfaces.reduce((sum, i) => sum + getUtilization(i), 0) / interfaces.length).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Avg Utilization</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterfaceStatus;