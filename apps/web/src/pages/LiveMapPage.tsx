import { useQuery } from '@tanstack/react-query';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { api } from '@/lib/api';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const STATUS_COLORS: Record<string, string> = {
  DRIVING:       '#2563eb',
  AVAILABLE:     '#16a34a',
  ON_BREAK:      '#d97706',
  OFF_DUTY:      '#6b7280',
  SLEEPER_BERTH: '#7c3aed',
  HOS_LIMIT:     '#dc2626',
};

const STATUS_LABELS: Record<string, string> = {
  DRIVING:       'Driving',
  AVAILABLE:     'Available',
  ON_BREAK:      'On break',
  OFF_DUTY:      'Off duty',
  SLEEPER_BERTH: 'Sleeper berth',
  HOS_LIMIT:     'HOS limit',
};

export function LiveMapPage() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers-live'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
    refetchInterval: 30000,
  });

  const activeDrivers = drivers?.filter(
    (d: any) => d.currentLat && d.currentLng
  );

  const defaultCenter = { lat: 39.5, lng: -98.35 };return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Live map</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          Updates every 30 seconds
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Active trucks</p>
          <p className="text-2xl font-medium text-gray-900">
            {drivers?.filter((d: any) => d.status === 'DRIVING').length || 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Available drivers</p>
          <p className="text-2xl font-medium text-gray-900">
            {drivers?.filter((d: any) => d.status === 'AVAILABLE').length || 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total drivers</p>
          <p className="text-2xl font-medium text-gray-900">
            {drivers?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ height: '500px' }}>
          {isLoading && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Loading map...
            </div>
          )}
          {!isLoading && (
            <APIProvider apiKey={GOOGLE_MAPS_KEY}>
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={4}
                mapId="gemini-express-map"
                style={{ width: '100%', height: '100%' }}
              >
                {activeDrivers?.map((driver: any) => (
                  <AdvancedMarker
                    key={driver.id}
                    position={{ lat: driver.currentLat, lng: driver.currentLng }}
                  >
                    <Pin
                      background={STATUS_COLORS[driver.status] || '#6b7280'}
                      borderColor="#fff"
                      glyphColor="#fff"
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Driver locations</h3>
          {!drivers || drivers.length === 0 && (
            <p className="text-sm text-gray-400">No drivers found.</p>
          )}
          <div className="space-y-3">
            {drivers?.map((driver: any) => (
              <div key={driver.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 flex-shrink-0">
                  {driver.user.firstName[0]}{driver.user.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {driver.user.firstName} {driver.user.lastName}
                  </p>
                  {driver.currentLat && driver.currentLng ? (
                    <p className="text-xs text-gray-400">
                      {driver.currentLat.toFixed(4)}, {driver.currentLng.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">No location data</p>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: (STATUS_COLORS[driver.status] || '#6b7280') + '20',
                    color: STATUS_COLORS[driver.status] || '#6b7280',
                  }}
                >
                  {STATUS_LABELS[driver.status] || driver.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}