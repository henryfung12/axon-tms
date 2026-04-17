import React from 'react';
import { Fuel, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface LiveDataItem {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: 'green' | 'red' | 'blue' | 'orange';
}

export const LiveDataPanel: React.FC = () => {
  const liveData: LiveDataItem[] = [
    {
      label: 'National Avg Diesel',
      value: '$3.84/gal',
      change: 2.3,
      icon: Fuel,
      color: 'red',
    },
    {
      label: 'Load-to-Truck Ratio',
      value: '4.2:1',
      change: -5.1,
      icon: TrendingUp,
      color: 'orange',
    },
    {
      label: 'Spot Market Rate',
      value: '$2.18/mi',
      change: 1.8,
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Market Demand',
      value: 'MEDIUM',
      change: -2.1,
      icon: Clock,
      color: 'blue',
    },
  ];

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-green-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200', 
      icon: 'bg-gradient-to-r from-red-500 to-pink-500',
      text: 'text-red-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'bg-gradient-to-r from-orange-500 to-amber-500',
      text: 'text-orange-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: 'text-blue-600',
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Live Market Data</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveData.map((item, index) => {
          const Icon = item.icon;
          const isPositive = item.change > 0;
          const colors = colorClasses[item.color];

          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border rounded-xl p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(item.change)}%</span>
                </div>
              </div>
              
              <div>
                <p className="text-xl font-bold text-gray-900 mb-1">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Market Summary</p>
            <p className="text-xs text-gray-600">Based on last 24h data</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-600">Moderate Volatility</p>
            <p className="text-xs text-gray-600">Fuel costs driving rates up</p>
          </div>
        </div>
      </div>
    </div>
  );
};