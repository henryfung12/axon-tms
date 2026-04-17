import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Props {
  loadId: string;
  loadNumber: string;
  onClose: () => void;
}

export function AssignDriverModal({ loadId, loadNumber, onClose }: Props) {
  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (driverId: string) => {
      const { data } = await api.patch(`/loads/${loadId}/assign`, { driverId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      onClose();
    },
  });

  const availableDrivers = drivers?.filter(
    (d: any) => d.status === 'AVAILABLE'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-900">
            Assign driver to {loadNumber}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
        </div>

        <div className="px-6 py-4">
          {isLoading && (
            <p className="text-sm text-gray-400 text-center py-4">Loading drivers...</p>
          )}
          {!isLoading && availableDrivers?.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No available drivers right now.</p>
          )}
          <div className="space-y-2">
            {availableDrivers?.map((driver: any) => (
              <button
                key={driver.id}
                onClick={() => assignMutation.mutate(driver.id)}
                disabled={assignMutation.isPending}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 flex-shrink-0">
                  {driver.user.firstName[0]}{driver.user.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {driver.user.firstName} {driver.user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    CDL {driver.cdlClass} · {driver.hosHoursUsed}h HOS used
                  </p>
                </div>
                <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}