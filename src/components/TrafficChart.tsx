import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { NetworkMetrics } from '../types/network';

interface TrafficChartProps {
  metrics: NetworkMetrics;
}

interface DataPoint {
  timestamp: number;
  packets: number;
  bytes: number;
}

const TrafficChart: React.FC<TrafficChartProps> = ({ metrics }) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [viewMode, setViewMode] = useState<'packets' | 'bytes'>('packets');

  useEffect(() => {
    const newPoint: DataPoint = {
      timestamp: Date.now(),
      packets: metrics.packetsPerSecond,
      bytes: metrics.bytesPerSecond
    };

    setDataPoints(prev => {
      const updated = [...prev, newPoint];
      return updated.slice(-30); // Keep last 30 data points
    });
  }, [metrics]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getMaxValue = () => {
    if (dataPoints.length === 0) return 100;
    const values = dataPoints.map(point => viewMode === 'packets' ? point.packets : point.bytes);
    return Math.max(...values, 100);
  };

  const getChartPath = () => {
    if (dataPoints.length < 2) return '';
    
    const maxValue = getMaxValue();
    const width = 400;
    const height = 200;
    const padding = 20;
    
    const points = dataPoints.map((point, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * (width - 2 * padding);
      const value = viewMode === 'packets' ? point.packets : point.bytes;
      const y = height - padding - (value / maxValue) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const getGradientPath = () => {
    if (dataPoints.length < 2) return '';
    
    const maxValue = getMaxValue();
    const width = 400;
    const height = 200;
    const padding = 20;
    
    const points = dataPoints.map((point, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * (width - 2 * padding);
      const value = viewMode === 'packets' ? point.packets : point.bytes;
      const y = height - padding - (value / maxValue) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const lastX = lastPoint.split(',')[0];
    
    return `M ${firstPoint} L ${points.slice(1).join(' L ')} L ${lastX},${height - padding} L ${padding},${height - padding} Z`;
  };

  const getCurrentValue = () => {
    if (dataPoints.length === 0) return '0';
    const latest = dataPoints[dataPoints.length - 1];
    const value = viewMode === 'packets' ? latest.packets : latest.bytes;
    return viewMode === 'packets' ? value.toString() : formatBytes(value);
  };

  const getChangePercentage = () => {
    if (dataPoints.length < 2) return 0;
    const current = dataPoints[dataPoints.length - 1];
    const previous = dataPoints[dataPoints.length - 2];
    const currentValue = viewMode === 'packets' ? current.packets : current.bytes;
    const previousValue = viewMode === 'packets' ? previous.packets : previous.bytes;
    
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const changePercentage = getChangePercentage();
  const isPositive = changePercentage > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Traffic Analysis</h3>
            <p className="text-sm text-gray-500">Real-time network activity</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('packets')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'packets' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Packets
          </button>
          <button
            onClick={() => setViewMode('bytes')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'bytes' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bytes
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-gray-900">
            {getCurrentValue()}
            <span className="text-lg font-normal text-gray-500 ml-1">
              {viewMode === 'packets' ? '/sec' : '/sec'}
            </span>
          </div>
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${!isPositive ? 'rotate-180' : ''}`} />
            <span>{Math.abs(changePercentage).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" height="200" viewBox="0 0 400 200" className="overflow-visible">
          <defs>
            <linearGradient id="trafficGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="20"
              y1={20 + i * 40}
              x2="380"
              y2={20 + i * 40}
              stroke="#F3F4F6"
              strokeWidth="1"
            />
          ))}
          
          {/* Area fill */}
          {dataPoints.length > 1 && (
            <path
              d={getGradientPath()}
              fill="url(#trafficGradient)"
            />
          )}
          
          {/* Line */}
          {dataPoints.length > 1 && (
            <path
              d={getChartPath()}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Data points */}
          {dataPoints.map((point, index) => {
            const maxValue = getMaxValue();
            const x = 20 + (index / (dataPoints.length - 1)) * 360;
            const value = viewMode === 'packets' ? point.packets : point.bytes;
            const y = 180 - (value / maxValue) * 160;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3B82F6"
                className="hover:r-4 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-5">
          {[4, 3, 2, 1, 0].map(i => {
            const value = (getMaxValue() / 4) * i;
            return (
              <span key={i}>
                {viewMode === 'packets' ? Math.round(value) : formatBytes(value)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrafficChart;