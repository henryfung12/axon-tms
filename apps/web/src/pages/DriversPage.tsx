import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AddDriverModal } from '@/components/drivers/AddDriverModal';

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE:     'bg-green-100 text-green-800',
  DRIVING:       'bg-blue-100 text-blue-800',
  ON_BREAK:      'bg-yellow-100 text-yellow-800',
  OFF_DUTY:      'bg-gray-100 text-gray-600',
  SLEEPER_BERTH: 'bg-purple-100 text-purple-800',
  HOS_LIMIT:     'bg-red-100 text-red-800',
  INACTIVE:      'bg-gray-100 text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE:     'Available',
  DRIVING:       'Driving',
  ON_BREAK:      'On break',
  OFF_DUTY:      'Off duty',
  SLEEPER_BERTH: 'Sleeper berth',
  HOS_LIMIT:     'HOS limit',
  INACTIVE:      'Inactive',
};

export function DriversPage() {
  const [showModal, setShowModal] = useState(false);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  const hosPercent = (hoursUsed: number) => {
    return Math.min(Math.round((hoursUsed / 11) * 100), 100);
  };

  const hosColor = (hoursUsed: number) => {
    const pct = (hoursUsed / 11) * 100;
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  return (
    <div>
      {showModal && <AddDriverModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Drivers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add driver
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Driver</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">CDL class</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">CDL expiry</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">HOS used</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Phone</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
                  Loading drivers...
                </td>
              </tr>
            )}
            {!isLoading && drivers?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No drivers yet. Click Add driver to get started.
                </td>
              </tr>
            )}
            {drivers?.map((driver: any) => (
              <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                      {driver.user.firstName[0]}{driver.user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{driver.user.firstName} {driver.user.lastName}</p>
                      <p className="text-xs text-gray-400">{driver.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-700">{driver.cdlClass || '—'}</td>
                <td className="px-5 py-3 text-gray-700">
                  {driver.cdlExpiry ? new Date(driver.cdlExpiry).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${hosColor(driver.hosHoursUsed)}`}
                        style={{ width: `${hosPercent(driver.hosHoursUsed)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{driver.hosHoursUsed}h / 11h</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-700">{driver.user.phone || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[driver.status]}`}>
                    {STATUS_LABELS[driver.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}