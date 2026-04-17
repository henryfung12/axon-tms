import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Props {
  loadId: string;
  onBack: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  IN_TRANSIT: 'bg-blue-600 text-white',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

type Tab = 'map' | 'notes' | 'docs' | 'check-calls' | 'logs';

export function CarrierLoadDetail({ loadId, onBack }: Props) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('check-calls');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [checkCallNote, setCheckCallNote] = useState('');

  const { data: load, isLoading } = useQuery({
    queryKey: ['load', loadId],
    queryFn: async () => {
      const { data } = await api.get(`/loads/${loadId}`);
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', loadId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/load/${loadId}`);
      return data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/loads/${loadId}/assign`, { driverId: selectedDriverId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', loadId] });
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setShowAssignModal(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { data } = await api.patch(`/loads/${loadId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', loadId] });
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading load details...
      </div>
    );
  }

  if (!load) return null;

  const pickup = load.stops?.[0];
  const delivery = load.stops?.[load.stops?.length - 1];
  const statusLabel = load.status === 'IN_TRANSIT' ? 'In Transit' : load.status?.charAt(0) + load.status?.slice(1).toLowerCase();
  const nextStatus = load.status === 'ASSIGNED' ? 'IN_TRANSIT' : load.status === 'IN_TRANSIT' ? 'DELIVERED' : null;
  const nextStatusLabel = nextStatus === 'IN_TRANSIT' ? 'Mark In Transit' : nextStatus === 'DELIVERED' ? 'Mark Delivered' : null;

  return (
    <div>
      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-base font-medium text-gray-900">Assign Fleet to {load.loadNumber}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">âœ•</button>
            </div>
            <div className="px-6 py-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Select Driver</label>
              <select
                value={selectedDriverId}
                onChange={e => setSelectedDriverId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Choose a driver...</option>
                {drivers?.filter((d: any) => d.status !== 'DRIVING').map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.user?.firstName} {d.user?.lastName} — {d.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={() => assignMutation.mutate()}
                disabled={!selectedDriverId || assignMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            â† Load board
          </button>
          <span className="text-gray-300">|</span>
          <h2 className="text-base font-semibold text-gray-900">
            Load — {load.loadNumber}
          </h2>
          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[load.status]}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {nextStatusLabel && (
            <button
              onClick={() => statusMutation.mutate(nextStatus!)}
              disabled={statusMutation.isPending}
              className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {statusMutation.isPending ? 'Updating...' : nextStatusLabel}
            </button>
          )}
        </div>
      </div>

      {/* Route breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
          {load.status === 'IN_TRANSIT' ? 'IT' : load.status?.[0]}
        </span>
        <span className="font-medium">{pickup?.state}</span>
        <span>â†’</span>
        <span className="font-medium">{delivery?.state}</span>
        {load.mileage && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{load.mileage} mi</span>
        )}
      </div>

      {/* 3-panel layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT PANEL: Trip meta */}
        <div className="col-span-3 space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`text-xs font-bold px-2 py-1 rounded mb-3 inline-block ${STATUS_COLORS[load.status]}`}>
              {statusLabel}
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Trip #', value: load.loadNumber },
                { label: 'Order #', value: '—' },
                { label: 'PO #', value: '—' },
                { label: 'Customer Service Rep.', value: '+ Assign', isAction: true },
                { label: 'Account Manager', value: '+ Assign', isAction: true },
                { label: 'Sales Manager', value: '+ Assign', isAction: true },
                { label: 'Load Planner', value: '+ Assign', isAction: true },
                { label: 'Dispatcher', value: '+ Assign', isAction: true },
                { label: 'Load Office', value: 'GNY' },
                { label: 'Created By', value: 'Admin' },
                { label: 'Date Created', value: load.createdAt ? new Date(load.createdAt).toLocaleDateString() : '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={item.isAction ? 'text-blue-600 cursor-pointer hover:underline' : 'text-gray-800 font-medium'}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Assign Fleet
              </button>
              <button className="flex-1 px-2 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                Change Office
              </button>
            </div>
          </div>

          {/* Money Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Money Box</h3>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <p className="text-gray-500">Sales Margin</p>
                <p className="font-semibold text-gray-900">0%</p>
              </div>
              <div>
                <p className="text-gray-500">Sales Diff.</p>
                <p className="font-semibold text-red-600">—$0.00</p>
              </div>
              <div>
                <p className="text-gray-500">Posted Rate</p>
                <p className="font-semibold text-green-600">$0.00</p>
              </div>
            </div>

            <div className="text-xs space-y-1 py-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Empty Miles</span>
                <span className="text-blue-600">0 mi.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Loaded Miles</span>
                <span className="text-blue-600">{load.mileage || 0} mi.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trip Value</span>
                <span className="text-blue-600">${(load.totalRate || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Customer Rate */}
            <div className="mt-3 border border-gray-200 rounded p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Customer Rate <span className="text-blue-600">{load.customer?.name}</span>
              </p>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Line Haul</span>
                  <span className="text-green-600 font-medium">${(load.totalRate || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fuel Surcharge</span>
                  <span className="text-green-600">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                  <span className="font-medium text-gray-700">Total Billable</span>
                  <span className="font-bold text-gray-900">${(load.totalRate || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Load Details */}
        <div className="col-span-5 space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-blue-600">{load.customer?.name}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Customer</span>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <p className="text-gray-500 mb-1">Invoicing Address</p>
                <p className="text-gray-800">{load.customer?.address || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Invoicing Settings</p>
                <p className="text-gray-400 italic">Email</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs py-3 border-t border-gray-100">
              <div>
                <p className="text-gray-500">Load Weight</p>
                <p className="font-medium text-gray-800">{load.weight ? `${load.weight.toLocaleString()} lbs` : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Load Volume</p>
                <p className="font-medium text-gray-800">—</p>
              </div>
              <div>
                <p className="text-gray-500">Equipment</p>
                <p className="font-medium text-gray-800">{load.equipment || "Van - 53'"}</p>
              </div>
            </div>

            <div className="py-3 border-t border-gray-100 text-xs">
              <p className="text-gray-500 mb-1">Commodity</p>
              <p className="text-gray-800">{load.commodity || 'No commodity...'}</p>
            </div>

            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1.5 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50">Add Contact</button>
              <button className="px-3 py-1.5 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50">Add Commodity</button>
              <button className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50">Change Customer</button>
            </div>
          </div>

          {/* Tab bar + stop details */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200 bg-blue-600">
              {(['Map', 'Notes', 'Docs', 'Check Calls', 'Optimize', 'Tender', 'Add Stop', 'Logs'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-') as Tab)}
                  className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.toLowerCase().replace(' ', '-')
                      ? 'bg-white text-blue-600'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {tab}
                  {tab === 'Docs' && documents?.length ? ` ${documents.length}` : ''}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'check-calls' && (
                <div>
                  <div className="mb-4">
                    <textarea
                      value={checkCallNote}
                      onChange={e => setCheckCallNote(e.target.value)}
                      placeholder="Add a check call note..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                      rows={2}
                    />
                    <button
                      onClick={() => setCheckCallNote('')}
                      className="mt-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Check Call
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 text-center py-4">
                    No check calls yet.
                  </div>
                </div>
              )}
              {activeTab === 'docs' && (
                <div>
                  {!documents || documents.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No documents uploaded.</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center gap-3 p-2 border border-gray-100 rounded">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">DOC</span>
                          <div>
                            <p className="text-xs font-medium text-gray-800">{doc.type}</p>
                            <p className="text-xs text-gray-400">{doc.fileName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'notes' && (
                <div>
                  {load.notes ? (
                    <p className="text-xs text-gray-700">{load.notes}</p>
                  ) : (
                    <p className="text-xs text-gray-400">No notes.</p>
                  )}
                </div>
              )}
              {(activeTab === 'map' || activeTab === 'optimize' || activeTab === 'tender' || activeTab === 'add-stop' || activeTab === 'logs') && (
                <p className="text-xs text-gray-400 text-center py-4">Coming soon</p>
              )}
            </div>

            {/* Stop timeline */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-px h-4 bg-gray-300 mx-auto" />
                <span className="text-xs text-gray-400">{load.mileage || 0} mi. (empty)</span>
              </div>

              {load.stops?.map((stop: any, i: number) => (
                <div key={stop.id || i} className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${stop.type === 'PICKUP' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <span className={`text-xs font-bold ${stop.type === 'PICKUP' ? 'text-blue-600' : 'text-green-600'}`}>
                        {stop.type === 'PICKUP' ? 'â†‘' : 'â†“'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">{stop.type === 'PICKUP' ? `Pickup ${i + 1}` : 'Delivery'}</p>
                          <p className="text-xs font-medium text-blue-600">{stop.facilityName}</p>
                          <p className="text-xs text-gray-600">{stop.address}</p>
                          <p className="text-xs text-gray-600">{stop.city}, {stop.state} {stop.zip}</p>
                        </div>
                        <div className="text-right">
                          {stop.scheduledAt && (
                            <>
                              <p className="text-xs text-gray-500">FCFS: {new Date(stop.scheduledAt).toLocaleDateString()}</p>
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                stop.type === 'PICKUP' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {stop.type === 'PICKUP' ? 'Scheduled' : 'Pending'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stop details */}
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 mb-1">Loading Type</p>
                          <div className="flex gap-2">
                            {['Live', 'Hook', 'Drop & Hook'].map(t => (
                              <label key={t} className="flex items-center gap-1 cursor-pointer">
                                <input type="radio" name={`loading-${stop.id}`} className="w-3 h-3" defaultChecked={t === 'Live'} />
                                <span className="text-gray-600">{t}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Schedule Type</p>
                          <div className="flex gap-2">
                            {['APPT', 'FCFS'].map(t => (
                              <label key={t} className="flex items-center gap-1 cursor-pointer">
                                <input type="radio" name={`schedule-${stop.id}`} className="w-3 h-3" defaultChecked={t === 'FCFS'} />
                                <span className="text-gray-600">{t}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-400">Stop Instructions</p>
                        <p className="text-xs text-gray-500 italic">{stop.instructions || 'No instructions...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Carrier / Driver Details */}
        <div className="col-span-4 space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Carrier Details</h3>

            {load.driver ? (
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  AXON TMS Transport Corp
                </p>
                <p className="text-xs text-gray-500 mb-3">Own Fleet</p>

                <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                  <div>
                    <p className="text-gray-500 mb-1">Driver 1</p>
                    <p className="text-blue-600 font-medium">
                      {load.driver.user?.firstName} {load.driver.user?.lastName}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                      {load.driver.status === 'DRIVING' ? 'Online' : 'Offline'}
                    </span>
                    <p className="text-gray-600 mt-1">{load.driver.user?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Truck</p>
                    <p className="text-blue-600 font-medium">{load.driver.truckNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Trailer</p>
                    <p className="text-blue-600 font-medium">{load.driver.trailerNumber || '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 mb-3">No driver assigned</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Assign Fleet
                </button>
              </div>
            )}

            {/* Location Tracking */}
            {load.driver && (
              <div className="border border-gray-200 rounded p-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-700">Location Tracking</h4>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Dispatch: CheckCall</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-700">
                      {load.driver.lastLocationAt
                        ? new Date(load.driver.lastLocationAt).toLocaleString()
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Location</span>
                    <span className="text-gray-700">
                      {load.driver.currentLat
                        ? `${load.driver.currentLat.toFixed(4)}, ${load.driver.currentLng.toFixed(4)}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next Stop</span>
                    <span className="text-gray-700">{delivery?.facilityName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next Stop ETA</span>
                    <span className="text-gray-700">
                      {delivery?.scheduledAt
                        ? new Date(delivery.scheduledAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Speed</span>
                    <span className="text-gray-700">
                      {load.driver.currentSpeed && load.driver.currentSpeed > 0
                        ? `${Math.round(load.driver.currentSpeed)} mph`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-800 text-white rounded hover:bg-gray-700">
                Manage Assets
              </button>
              <button className="flex-1 px-2 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                Change Tender
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
