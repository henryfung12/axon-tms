import React, { useState, useCallback } from 'react';
import { z } from 'zod';

const rateSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  equipmentType: z.string(),
  fuelMpg: z.number().min(1),
  driverPayPerMile: z.number().min(0),
  targetMargin: z.number().min(0).max(50),
});

interface SmartRateCalculatorFormProps {
  onCalculate: (data: any) => void;
}

export function SmartRateCalculatorForm({ onCalculate }: SmartRateCalculatorFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: 0,
    driveTime: 0,
    equipmentType: 'dry_van',
    fuelMpg: 6.5,
    driverPayPerMile: 0.65,
    targetMargin: 15,
    tollCost: 0,
    fuelCost: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateDistance = async (origin: string, destination: string) => {
    // Mock distance calculation - in real app would use Google Maps API
    const distances: Record<string, number> = {
      'chicago_atlanta': 717,
      'chicago_dallas': 925,
      'chicago_miami': 1377,
      'newyork_atlanta': 870,
      'newyork_chicago': 790,
      'losangeles_chicago': 2015,
    };
    
    const key = `${origin.toLowerCase().replace(/[^a-z]/g, '')}_${destination.toLowerCase().replace(/[^a-z]/g, '')}`;
    const reverseKey = `${destination.toLowerCase().replace(/[^a-z]/g, '')}_${origin.toLowerCase().replace(/[^a-z]/g, '')}`;
    
    return distances[key] || distances[reverseKey] || Math.floor(Math.random() * 1200) + 300;
  };

  const handleInputChange = useCallback(async (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Auto-calculate distance when both origin and destination are filled
    if (field === 'origin' || field === 'destination') {
      if (newData.origin && newData.destination && newData.origin !== newData.destination) {
        const distance = await calculateDistance(newData.origin, newData.destination);
        const driveTime = Math.round((distance / 55) * 10) / 10;
        setFormData(prev => ({ ...prev, distance, driveTime }));
      }
    }
  }, [formData]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setErrors({});

    try {
      const validatedData = rateSchema.parse(formData);
      
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate costs
      const totalCost = 
        (formData.distance / formData.fuelMpg) * 3.84 + // Fuel
        formData.distance * formData.driverPayPerMile + // Driver
        formData.distance * 0.18 + // Equipment
        formData.distance * 0.12 + // Insurance
        formData.tollCost + // Tolls
        formData.distance * 0.08; // Overhead

      onCalculate({
        ...formData,
        totalCost,
        validatedData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-3"> {/* Reduced from space-y-6 to space-y-3 */}
      {/* Compact Origin/Destination Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Reduced gap from gap-6 to gap-3 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">📍 Origin</label> {/* Reduced from text-sm to text-xs */}
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => handleInputChange('origin', e.target.value)}
            placeholder="e.g., Chicago, IL"
            className={`w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.origin ? 'border-red-300' : 'border-gray-300'
            }`} // Reduced padding and font size
          />
          {errors.origin && <p className="text-xs text-red-600 mt-1">{errors.origin}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">🎯 Destination</label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            placeholder="e.g., Atlanta, GA"
            className={`w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.destination ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.destination && <p className="text-xs text-red-600 mt-1">{errors.destination}</p>}
        </div>
      </div>

      {/* Auto-calculated Distance and Time - Compact */}
      {formData.distance > 0 && (
        <div className="grid grid-cols-2 gap-3 bg-blue-50 rounded-lg p-2"> {/* Reduced padding from p-4 to p-2 */}
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formData.distance}</div> {/* Reduced from text-2xl to text-lg */}
            <div className="text-xs text-blue-700">Miles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formData.driveTime}</div>
            <div className="text-xs text-blue-700">Hours</div>
          </div>
        </div>
      )}

      {/* Compact Equipment Type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">🚛 Equipment Type</label>
        <select
          value={formData.equipmentType}
          onChange={(e) => handleInputChange('equipmentType', e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="dry_van">🚛 Dry Van</option>
          <option value="refrigerated">❄️ Refrigerated</option>
          <option value="flatbed">📦 Flatbed</option>
          <option value="step_deck">🛤️ Step Deck</option>
        </select>
      </div>

      {/* Compact Advanced Settings Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        ⚙️ Advanced Settings {showAdvanced ? '▲' : '▼'}
      </button>

      {/* Compact Advanced Settings */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-gray-50 rounded-lg"> {/* Reduced padding */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fuel MPG</label>
            <input
              type="number"
              value={formData.fuelMpg}
              onChange={(e) => handleInputChange('fuelMpg', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="1"
              max="15"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Driver Pay/Mile</label>
            <input
              type="number"
              value={formData.driverPayPerMile}
              onChange={(e) => handleInputChange('driverPayPerMile', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              max="2"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Margin %</label>
            <input
              type="number"
              value={formData.targetMargin}
              onChange={(e) => handleInputChange('targetMargin', parseFloat(e.target.value) || 0)}
              min="0"
              max="50"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Compact Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={isCalculating || !formData.origin || !formData.destination}
        className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2" // Reduced padding
      >
        {isCalculating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Calculating...
          </>
        ) : (
          <>
            🧮 Calculate Rate
          </>
        )}
      </button>
    </div>
  );
}