import React from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfitabilityAnalysisProps {
  data: {
    totalCost: number;
    suggestedRate: number;
    profitMargin: number;
    distance: number;
  } | null;
}

export const ProfitabilityAnalysis: React.FC<ProfitabilityAnalysisProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Calculate a route to see profitability analysis</p>
        </div>
      </div>
    );
  }

  const marginScenarios = [
    {
      margin: 10,
      label: 'Conservative',
      description: 'Safe margin for competitive lanes',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      rate: data.totalCost * 1.1,
      profit: data.totalCost * 0.1,
    },
    {
      margin: 15,
      label: 'Recommended',
      description: 'Standard industry margin',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      rate: data.totalCost * 1.15,
      profit: data.totalCost * 0.15,
    },
    {
      margin: 20,
      label: 'Aggressive',
      description: 'High demand lanes only',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      rate: data.totalCost * 1.2,
      profit: data.totalCost * 0.2,
    },
    {
      margin: 25,
      label: 'Premium',
      description: 'Specialized/expedited loads',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50 border-purple-200',
      rate: data.totalCost * 1.25,
      profit: data.totalCost * 0.25,
    },
  ];

  const breakEvenAnalysis = {
    costPerMile: data.totalCost / data.distance,
    minimumRate: data.totalCost,
    recommendedRate: data.suggestedRate,
    competitiveRange: {
      low: data.totalCost * 1.08,
      high: data.totalCost * 1.18,
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profitability Analysis</h3>
          <p className="text-gray-600">Margin scenarios & break-even analysis</p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Break-Even Analysis</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Minimum Rate</p>
            <p className="text-lg font-bold text-gray-900">${breakEvenAnalysis.minimumRate.toLocaleString()}</p>
            <p className="text-xs text-gray-600">0% profit margin</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Cost Per Mile</p>
            <p className="text-lg font-bold text-gray-900">${breakEvenAnalysis.costPerMile.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Total cost basis</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">Competitive Range</p>
          </div>
          <p className="text-sm text-amber-800">
            Market rates typically range ${breakEvenAnalysis.competitiveRange.low.toLocaleString()} - ${breakEvenAnalysis.competitiveRange.high.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">Margin Scenarios</h4>
        
        {marginScenarios.map((scenario, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${scenario.bgColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                  <span className={`text-sm font-bold ${scenario.color}`}>{scenario.margin}%</span>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${scenario.color}`}>{scenario.label}</p>
                  <p className="text-xs text-gray-600">{scenario.description}</p>
                </div>
              </div>
              
              {scenario.margin === 15 && (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Quote Rate</p>
                <p className="text-lg font-bold text-gray-900">${scenario.rate.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Profit</p>
                <p className="text-lg font-bold text-gray-900">${scenario.profit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Per Mile</p>
                <p className="text-lg font-bold text-gray-900">${(scenario.rate / data.distance).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Risk Assessment</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Fuel price volatility</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-orange-500 rounded-full"></div>
              </div>
              <span className="text-xs text-orange-600">High</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Market competition</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-yellow-500 rounded-full"></div>
              </div>
              <span className="text-xs text-yellow-600">Medium</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Lane demand</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs text-green-600">Strong</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};