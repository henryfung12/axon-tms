import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CreateLoadModal } from '@/components/loads/CreateLoadModal';
import { AssignDriverModal } from '@/components/loads/AssignDriverModal';
import { LoadDetailPage } from '@/pages/LoadDetailPage';

const STATUS_STYLES: Record<string, string> = {
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DELIVERED:  'bg-green-100 text-green-800',
  PENDING:    'bg-yellow-100 text-yellow-800',
  ASSIGNED:   'bg-purple-100 text-purple-800',
  CANCELLED:  'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  IN_TRANSIT: 'In transit',
  DELIVERED:  'Delivered',
  PENDING:    'Pending',
  ASSIGNED:   'Assigned',
  CANCELLED:  'Cancelled',
};

const FILTERS = ['All loads', 'PENDING', 'IN_TRANSIT', 'DELIVERED'];
const FILTER_LABELS: Record<string, string> = {
  'All loads':  'All loads',
  PENDING:      'Pending',
  IN_TRANSIT:   'In transit',
  DELIVERED:    'Delivered',
};

export function LoadBoardPage() {
  const [activeFilter, setActiveFilter] = useState('All loads');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignLoad, setAssignLoad] = useState<{ id: string; loadNumber: string } | null>(null);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads', activeFilter],
    queryFn: async () => {
      const params = activeFilter !== 'All loads' ? `?status=${activeFilter}` : '';
      const { data } = await api.get(`/loads${params}`);
      return data;
    },
  });

  if (selectedLoadId) {
    return (
      <LoadDetailPage
        loadId={selectedLoadId}
        onBack={() => setSelectedLoadId(null)}
      />
    );
  }

  return (
    <div>
      {showCreateModal && <CreateLoadModal onClose={() => setShowCreateModal(false)} />}
      {assignLoad && (
        <AssignDriverModal
          loadId={assignLoad.id}
          loadNumber={assignLoad.loadNumber}
          onClose={() => setAssignLoad(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Load board</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New load
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Load #</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Customer</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Origin</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Destination</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Driver</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rate</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">
                  Loading loads...
                </td>
              </tr>
            )}
            {!isLoading && loads?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No loads found. Click New load to create your first one.
                </td>
              </tr>
            )}
            {loads?.map((load: any) => (
              <tr key={load.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td
                  className="px-5 py-3 text-blue-600 font-medium cursor-pointer hover:underline"
                  onClick={() => setSelectedLoadId(load.id)}
                >
                  {load.loadNumber}
                </td>
                <td className="px-5 py-3 text-gray-700">{load.customer?.name}</td>
                <td className="px-5 py-3 text-gray-700">{load.stops?.[0]?.city}, {load.stops?.[0]?.state}</td>
                <td className="px-5 py-3 text-gray-700">{load.stops?.[load.stops.length - 1]?.city}, {load.stops?.[load.stops.length - 1]?.state}</td>
                <td className="px-5 py-3">
                  {load.driver
                    ? <span className="text-gray-700">{load.driver.user.firstName} {load.driver.user.lastName}</span>
                    : <span className="text-red-500">Unassigned</span>
                  }
                </td>
                <td className="px-5 py-3 text-gray-700 font-medium">${load.totalRate?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[load.status]}`}>
                    {STATUS_LABELS[load.status]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {!load.driver && (
                    <button
                      onClick={() => setAssignLoad({ id: load.id, loadNumber: load.loadNumber })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Assign driver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}