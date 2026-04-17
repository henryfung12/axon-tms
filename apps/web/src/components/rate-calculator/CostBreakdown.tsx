import React from 'react';
import { Fuel, User, CreditCard, Shield, Wrench, Building, DollarSign, TrendingUp, AlertTriangle, Award, Target, MapPin } from 'lucide-react';

interface CostBreakdownProps {
  data: {
    distance: number;
    driveTime: number;
    equipmentType: string;
    fuelMpg: number;
    driverPayPerMile: number;
    targetMargin: number;
    tollCost: number;
    fuelCost: number;
    origin: string;
    destination: string;
  };
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ data }) => {
  const currentFuelPrice = 3.84;
  
  // Calculate costs
  const costs = {
    fuel: data.fuelCost || (data.distance / data.fuelMpg) * currentFuelPrice,
    driver: data.distance * data.driverPayPerMile,
    tolls: data.tollCost || (data.distance * 0.05),
    insurance: data.distance * 0.12,
    equipment: data.distance * 0.18,
    overhead: data.distance * 0.08,
  };

  const equipmentMultipliers = {
    dry_van: { insurance: 1.0, equipment: 1.0 },
    refrigerated: { insurance: 1.2, equipment: 1.3 },
    flatbed: { insurance: 1.1, equipment: 1.1 },
    step_deck: { insurance: 1.4, equipment: 1.5 }
  };

  const equipmentConfig = equipmentMultipliers[data.equipmentType as keyof typeof equipmentMultipliers] || equipmentMultipliers.dry_van;
  
  const adjustedCosts = {
    ...costs,
    insurance: costs.insurance * equipmentConfig.insurance,
    equipment: costs.equipment * equipmentConfig.equipment,
  };

  const adjustedTotal = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);
  const adjustedSuggestedRate = adjustedTotal / (1 - data.targetMargin / 100);
  const marginPerMile = (adjustedSuggestedRate - adjustedTotal) / data.distance;

  const marketRateRange = {
    low: adjustedSuggestedRate * 0.92,
    high: adjustedSuggestedRate * 1.18,
  };

  return (
    <div className="space-y-4">
      {/* ULTRA COMPACT Header - Thin status bar style */}
      <div className="bg-white rounded px-3 py-1 border border-gray-200 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-900 font-medium">{data.distance} miles</span>
          <span className="text-gray-900 font-medium">${adjustedSuggestedRate.toFixed(0)} rate</span>
          <span className="text-gray-900 font-medium">${marginPerMile.toFixed(2)}/mile profit</span>
          <span className="text-gray-900 font-medium">{data.targetMargin}% margin</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Cost Breakdown (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Cost Breakdown</h3>
          
          {/* Cost Items with MUCH SMALLER TEXT */}
          <div className="space-y-3 mb-6">
            {/* Fuel */}
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Fuel className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Fuel Costs</div>
                  <div className="text-xs text-gray-600">{((adjustedCosts.fuel / adjustedTotal) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">${adjustedCosts.fuel.toFixed(0)}</div>
            </div>

            {/* Driver */}
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Driver Pay</div>
                  <div className="text-xs text-gray-600">{((adjustedCosts.driver / adjustedTotal) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">${adjustedCosts.driver.toFixed(0)}</div>
            </div>

            {/* Equipment */}
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Equipment</div>
                  <div className="text-xs text-gray-600">{((adjustedCosts.equipment / adjustedTotal) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">${adjustedCosts.equipment.toFixed(0)}</div>
            </div>

            {/* Insurance */}
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Insurance</div>
                  <div className="text-xs text-gray-600">{((adjustedCosts.insurance / adjustedTotal) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">${adjustedCosts.insurance.toFixed(0)}</div>
            </div>

            {/* Tolls */}
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Tolls</div>
                  <div className="text-xs text-gray-600">{((adjustedCosts.tolls / adjustedTotal) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">${adjustedCosts.tolls.toFixed(0)}</div>
            </div>

            {/* Overhead */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Overhead</div>
                  <div className="text-xs text-gray-600">{((adjustedCosts.overhead / adjustedTotal) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">${adjustedCosts.overhead.toFixed(0)}</div>
            </div>
          </div>

          {/* Total Cost - Smaller */}
          <div className="bg-gray-100 rounded-lg p-3 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-semibold text-gray-900">Total Operating Cost</div>
                <div className="text-xs text-gray-600">Per mile: ${(adjustedTotal / data.distance).toFixed(2)}</div>
              </div>
              <div className="text-lg font-bold text-gray-900">${adjustedTotal.toFixed(0)}</div>
            </div>
          </div>

          {/* Profitability Scenarios - Much Smaller */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Profitability Scenarios</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { margin: 10, label: "10%" },
                { margin: 15, label: "15%" },
                { margin: 20, label: "20%" },
                { margin: 25, label: "25%" }
              ].map((scenario, index) => {
                const rate = adjustedTotal / (1 - scenario.margin / 100);
                const isSelected = scenario.margin === data.targetMargin;
                return (
                  <div 
                    key={index} 
                    className={`p-2 rounded-lg border text-center ${
                      isSelected 
                        ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {scenario.label}
                    </div>
                    <div className="text-xs font-bold">${rate.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right - Market Analysis - Smaller */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Market Analysis</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                <span className="text-xs font-medium text-red-700">Market Floor</span>
                <span className="text-xs font-bold text-red-700">${marketRateRange.low.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-xs font-medium text-emerald-700">Your Rate</span>
                <span className="text-xs font-bold text-emerald-700">${adjustedSuggestedRate.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-xs font-medium text-blue-700">Market Ceiling</span>
                <span className="text-xs font-bold text-blue-700">${marketRateRange.high.toFixed(0)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Market Conditions</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Lane Demand</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Strong</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Fuel Volatility</span>
                  </div>
                  <span className="text-xs font-medium text-yellow-600">Moderate</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Equipment</span>
                  </div>
                  <span className="text-xs font-medium text-blue-600">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-200">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900 mb-1">Recommendation</h4>
                <p className="text-xs text-emerald-800">
                  Your rate of <strong>${adjustedSuggestedRate.toFixed(0)}</strong> is well-positioned. 
                  Consider <strong>${(adjustedSuggestedRate * 1.05).toFixed(0)}</strong> for premium customers.
                </p>
              </div>
            </div>
          </div>

          {data.distance > 400 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-200">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 mb-1">Long Haul Advisory</h4>
                  <p className="text-xs text-amber-800">
                    Add <strong>$0.08/mile</strong> for extended logistics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};