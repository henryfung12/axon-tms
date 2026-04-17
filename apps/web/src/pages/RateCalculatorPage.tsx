import React, { useState } from 'react';
import { SmartRateCalculatorForm } from '@/components/rate-calculator/SmartRateCalculatorForm';
import { CostBreakdown } from '@/components/rate-calculator/CostBreakdown';
import { InsuranceUpload } from '@/components/rate-calculator/InsuranceUpload';
import { VINSelector } from '@/components/rate-calculator/VINSelector';
import { Upload } from 'lucide-react';

interface VehicleData {
  vin: string;
  year: number;
  make: string;
  model: string;
  unitNumber: string;
  entity: string;
  branch: string;
  value: number;
  physicalDamagePremium: number;
  autoLiabilityPremium: number;
  excessPremium: number;
  totalPremium: number;
}

interface RateCalculatorPageProps {
  onBack: () => void;
}

export function RateCalculatorPage({ onBack }: RateCalculatorPageProps) {
  const [calculationData, setCalculationData] = useState(null);
  const [showInsuranceUpload, setShowInsuranceUpload] = useState(false);
  const [insuranceData, setInsuranceData] = useState<VehicleData[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

  const handleCalculate = (data: any) => {
    // Include selected vehicle insurance data in calculation
    const calculationWithInsurance = {
      ...data,
      selectedVehicle,
      insuranceCostPerMile: selectedVehicle 
        ? selectedVehicle.totalPremium / 120000 // Average annual miles
        : 0.12, // Default rate per mile
    };
    setCalculationData(calculationWithInsurance);
  };

  const handleInsuranceUpload = (data: VehicleData[]) => {
    setInsuranceData(data);
    setShowInsuranceUpload(false);
  };

  const calculateInsuranceCostPerMile = (vehicle: VehicleData) => {
    return vehicle.totalPremium / 120000; // Assuming 120,000 miles per year
  };

  return (
    <div className="p-3 max-w-7xl mx-auto"> {/* Reduced padding */}
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Carrier TMS
          </button>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🧮</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Rate Calculator</h1>
            <p className="text-xs text-gray-600">Calculate accurate carrier costs with VIN-specific insurance data</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInsuranceUpload(!showInsuranceUpload)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              insuranceData.length > 0 
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            {insuranceData.length > 0 ? `${insuranceData.length} Vehicles` : 'Upload Insurance'}
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
            New Calculation
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
            💾 Save Quote
          </button>
          <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
            📤 Share
          </button>
          <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Insurance Upload Section */}
      {showInsuranceUpload && (
        <div className="mb-4">
          <InsuranceUpload 
            onDataUpload={handleInsuranceUpload}
            existingData={insuranceData}
          />
        </div>
      )}

      {calculationData ? (
        // Compact Results Layout
        <div className="space-y-3">
          {/* Compact Route Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">{calculationData.origin} → {calculationData.destination}</h2>
                <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                  <span>{calculationData.distance} miles</span>
                  <span>•</span>
                  <span>{calculationData.driveTime} hours</span>
                  <span>•</span>
                  <span>{calculationData.equipmentType}</span>
                  {calculationData.selectedVehicle && (
                    <>
                      <span>•</span>
                      <span>Unit #{calculationData.selectedVehicle.unitNumber}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-600">${(calculationData.totalCost / (1 - calculationData.targetMargin / 100)).toFixed(0)}</div>
                <div className="text-xs text-gray-600">Suggested Rate</div>
              </div>
            </div>
          </div>

          {/* Compact Results */}
          <CostBreakdown data={calculationData} />
        </div>
      ) : (
        // Compact Form Layout
        <div className="space-y-4">
          {/* Live Market Data - Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Live Market Data</h2>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
            
            {/* Compact Market Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '⛽', label: 'National Avg Diesel', value: '$3.84/gal', change: '↗ 2.3%', changeColor: 'text-red-600' },
                { icon: '📊', label: 'Load-to-Truck Ratio', value: '4.2:1', change: '↗ 5.1%', changeColor: 'text-green-600' },
                { icon: '💲', label: 'Spot Market Rate', value: '$2.18/mi', change: '↗ 1.8%', changeColor: 'text-red-600' },
                { icon: '🕒', label: 'Market Demand', value: 'MEDIUM', change: '↗ 2.1%', changeColor: 'text-green-600' },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="text-sm font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                  <div className={`text-xs font-medium ${item.changeColor}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Compact Market Summary */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <h3 className="text-sm font-bold text-amber-900 mb-1">Market Summary</h3>
                <p className="text-xs text-amber-800">Based on last 24h data</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h3 className="text-sm font-bold text-orange-900 mb-1">Moderate Volatility</h3>
                <p className="text-xs text-orange-800">Fuel costs driving rates up</p>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <VINSelector
              vehicles={insuranceData}
              selectedVIN={selectedVehicle?.vin || null}
              onVINSelect={setSelectedVehicle}
            />
          </div>

          {/* Compact Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📍</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Route Analysis</h2>
                <p className="text-xs text-gray-600">Calculate true carrier costs with live market data</p>
              </div>
            </div>
            
            <SmartRateCalculatorForm 
              onCalculate={handleCalculate}
              selectedVehicle={selectedVehicle}
              insuranceCostPerMile={selectedVehicle ? calculateInsuranceCostPerMile(selectedVehicle) : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}