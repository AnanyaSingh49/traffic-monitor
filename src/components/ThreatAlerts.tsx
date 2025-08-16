import React from 'react';
import { AlertTriangle, Shield, Clock, MapPin, ChevronRight } from 'lucide-react';
import { ThreatAlert } from '../types/network';

interface ThreatAlertsProps {
  alerts: ThreatAlert[];
  showAll?: boolean;
}

const ThreatAlerts: React.FC<ThreatAlertsProps> = ({ alerts, showAll = false }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <Shield className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const displayAlerts = showAll ? alerts : alerts.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {showAll ? 'All Threat Alerts' : 'Recent Threats'}
              </h2>
              <p className="text-sm text-gray-500">
                {alerts.length} active alerts
              </p>
            </div>
          </div>
          
          {!showAll && alerts.length > 5 && (
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {displayAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No threats detected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your network is secure. Keep monitoring for potential threats.
            </p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {alert.description}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{alert.sourceIp} → {alert.destinationIp}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {alert.packets.length} packet{alert.packets.length !== 1 ? 's' : ''} involved
                    </div>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreatAlerts;