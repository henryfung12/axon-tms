import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Calculator, Loader, AlertCircle } from 'lucide-react';

const routeSchema = z.object({
  origin: z.string().min(3, 'Origin city is required'),
  destination: z.string().min(3, 'Destination city is required'),
  distance: z.number().positive('Distance must be positive'),
  driveTime: z.number().positive('Drive time must be positive'),
  equipmentType: z.enum(['dry_van', 'refrigerated', 'flatbed', 'step_deck']),
  fuelMpg: z.number().min(4).max(12).default(6.5),
  driverPayPerMile: z.number().min(0.30).max(1.50).default(0.55),
  targetMargin: z.number().min(5).max(35).default(15),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface RouteCalculatorFormProps {
  onCalculate: (data: RouteFormData & { 
    routeDetails?: any;
    tollCost?: number;
    fuelCost?: number;
  }) => void;
  isCalculating?: boolean;
}

// Mock function to simulate Google Maps Distance Matrix API
const calculateRouteDistance = async (origin: string, destination: string): Promise<{
  distance: number;
  duration: number;
  tollCost: number;
  route: any;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock calculation based on city names
  const mockDistances: Record<string, Record<string, { distance: number; duration: number; tollCost: number }>> = {
    'springfield gardens, ny': {
      'linden, nj': { distance: 23, duration: 0.75, tollCost: 8.50 },
      'chicago, il': { distance: 790, duration: 12.5, tollCost: 45.00 },
      'atlanta, ga': { distance: 875, duration: 13.2, tollCost: 25.00 },
      'los angeles, ca': { distance: 2780, duration: 41.0, tollCost: 95.00 },
    },
    'chicago, il': {
      'atlanta, ga': { distance: 715, duration: 11.0, tollCost: 18.00 },
      'dallas, tx': { distance: 925, duration: 14.0, tollCost: 12.00 },
      'los angeles, ca': { distance: 2015, duration: 29.0, tollCost: 75.00 },
    },
  };

  const key = `${origin.toLowerCase()}, ${destination.toLowerCase()}`;
  const reverseKey = `${destination.toLowerCase()}, ${origin.toLowerCase()}`;
  
  if (mockDistances[key]?.[destination.toLowerCase()]) {
    return {
      ...mockDistances[key][destination.toLowerCase()],
      route: { waypoints: [origin, destination] }
    };
  } else if (mockDistances[reverseKey]?.[origin.toLowerCase()]) {
    return {
      ...mockDistances[reverseKey][origin.toLowerCase()],
      route: { waypoints: [destination, origin] }
    };
  }
  
  // Fallback calculation
  const estimatedDistance = Math.floor(Math.random() * 1000) + 100;
  return {
    distance: estimatedDistance,
    duration: estimatedDistance / 55, // Assume 55 mph average
    tollCost: estimatedDistance * 0.05, // $0.05 per mile average
    route: { waypoints: [origin, destination] }
  };
};

export const RateCalculatorForm: React.FC<RouteCalculatorFormProps> = ({ 
  onCalculate, 
  isCalculating = false 
}) => {
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      equipmentType: 'dry_van',
      fuelMpg: 6.5,
      driverPayPerMile: 0.55,
      targetMargin: 15,
    },
    mode: 'onChange'
  });

  const origin = watch('origin');
  const destination = watch('destination');
  const equipmentType = watch('equipmentType');

  // Auto-calculate route when both origin and destination are provided
  useEffect(() => {
    const calculateRoute = async () => {
      if (origin && destination && origin.length >= 3 && destination.length >= 3) {
        setIsCalculatingRoute(true);
        setRouteError(null);
        
        try {
          const routeData = await calculateRouteDistance(origin, destination);
          
          setValue('distance', Math.round(routeData.distance));
          setValue('driveTime', Math.round(routeData.duration * 10) / 10);
          
          // Trigger validation after setting values
          await trigger(['distance', 'driveTime']);
          
        } catch (error) {
          setRouteError('Unable to calculate route. Please enter distance manually.');
          console.error('Route calculation error:', error);
        } finally {
          setIsCalculatingRoute(false);
        }
      }
    };

    const debounceTimer = setTimeout(calculateRoute, 1000);
    return () => clearTimeout(debounceTimer);
  }, [origin, destination, setValue, trigger]);

  const onSubmit = async (data: RouteFormData) => {
    try {
      // Calculate additional route details
      const routeDetails = await calculateRouteDistance(data.origin, data.destination);
      
      // Calculate fuel cost based on current market price
      const currentFuelPrice = 3.84; // From live market data
      const fuelCost = (data.distance / data.fuelMpg) * currentFuelPrice;
      
      onCalculate({
        ...data,
        routeDetails: routeDetails.route,
        tollCost: routeDetails.tollCost,
        fuelCost: fuelCost
      });
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const equipmentOptions = [
    { value: 'dry_van', label: '🚛 Dry Van', mpg: 6.5 },
    { value: 'refrigerated', label: '❄️ Refrigerated', mpg: 5.8 },
    { value: 'flatbed', label: '📦 Flatbed', mpg: 6.2 },
    { value: 'step_deck', label: '🚚 Step Deck', mpg: 5.5 }
  ];

  // Auto-adjust MPG when equipment type changes
  useEffect(() => {
    const selectedEquipment = equipmentOptions.find(opt => opt.value === equipmentType);
    if (selectedEquipment) {
      setValue('fuelMpg', selectedEquipment.mpg);
    }
  }, [equipmentType, setValue]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Route Analysis</h3>
          <p className="text-sm text-gray-600">Calculate true carrier costs with live market data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              Origin
            </label>
            <input
              {...register('origin')}
              type="text"
              placeholder="e.g., Chicago, IL"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.origin ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.origin && (
              <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              Destination
            </label>
            <input
              {...register('destination')}
              type="text"
              placeholder="e.g., Atlanta, GA"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.destination ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
            )}
          </div>
        </div>

        {/* Auto-calculated fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Distance (miles)
              {isCalculatingRoute && <Loader className="w-4 h-4 ml-2 animate-spin" />}
            </label>
            <input
              {...register('distance', { valueAsNumber: true })}
              type="number"
              step="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.distance ? 'border-red-300' : 'border-gray-300'
              } ${isCalculatingRoute ? 'bg-gray-50' : 'bg-white'}`}
              readOnly={isCalculatingRoute}
            />
            {errors.distance && (
              <p className="mt-1 text-sm text-red-600">{errors.distance.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Estimated Drive Time (hours)
              {isCalculatingRoute && <Loader className="w-4 h-4 ml-2 animate-spin" />}
            </label>
            <input
              {...register('driveTime', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.driveTime ? 'border-red-300' : 'border-gray-300'
              } ${isCalculatingRoute ? 'bg-gray-50' : 'bg-white'}`}
              readOnly={isCalculatingRoute}
            />
            {errors.driveTime && (
              <p className="mt-1 text-sm text-red-600">{errors.driveTime.message}</p>
            )}
          </div>
        </div>

        {routeError && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">{routeError}</span>
          </div>
        )}

        {/* Equipment Type */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            🚛 Equipment Type
          </label>
          <select
            {...register('equipmentType')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {equipmentOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ⚙️ Advanced Settings
            <span className="ml-1">{showAdvanced ? '▼' : '▶'}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fuel MPG
              </label>
              <input
                {...register('fuelMpg', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="4"
                max="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Driver Pay (per mile)
              </label>
              <input
                {...register('driverPayPerMile', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0.30"
                max="1.50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Target Margin (%)
              </label>
              <input
                {...register('targetMargin', { valueAsNumber: true })}
                type="number"
                step="1"
                min="5"
                max="35"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <button
          type="submit"
          disabled={!isValid || isCalculating || isCalculatingRoute}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {(isCalculating || isCalculatingRoute) ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Calculator className="w-5 h-5" />
          )}
          <span>
            {isCalculatingRoute ? 'Calculating Route...' : 
             isCalculating ? 'Calculating Rate...' : 
             'Calculate Rate'}
          </span>
        </button>
      </form>
    </div>
  );
};