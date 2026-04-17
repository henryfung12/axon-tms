import React, { useState, useEffect } from 'react';
import { Search, Truck, AlertCircle } from 'lucide-react';

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

interface VINSelectorProps {
  vehicles: VehicleData[];
  selectedVIN: string | null;
  onVINSelect: (vehicle: VehicleData | null) => void;
  disabled?: boolean;
}

export function VINSelector({ vehicles, selectedVIN, onVINSelect, disabled = false }: VINSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>(vehicles);

  const selectedVehicle = vehicles.find(v => v.vin === selectedVIN);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle => 
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.entity.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const handleVehicleSelect = (vehicle: VehicleData) => {
    onVINSelect(vehicle);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const clearSelection = () => {
    onVINSelect(null);
    setSearchTerm('');
  };

  // Calculate insurance cost per mile based on average annual mileage
  const calculateInsuranceCostPerMile = (totalPremium: number) => {
    const averageAnnualMiles = 120000; // Typical for trucking
    return totalPremium / averageAnnualMiles;
  };

  if (vehicles.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-sm font-medium text-amber-900">No Insurance Data</h3>
            <p className="text-xs text-amber-800 mt-1">
              Upload your insurance breakdown Excel file to get VIN-specific insurance costs for accurate rate calculations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          🚛 Select Vehicle (VIN/Unit#)
        </label>
        
        {selectedVehicle ? (
          // Selected Vehicle Display
          <div className="relative">
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50 border-blue-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Unit #{selectedVehicle.unitNumber} - {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </div>
                    <div className="text-xs text-gray-600">
                      VIN: {selectedVehicle.vin} | Entity: {selectedVehicle.entity}
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  disabled={disabled}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Change
                </button>
              </div>
            </div>
            
            {/* Insurance Cost Breakdown */}
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-600">Physical Damage</div>
                  <div className="font-semibold text-gray-900">${selectedVehicle.physicalDamagePremium.toLocaleString()}/yr</div>
                </div>
                <div>
                  <div className="text-gray-600">Auto Liability</div>
                  <div className="font-semibold text-gray-900">${selectedVehicle.autoLiabilityPremium.toLocaleString()}/yr</div>
                </div>
                <div>
                  <div className="text-gray-600">Excess Premium</div>
                  <div className="font-semibold text-gray-900">${selectedVehicle.excessPremium.toLocaleString()}/yr</div>
                </div>
                <div>
                  <div className="text-gray-600">Per Mile Cost</div>
                  <div className="font-semibold text-blue-600">
                    ${calculateInsuranceCostPerMile(selectedVehicle.totalPremium).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Vehicle Search/Selection
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                disabled={disabled}
                placeholder="Search by VIN, Unit#, or vehicle..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredVehicles.length > 0 ? (
                  <div className="py-1">
                    {filteredVehicles.slice(0, 10).map((vehicle, index) => (
                      <button
                        key={vehicle.vin}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              Unit #{vehicle.unitNumber} - {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-xs text-gray-600">
                              VIN: {vehicle.vin} | {vehicle.entity}
                            </div>
                          </div>
                          <div className="text-xs text-right">
                            <div className="text-gray-900 font-medium">
                              ${calculateInsuranceCostPerMile(vehicle.totalPremium).toFixed(3)}/mi
                            </div>
                            <div className="text-gray-600">
                              ${vehicle.totalPremium.toLocaleString()}/yr
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredVehicles.length > 10 && (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                        ... and {filteredVehicles.length - 10} more vehicles
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-xs text-gray-500 text-center">
                    No vehicles found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}

            {/* Click outside to close */}
            {showDropdown && (
              <div 
                className="fixed inset-0 z-0"
                onClick={() => setShowDropdown(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-600">Total Vehicles</div>
          <div className="font-semibold text-gray-900">{vehicles.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-600">Avg Insurance/Mile</div>
          <div className="font-semibold text-gray-900">
            ${(vehicles.reduce((sum, v) => sum + calculateInsuranceCostPerMile(v.totalPremium), 0) / vehicles.length).toFixed(3)}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-600">Lowest Rate</div>
          <div className="font-semibold text-green-600">
            ${Math.min(...vehicles.map(v => calculateInsuranceCostPerMile(v.totalPremium))).toFixed(3)}/mi
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-600">Highest Rate</div>
          <div className="font-semibold text-red-600">
            ${Math.max(...vehicles.map(v => calculateInsuranceCostPerMile(v.totalPremium))).toFixed(3)}/mi
          </div>
        </div>
      </div>
    </div>
  );
}