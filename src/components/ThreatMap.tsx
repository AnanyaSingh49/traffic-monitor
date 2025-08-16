import React, { useState } from 'react';
import { Globe, MapPin, AlertTriangle, Filter } from 'lucide-react';
import { NetworkPacket } from '../types/network';

interface ThreatMapProps {
  packets: NetworkPacket[];
}

const ThreatMap: React.FC<ThreatMapProps> = ({ packets }) => {
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string>('all');

  // Group packets by country and threat level
  const threatsByCountry = packets.reduce((acc, packet) => {
    if (!packet.country) return acc;
    
    if (!acc[packet.country]) {
      acc[packet.country] = {
        country: packet.country,
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        packets: []
      };
    }
    
    acc[packet.country].total++;
    acc[packet.country][packet.threatLevel]++;
    acc[packet.country].packets.push(packet);
    
    return acc;
  }, {} as Record<string, {
    country: string;
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    packets: NetworkPacket[];
  }>);

  const filteredThreats = Object.values(threatsByCountry).filter(threat => {
    if (selectedThreatLevel === 'all') return true;
    return threat[selectedThreatLevel as keyof typeof threat] > 0;
  }).sort((a, b) => b.total - a.total);

  const getThreatColor = (threat: any) => {
    if (threat.critical > 0) return 'bg-red-500';
    if (threat.high > 0) return 'bg-orange-500';
    if (threat.medium > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getThreatIntensity = (threat: any) => {
    const maxThreats = Math.max(...Object.values(threatsByCountry).map(t => t.total));
    return Math.max(0.3, threat.total / maxThreats);
  };

  // Mock world map coordinates for demonstration
  const countryPositions: Record<string, { x: number; y: number }> = {
    'US': { x: 150, y: 120 },
    'CN': { x: 350, y: 130 },
    'RU': { x: 320, y: 80 },
    'DE': { x: 250, y: 100 },
    'GB': { x: 230, y: 90 },
    'FR': { x: 240, y: 110 },
    'JP': { x: 380, y: 140 },
    'KR': { x: 370, y: 130 },
    'IN': { x: 320, y: 160 },
    'BR': { x: 180, y: 200 }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Global Threat Map</h3>
            <p className="text-sm text-gray-500">Geographic distribution of threats</p>
          </div>
        </div>
        
        <select
          value={selectedThreatLevel}
          onChange={(e) => setSelectedThreatLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        >
          <option value="all">All Threats</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map Visualization */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-50 rounded-lg p-4 h-64">
            <svg width="100%" height="100%" viewBox="0 0 500 250" className="overflow-visible">
              {/* Simplified world map outline */}
              <rect x="0" y="0" width="500" height="250" fill="#F9FAFB" stroke="#E5E7EB" />
              
              {/* Continents (simplified shapes) */}
              <path d="M50 80 L200 70 L220 120 L180 180 L80 190 Z" fill="#E5E7EB" opacity="0.5" />
              <path d="M220 60 L400 50 L420 100 L380 140 L240 130 Z" fill="#E5E7EB" opacity="0.5" />
              <path d="M300 140 L380 135 L390 180 L320 190 Z" fill="#E5E7EB" opacity="0.5" />
              <path d="M150 180 L200 175 L210 220 L160 230 Z" fill="#E5E7EB" opacity="0.5" />
              
              {/* Threat indicators */}
              {filteredThreats.map((threat) => {
                const position = countryPositions[threat.country];
                if (!position) return null;
                
                const intensity = getThreatIntensity(threat);
                const radius = 8 + (intensity * 12);
                
                return (
                  <g key={threat.country}>
                    {/* Pulse animation for high threats */}
                    {(threat.critical > 0 || threat.high > 0) && (
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r={radius + 5}
                        fill={getThreatColor(threat).replace('bg-', '').replace('-500', '')}
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}
                    
                    {/* Main threat indicator */}
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={radius}
                      fill={threat.critical > 0 ? '#EF4444' : 
                            threat.high > 0 ? '#F97316' :
                            threat.medium > 0 ? '#EAB308' : '#10B981'}
                      opacity={0.8}
                      className="hover:opacity-100 cursor-pointer transition-opacity"
                    />
                    
                    {/* Country label */}
                    <text
                      x={position.x}
                      y={position.y + radius + 15}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {threat.country}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-xs text-gray-600">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-xs text-gray-600">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-600">Low</span>
            </div>
          </div>
        </div>

        {/* Threat Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Top Threat Sources</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {filteredThreats.slice(0, 8).map((threat) => (
              <div key={threat.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getThreatColor(threat)}`} />
                  <div>
                    <div className="font-medium text-gray-900">{threat.country}</div>
                    <div className="text-xs text-gray-500">
                      {threat.total} threat{threat.total !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {threat.critical > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                        {threat.critical}
                      </span>
                    )}
                    {threat.high > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                        {threat.high}
                      </span>
                    )}
                    {threat.medium > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                        {threat.medium}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredThreats.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No threats detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;