export function DashboardPage() {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Active loads</p>
          <p className="text-2xl font-medium text-gray-900">47</p>
          <p className="text-xs text-green-600 mt-1">+8 from yesterday</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Available drivers</p>
          <p className="text-2xl font-medium text-gray-900">12</p>
          <p className="text-xs text-red-500 mt-1">3 at HOS limit</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Revenue this week</p>
          <p className="text-2xl font-medium text-gray-900">$84,200</p>
          <p className="text-xs text-green-600 mt-1">+12% vs last week</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">On-time delivery</p>
          <p className="text-2xl font-medium text-gray-900">94%</p>
          <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Recent loads</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Load #</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Route</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Driver</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 text-blue-600 font-medium">GE-10482</td>
              <td className="px-5 py-3 text-gray-700">Chicago to Dallas</td>
              <td className="px-5 py-3 text-gray-700">R. Gomez</td>
              <td className="px-5 py-3">
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">In transit</span>
              </td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 text-blue-600 font-medium">GE-10481</td>
              <td className="px-5 py-3 text-gray-700">Atlanta to Miami</td>
              <td className="px-5 py-3 text-gray-700">T. Brooks</td>
              <td className="px-5 py-3">
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">Delivered</span>
              </td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 text-blue-600 font-medium">GE-10480</td>
              <td className="px-5 py-3 text-gray-700">LA to Phoenix</td>
              <td className="px-5 py-3 text-red-500">Unassigned</td>
              <td className="px-5 py-3">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full">Pending</span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-5 py-3 text-blue-600 font-medium">GE-10479</td>
              <td className="px-5 py-3 text-gray-700">Denver to SLC</td>
              <td className="px-5 py-3 text-gray-700">M. Patel</td>
              <td className="px-5 py-3">
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">In transit</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}