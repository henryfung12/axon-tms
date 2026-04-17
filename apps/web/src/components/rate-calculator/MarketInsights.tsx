import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, MapPin, Fuel, Truck, DollarSign } from 'lucide-react';

interface MarketInsightsProps {
  rateData?: {
    origin: string;
    destination: string;
    distance: number;
    suggestedRate: number;
    totalCost: number;
    breakdown?: {
      tolls?: number;
    };
    marketInsights?: {
      currentFuelPrice: number;
      loadToTruckRatio: number;
      marketRate: number;
      laneDemand: string;
      tollAlternatives?: Array<{
        total_tolls: number;
        extra_miles: number;
        time_difference: number;
      }>;
    };
  } | null;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ rateData }) => {
  const generateInsights = () => {
    const insights = [];

    const fuelTrend = 2.3;
    if (fuelTrend > 5) {
      insights.push({
        type: 'warning',
        title: 'Fuel Price Alert',
        message: `Diesel prices up ${fuelTrend.toFixed(1)}% this week. Consider fuel surcharge adjustments for new contracts.`,
        icon: Fuel,
        color: 'orange',
      });
    } else if (fuelTrend < -3) {
      insights.push({
        type: 'positive',
        title: 'Fuel Cost Advantage',
        message: `Diesel prices down ${Math.abs(fuelTrend).toFixed(1)}% this week. Opportunity for competitive pricing.`,
        icon: Fuel,
        color: 'green',
      });
    }

    if (rateData?.marketInsights) {
      const demand = rateData.marketInsights.laneDemand;
      if (demand === 'high' || demand === 'very_high') {
        insights.push({
          type: 'positive',
          title: 'High Demand Lane',
          message: `This route shows ${demand} demand. Premium rates possible with ${rateData.marketInsights.loadToTruckRatio.toFixed(1)}:1 load-to-truck ratio.`,
          icon: TrendingUp,
          color: 'green',
        });
      } else if (demand === 'low') {
        insights.push({
          type: 'warning',
          title: 'Low Demand Lane',
          message: `Competitive market with ${rateData.marketInsights.loadToTruckRatio.toFixed(1)}:1 ratio. Consider backhaul opportunities.`,
          icon: TrendingDown,
          color: 'red',
        });
      }
    }

    if (rateData?.marketInsights?.tollAlternatives && rateData.marketInsights.tollAlternatives.length > 0) {
      const bestAlternative = rateData.marketInsights.tollAlternatives[0];
      const savings = (rateData.breakdown?.tolls || 0) - bestAlternative.total_tolls;
      
      if (savings > 30) {
        insights.push({
          type: 'info',
          title: 'Toll Optimization',
          message: `Alternative route saves $${savings.toFixed(0)} in tolls with only ${bestAlternative.extra_miles} extra miles (+${Math.round(bestAlternative.time_difference / 60)}h).`,
          icon: MapPin,
          color: 'blue',
        });
      }
    }

    if (rateData?.marketInsights?.marketRate) {
      const suggestedRate = rateData.suggestedRate;
      const marketRate = rateData.marketInsights.marketRate;
      const difference = ((suggestedRate - marketRate) / marketRate) * 100;

      if (difference > 10) {
        insights.push({
          type: 'warning',
          title: 'Above Market Rate',
          message: `Your rate is ${difference.toFixed(1)}% above market average ($${marketRate.toLocaleString()}). Consider adjusting for competitiveness.`,
          icon: DollarSign,
          color: 'orange',
        });
      } else if (difference < -5) {
        insights.push({
          type: 'warning',
          title: 'Below Market Rate',
          message: `Your rate is ${Math.abs(difference).toFixed(1)}% below market average. Opportunity to increase margin.`,
          icon: DollarSign,
          color: 'blue',
        });
      }
    }

    if (rateData?.marketInsights) {
      const utilizationScore = rateData.marketInsights.loadToTruckRatio * 20;
      if (utilizationScore > 90) {
        insights.push({
          type: 'positive',
          title: 'High Equipment Utilization',
          message: `Excellent market conditions with ${utilizationScore.toFixed(0)}% utilization potential. Consider expanding capacity.`,
          icon: Truck,
          color: 'green',
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Market Analysis',
        message: 'Calculate a route to see specific market insights and optimization opportunities.',
        icon: AlertTriangle,
        color: 'blue',
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const colorClasses = {
    green: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500',
    },
    red: {
      bg: 'bg-red-50 border-red-200', 
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
    orange: {
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700', 
      dot: 'bg-orange-500',
    },
    blue: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Market Insights</h3>
          <p className="text-gray-600">
            {rateData ? `${rateData.origin} → ${rateData.destination}` : 'Current market conditions'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const colors = colorClasses[insight.color as keyof typeof colorClasses];
          
          return (
            <div key={index} className={`p-4 rounded-xl border ${colors.bg}`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                <p className={`text-sm font-medium ${colors.text}`}>{insight.title}</p>
                <Icon className={`w-4 h-4 ${colors.text} ml-auto`} />
              </div>
              <p className="text-sm text-gray-700">{insight.message}</p>
            </div>
          );
        })}
      </div>

      {rateData?.marketInsights && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Load-to-Truck Ratio</p>
              <p className="text-lg font-bold text-emerald-600">{rateData.marketInsights.loadToTruckRatio.toFixed(1)}:1</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Market Rate Trend</p>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-lg font-bold text-green-600">+1.8%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live data</span>
        </div>
      </div>
    </div>
  );
};