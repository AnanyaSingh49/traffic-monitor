import React from 'react';
import { PieChart, Network } from 'lucide-react';
import { NetworkMetrics } from '../types/network';

interface ProtocolChartProps {
  metrics: NetworkMetrics;
}

const ProtocolChart: React.FC<ProtocolChartProps> = ({ metrics }) => {
  const protocolData = Object.entries(metrics.protocolDistribution)
    .map(([protocol, count]) => ({
      protocol,
      count,
      percentage: (count / metrics.totalPackets) * 100
    }))
    .sort((a, b) => b.count - a.count);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  const getColor = (index: number) => colors[index % colors.length];

  // Calculate pie chart segments
  let cumulativePercentage = 0;
  const segments = protocolData.map((item, index) => {
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360;
    cumulativePercentage += item.percentage;

    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const largeArcFlag = item.percentage > 50 ? 1 : 0;
    
    const x1 = 100 + 80 * Math.cos(startAngleRad);
    const y1 = 100 + 80 * Math.sin(startAngleRad);
    const x2 = 100 + 80 * Math.cos(endAngleRad);
    const y2 = 100 + 80 * Math.sin(endAngleRad);
    
    const pathData = [
      `M 100 100`,
      `L ${x1} ${y1}`,
      `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      color: getColor(index)
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Network className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Protocol Distribution</h3>
          <p className="text-sm text-gray-500">Traffic breakdown by protocol</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={segment.protocol}
                d={segment.pathData}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            
            {/* Center circle */}
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="white"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-sm font-medium fill-gray-900"
            >
              Total
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              className="text-lg font-bold fill-gray-900"
            >
              {metrics.totalPackets}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 ml-8">
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {protocolData.map((item, index) => (
              <div key={item.protocol} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getColor(index) }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {item.protocol}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {item.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {protocolData.length === 0 && (
            <div className="text-center py-8">
              <PieChart className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No protocol data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(metrics.protocolDistribution).length}
            </div>
            <div className="text-sm text-gray-500">Protocols</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {protocolData[0]?.protocol || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Most Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {protocolData[0]?.percentage.toFixed(1) || '0'}%
            </div>
            <div className="text-sm text-gray-500">Top Share</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolChart;