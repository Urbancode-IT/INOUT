import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';
import RecentAttendanceTable from '../../components/admin-dashboard/dashboard/RecentAttendanceTable';
import DashboardCards from '../../components/admin-dashboard/dashboard/DashboardCards';
import Loader from '../../components/admin-dashboard/common/Loader';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import AbsentUsersList from '../../components/admin-dashboard/dashboard/AbsentUsersList';
import ReportGenerator from '../../components/admin-dashboard/dashboard/ReportGenerator';
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
});
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch summary and logs on load
  useEffect(() => {
    const fetchDashboardData = async () => {
  try {
    const headers = { Authorization: `Bearer ${token}` };

    const [summaryRes, logsRes, usersRes] = await Promise.all([
      axios.get(API_ENDPOINTS.getAdminSummary, { headers }),
      axios.get(API_ENDPOINTS.getRecentAttendanceLogs, { headers }),
      axios.get(API_ENDPOINTS.getAllUsers, { headers }), 
    ]);

    setSummary(summaryRes.data || {});
    setLogs(logsRes.data || []);
    setFilteredLogs(logsRes.data || []);
    setAllUsers(usersRes.data || []); // NEW
  } catch (err) {
    console.error('Dashboard loading error:', err);
  } finally {
    setLoading(false);
  }
};
    fetchDashboardData();
  }, [token]);
  
  // Apply filters
  useEffect(() => {
    let result = [...logs];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter(log =>
        log.employeeName?.toLowerCase().includes(keyword)
      );
    }

    if (dateFilter) {
      const targetDate = new Date(dateFilter).toDateString();
      result = result.filter(log =>
        new Date(log.timestamp).toDateString() === targetDate
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(log => log.type === typeFilter);
    }

    if (locationFilter !== 'all') {
      const isInOffice = locationFilter === 'office';
      result = result.filter(log => log.isInOffice === isInOffice);
    }

    if (companyFilter !== 'all') {
      result = result.filter(log => log.company === companyFilter);
    }

    setFilteredLogs(result);
  }, [logs, search, dateFilter, typeFilter, locationFilter, companyFilter]);
  const logsForSelectedDate = logs.filter(log =>
  new Date(log.timestamp).toDateString() === new Date(dateFilter).toDateString()
);

  if (loading) return <Loader />;

  return (
    <div className="p-6 ">
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
    <ReportGenerator
          logs={filteredLogs} 
  allUsers={allUsers} 
  selectedDate={dateFilter}
        /></div>
      {/* Summary Cards */}
      {summary && <DashboardCards data={summary} />}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-6">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400" />
          </div>
          <input
            type="date"
            className="pl-10 w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="check-in">Check In</option>
          <option value="check-out">Check Out</option>
        </select>

        {/* Location Filter */}
        {/* <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Locations</option>
          <option value="office">In Office</option>
          <option value="remote">Remote</option>
        </select> */}

        {/* Company Filter */}
        {/* <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Companies</option>
          <option value="Urbancode">Urbancode</option>
          <option value="Jobzenter">Jobzenter</option>
        </select> */}
        
      </div>

      {/* Attendance Table */}
      <RecentAttendanceTable logs={filteredLogs} />
     <AbsentUsersList allUsers={allUsers} logs={logsForSelectedDate} />
    </div>
  );
};

export default Dashboard;
