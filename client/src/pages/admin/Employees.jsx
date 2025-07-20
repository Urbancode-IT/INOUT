import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';
import Loader from '../../components/admin-dashboard/common/Loader';


const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EmployeeSchedule = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all schedules and user data
  // useEffect(() => {
  //   const fetchSchedules = async () => {
  //     try {
  //       const response = await axios.get('/api/schedules'); // Adjust endpoint as needed
  //       setEmployees(response.data);
  //     } catch (error) {
  //       console.error('Error fetching schedules', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchSchedules();
  // }, []);
   useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_ENDPOINTS.getSchedules, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
        fetchEmployees();
  }, []);

  if (loading) return <Loader />;

  const handleChange = (empIndex, day, field, value) => {
    const updated = [...employees];
    updated[empIndex].weeklySchedule[day][field] = field === 'isLeave' ? value : value;
    setEmployees(updated);
  };

  const handleSalaryChange = (empIndex, value) => {
    const updated = [...employees];
    updated[empIndex].salary = parseFloat(value) || 0;
    setEmployees(updated);
  };

  const saveChanges = async (employee) => {
    try {
      await axios.put(API_ENDPOINTS.putUserSchedule(employee._id), {
        salary: employee.salary,
        weeklySchedule: employee.weeklySchedule,
      });
      alert('Changes saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Employee Schedule Management</h2>
      {employees.map((emp, index) => (
        <div key={emp._id} className="border p-4 mb-4 rounded bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">{emp.user?.name || 'Unnamed Employee'}</h3>
          <div className="mb-2">
            <label className="font-medium mr-2">Salary:</label>
            <input
              type="number"
              value={emp.salary}
              onChange={(e) => handleSalaryChange(index, e.target.value)}
              className="border p-1 rounded w-32"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {days.map((day) => (
              <div key={day} className="border p-2 rounded">
                <h4 className="font-semibold">{day}</h4>
                <label className="block text-sm">Start:</label>
                <input
                  type="time"
                  value={emp.weeklySchedule[day]?.start || '09:00'}
                  onChange={(e) => handleChange(index, day, 'start', e.target.value)}
                  className="border p-1 rounded w-full"
                />
                <label className="block text-sm">End:</label>
                <input
                  type="time"
                  value={emp.weeklySchedule[day]?.end || '17:00'}
                  onChange={(e) => handleChange(index, day, 'end', e.target.value)}
                  className="border p-1 rounded w-full"
                />
                <label className="block text-sm mt-1">
                  <input
                    type="checkbox"
                    checked={emp.weeklySchedule[day]?.isLeave || false}
                    onChange={(e) => handleChange(index, day, 'isLeave', e.target.checked)}
                    className="mr-1"
                  />
                  Is Leave
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={() => saveChanges(emp)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmployeeSchedule;
