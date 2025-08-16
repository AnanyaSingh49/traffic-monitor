import React from 'react';
import { Activity, Shield, Network, Zap, Globe, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { NetworkMetrics } from '../types/network';

interface MetricsCardsProps {
  metrics: NetworkMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const cards = [
    {
      title: 'Packets/sec',
      value: formatNumber(metrics.packetsPerSecond),
      icon: Activity,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Bandwidth',
      value: formatBytes(metrics.bytesPerSecond) + '/s',
      icon: Zap,
      color: 'green',
      trend: '+8%'
    },
    {
      title: 'Active Connections',
      value: formatNumber(metrics.activeConnections),
      icon: Network,
      color: 'purple',
      trend: '-3%'
    },
    {
      title: 'Unique IPs',
      value: formatNumber(metrics.uniqueIps),
      icon: Globe,
      color: 'indigo',
      trend: '+15%'
    },
    {
      title: 'Threats Detected',
      value: Object.values(metrics.threatCounts).reduce((sum, count) => sum + count, 0),
      icon: Shield,
      color: 'red',
      trend: '+5%'
    },
    {
      title: 'Bandwidth Usage',
      value: `${metrics.bandwidthUtilization.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'yellow',
      trend: '+2%'
    },
    {
      title: 'Latency',
      value: `${metrics.latency.toFixed(1)}ms`,
      icon: AlertTriangle,
      color: 'orange',
      trend: '-1%'
    },
    {
      title: 'Packet Loss',
      value: `${metrics.packetLoss.toFixed(2)}%`,
      icon: Users,
      color: 'pink',
      trend: '0%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      orange: 'bg-orange-50 text-orange-600',
      pink: 'bg-pink-50 text-pink-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositiveTrend = card.trend.startsWith('+');
        const isNegativeTrend = card.trend.startsWith('-');
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                isPositiveTrend ? 'text-green-600 bg-green-50' :
                isNegativeTrend ? 'text-red-600 bg-red-50' :
                'text-gray-600 bg-gray-50'
              }`}>
                {card.trend}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;