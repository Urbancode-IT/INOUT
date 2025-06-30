import React from 'react';

const RecentAttendanceTable = ({ logs = [] }) => {
  return (
    <div className="overflow-x-auto rounded shadow bg-white w-full mt-4">
      <h2 className="text-lg font-semibold text-gray-800 px-4 py-3 border-b">Recent Attendance Logs</h2>
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="text-gray-800">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No recent attendance</td>
            </tr>
          ) : (
            logs.map((log, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-medium">{log.employeeName || 'Unknown'}</td>
                <td className="px-4 py-2 capitalize text-sm">
                  <span className={`px-2 py-1 rounded-full text-white ${log.type === 'check-in' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="px-4 py-2">{new Date(log.timestamp).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAttendanceTable;
