import React, { useState } from 'react';
import axios from 'axios';
import {
  FiUser, FiMail, FiLock, FiBriefcase, FiHome, FiCalendar, FiPhone
} from 'react-icons/fi';
import { API_ENDPOINTS } from '../utils/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Register() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    company: ''
  });

  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: { start: '09:00', end: '17:00', isLeave: false },
    Tuesday: { start: '09:00', end: '17:00', isLeave: false },
    Wednesday: { start: '09:00', end: '17:00', isLeave: false },
    Thursday: { start: '09:00', end: '17:00', isLeave: false },
    Friday: { start: '09:00', end: '17:00', isLeave: false },
    Saturday: { start: '09:00', end: '17:00', isLeave: false },
    Sunday: { start: '', end: '', isLeave: true }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(API_ENDPOINTS.register, {
        ...formData,
        schedule: weeklySchedule
      });

      Swal.fire({
    icon: 'success',
    title: 'User Created!',
    text: 'Employee registered successfully! Account will be activated once approved by admin side...',
    confirmButtonColor: '#6ca8a4'
  });

  setTimeout(() => {
    navigate('/login');  // Redirect to login after successful registration
  }, 3000);

      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        position: '',
        company: ''
      });

    } catch (error) {
      console.error('Error creating user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error.response?.data?.message || '❌ Failed to create user',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-[#f0f4ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto backdrop-blur-lg bg-white/70 border border-[#e0ecff] shadow-xl rounded-3xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#2c2e3e]">UC & JZ Employee Registration</h2>
          <p className="text-[#6e7b8b] mt-2">Fill in the details to create a user with a weekly schedule</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField icon={<FiUser />} label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Jane Doe" />
            <InputField icon={<FiMail />} type="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" />
            <div className="relative">
  <InputField
    icon={<FiLock />}
    type={showPassword ? 'text' : 'password'}
    label="Password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    placeholder="••••••••"
  />
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    className="absolute right-3 top-[38px] text-sm text-[#6ca8a4] hover:underline"
  >
    {showPassword ? 'Hide' : 'Show'}
  </button>
</div>


            <div>
              <label className="block text-sm font-semibold text-[#2c2e3e] mb-1 flex items-center">
                <FiPhone className="mr-2 text-[#6ca8a4]" /> Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode='numeric'
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength="10"
                  placeholder="9876543210"
                  className="w-full rounded-r-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ca8a4] focus:border-[#6ca8a4]"
                />
              </div>
            </div>

            <InputField icon={<FiBriefcase />} label="Position" name="position" value={formData.position} onChange={handleChange} placeholder="e.g. Developer" />

            <div>
              <label className="block text-sm font-semibold text-[#2c2e3e] mb-1 flex items-center">
                <FiHome className="mr-2 text-[#6ca8a4]" /> Company
              </label>
              <select
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ca8a4] focus:border-[#6ca8a4]"
              >
                <option value="">Select Company</option>
                <option value="Jobzenter">Jobzenter</option>
                <option value="Urbancode">Urbancode</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center mb-4">
              <FiCalendar className="h-5 w-5 text-[#6ca8a4] mr-2" />
              <h3 className="text-xl font-semibold text-[#2c2e3e]">Weekly Schedule</h3>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <div key={day} className={`p-4 rounded-lg border ${weeklySchedule[day].isLeave ? 'bg-gray-100' : 'bg-green-50'} border-gray-200`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={weeklySchedule[day].isLeave}
                        onChange={(e) => handleScheduleChange(day, 'isLeave', e.target.checked)}
                        className="h-4 w-4 text-[#6ca8a4] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-[#2c2e3e]">{day}</span>
                    </label>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${weeklySchedule[day].isLeave ? 'bg-gray-200 text-gray-600' : 'bg-green-200 text-green-800'}`}>
                      {weeklySchedule[day].isLeave ? 'Day Off' : 'Working Day'}
                    </span>
                  </div>

                  {!weeklySchedule[day].isLeave && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Start Time" type="time" value={weeklySchedule[day].start} onChange={(e) => handleScheduleChange(day, 'start', e.target.value)} />
                      <InputField label="End Time" type="time" value={weeklySchedule[day].end} onChange={(e) => handleScheduleChange(day, 'end', e.target.value)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-2 text-white text-sm font-medium rounded-md shadow-md transition bg-[#6ca8a4] hover:bg-[#5a9792] focus:ring-2 focus:ring-[#6ca8a4] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, icon, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2c2e3e] mb-1 flex items-center">
        {icon && <span className="mr-2 text-[#6ca8a4]">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ca8a4] focus:border-[#6ca8a4]"
      />
    </div>
  );
}

export default Register;
