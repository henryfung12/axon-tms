import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Props {
  loadId: string;
  onBack: () => void;
}

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

const STOP_LABELS: Record<string, string> = {
  PICKUP:   'Pickup',
  DELIVERY: 'Delivery',
  FUEL_STOP: 'Fuel stop',
  WAYPOINT: 'Waypoint',
};

const NEXT_STATUS: Record<string, string> = {
  PENDING:    'ASSIGNED',
  ASSIGNED:   'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  PENDING:    'Mark as assigned',
  ASSIGNED:   'Mark as in transit',
  IN_TRANSIT: 'Mark as delivered',
};

export function LoadDetailPage({ loadId, onBack }: Props) {
  const queryClient = useQueryClient();

  const { data: load, isLoading } = useQuery({
    queryKey: ['load', loadId],
    queryFn: async () => {
      const { data } = await api.get(`/loads/${loadId}`);
      return data;
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
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Loading load details...</p>
      </div>
    );
  }

  if (!load) return null;

  const nextStatus = NEXT_STATUS[load.status];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Load board
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">{load.loadNumber}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{load.loadNumber}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{load.customer?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[load.status]}`}>
            {STATUS_LABELS[load.status]}
          </span>
          {nextStatus && (
            <button
              onClick={() => statusMutation.mutate(nextStatus)}
              disabled={statusMutation.isPending}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {statusMutation.isPending ? 'Updating...' : NEXT_STATUS_LABEL[load.status]}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Driver</p>
          <p className="text-sm font-medium text-gray-900">
            {load.driver
              ? `${load.driver.user.firstName} ${load.driver.user.lastName}`
              : 'Unassigned'
            }
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total rate</p>
          <p className="text-sm font-medium text-gray-900">${load.totalRate?.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Commodity</p>
          <p className="text-sm font-medium text-gray-900">{load.commodity || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Stops</h3>
          <div className="space-y-4">
            {load.stops?.map((stop: any, index: number) => (
              <div key={stop.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                    stop.completedAt ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  {index < load.stops.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      stop.type === 'PICKUP' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {STOP_LABELS[stop.type]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{stop.facilityName}</p>
                  <p className="text-xs text-gray-500">{stop.address}, {stop.city}, {stop.state} {stop.zip}</p>
                  {stop.scheduledAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Scheduled: {new Date(stop.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Load details</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 text-xs">Weight</td>
                <td className="py-2 text-gray-900 text-xs text-right">{load.weight ? `${load.weight?.toLocaleString()} lbs` : '—'}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 text-xs">Pieces</td>
                <td className="py-2 text-gray-900 text-xs text-right">{load.pieces || '—'}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 text-xs">Base rate</td>
                <td className="py-2 text-gray-900 text-xs text-right">${load.rate?.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 text-xs">Fuel surcharge</td>
                <td className="py-2 text-gray-900 text-xs text-right">${load.fuelSurcharge?.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 text-xs">Detention</td>
                <td className="py-2 text-gray-900 text-xs text-right">${load.detention?.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-900 text-xs font-medium">Total</td>
                <td className="py-2 text-gray-900 text-xs font-medium text-right">${load.totalRate?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {load.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{load.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}