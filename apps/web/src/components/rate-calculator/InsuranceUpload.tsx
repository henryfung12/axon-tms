import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Check, AlertTriangle, X } from 'lucide-react';

interface InsuranceData {
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

interface InsuranceUploadProps {
  onDataUpload: (data: InsuranceData[]) => void;
  existingData?: InsuranceData[];
}

export function InsuranceUpload({ onDataUpload, existingData = [] }: InsuranceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [previewData, setPreviewData] = useState<InsuranceData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseExcelFile = useCallback(async (file: File): Promise<InsuranceData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // In a real implementation, you'd use a library like xlsx or Papa Parse
          // For now, we'll simulate the parsing with the structure we know
          const mockData: InsuranceData[] = [
            {
              vin: '5PVNJ8JV3H4S63874',
              year: 2017,
              make: 'Hino',
              model: '268A',
              unitNumber: '102',
              entity: 'SWIFT',
              branch: 'EWR',
              value: 40000,
              physicalDamagePremium: 1220,
              autoLiabilityPremium: 16868,
              excessPremium: 29519,
              totalPremium: 47607
            },
            {
              vin: '5PVNJ8JVXL4S76467',
              year: 2020,
              make: 'Hino',
              model: '268A',
              unitNumber: '101',
              entity: 'SWIFT',
              branch: 'EWR',
              value: 40000,
              physicalDamagePremium: 1220,
              autoLiabilityPremium: 16868,
              excessPremium: 29519,
              totalPremium: 47607
            },
            {
              vin: '3HSDXTZN7PN382291',
              year: 2017,
              make: 'International',
              model: 'RH613 Tractor',
              unitNumber: '43401',
              entity: 'HUB/GEMINI',
              branch: 'GNY',
              value: 138240,
              physicalDamagePremium: 4216.32,
              autoLiabilityPremium: 22091,
              excessPremium: 38659,
              totalPremium: 64966.32
            },
            // Add more mock data based on the Excel structure
          ];
          
          resolve(mockData);
        } catch (error) {
          reject(new Error('Failed to parse Excel file. Please ensure it matches the expected format.'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMessage('Please upload an Excel file (.xlsx or .xls)');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('processing');
    setUploadedFileName(file.name);
    
    try {
      const parsedData = await parseExcelFile(file);
      setPreviewData(parsedData);
      setShowPreview(true);
      setUploadStatus('success');
      setErrorMessage('');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [parseExcelFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const confirmUpload = () => {
    onDataUpload(previewData);
    setShowPreview(false);
  };

  const cancelUpload = () => {
    setShowPreview(false);
    setPreviewData([]);
    setUploadStatus('idle');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Insurance Breakdown Upload</h3>
            <p className="text-xs text-gray-600">Upload VIN-specific insurance costs for accurate rate calculation</p>
          </div>
        </div>

        {/* Current Status */}
        {existingData.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                {existingData.length} vehicles loaded with insurance data
              </span>
            </div>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : uploadStatus === 'success'
              ? 'border-green-400 bg-green-50'
              : uploadStatus === 'error'
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            id="insurance-upload"
          />
          
          {uploadStatus === 'processing' ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Processing {uploadedFileName}...</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="space-y-2">
              <Check className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-sm text-green-800">{uploadedFileName} uploaded successfully</p>
              <p className="text-xs text-green-700">{previewData.length} vehicles found</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <p className="text-sm text-red-800">Upload failed</p>
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Drag and drop your insurance breakdown Excel file here
              </p>
              <p className="text-xs text-gray-500">or</p>
              <label
                htmlFor="insurance-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        {/* Expected Format */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-900 mb-2">Expected Excel Format:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Columns:</strong> VIN, Year, Make, Model, Unit#, Entity, Branch, Value, Physical Damage Premium, Auto Liability Premium, Excess Premium, Total Premium</p>
            <p><strong>File:</strong> .xlsx or .xls format</p>
            <p><strong>Example:</strong> Gemini_Auto_Breakout_-_2026.xlsx</p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Review Insurance Data</h3>
              <button
                onClick={cancelUpload}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Found {previewData.length} vehicles with insurance data. Review and confirm to integrate into rate calculations.
                </p>
              </div>
              
              {/* Preview Table */}
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Physical Damage</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Liability</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Premium</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(0, 10).map((vehicle, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-xs text-gray-900 font-mono">{vehicle.vin.substring(0, 8)}...</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{vehicle.unitNumber}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{vehicle.entity}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">${vehicle.physicalDamagePremium.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">${vehicle.autoLiabilityPremium.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-semibold">${vehicle.totalPremium.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="p-3 text-center text-xs text-gray-500">
                    ... and {previewData.length - 10} more vehicles
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cancelUpload}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}