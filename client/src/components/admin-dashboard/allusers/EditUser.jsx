import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../../../utils/api';

const EditUser = ({ userId, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    position: '',
    company: '',
    salary: '',
    department: '',
    qualification: '',
    dateOfJoining: '',
    profilePic: '',
    skills: [],
    rolesAndResponsibility: [],
    bankDetails: {
      bankingName: '',
      bankAccountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  useEffect(() => {
    if (userId) {
      axios.get(API_ENDPOINTS.getUserById(userId)
    , {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
        .then(({ data }) => {
          setForm({
            ...data,
            skills: data.skills || [],
            rolesAndResponsibility: data.rolesAndResponsibility || [],
            bankDetails: data.bankDetails || {}
          });
        })
        .catch(() => Swal.fire('Error', 'Failed to fetch user', 'error'));
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const handleArrayField = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value.split(',').map(v => v.trim())
    }));
  };
  const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(API_ENDPOINTS.updateUser(userId), form,{
    headers
  });
      Swal.fire('Success', 'User updated successfully', 'success');
      onUpdated?.();
      onClose?.();
      console.log('Final form before submit:', form);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Update failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white max-w-3xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2" />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2" />
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2" />
          <input type="text" name="position" value={form.position} onChange={handleChange} placeholder="Position" className="border p-2" />
          <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Company" className="border p-2" />
          
          <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="Department" className="border p-2" />
          <input type="text" name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" className="border p-2" />
          <input type="date" name="dateOfJoining" value={form.dateOfJoining?.slice(0, 10)} onChange={handleChange} className="border p-2" />

          <input type="text" name="skills" value={form.skills.join(', ')} onChange={(e) => handleArrayField('skills', e.target.value)} placeholder="Skills (comma separated)" className="col-span-2 border p-2" />
          <input type="text" name="rolesAndResponsibility" value={form.rolesAndResponsibility.join(', ')} onChange={(e) => handleArrayField('rolesAndResponsibility', e.target.value)} placeholder="Responsibilities (comma separated)" className="col-span-2 border p-2" />

          {/* Banking Fields */}
          <input type="text" name="bankingName" value={form.bankDetails.bankingName || ''} onChange={handleBankChange} placeholder="Bank Name" className="border p-2" />
          <input type="text" name="bankAccountNumber" value={form.bankDetails.bankAccountNumber || ''} onChange={handleBankChange} placeholder="Account Number" className="border p-2" />
          <input type="text" name="ifscCode" value={form.bankDetails.ifscCode || ''} onChange={handleBankChange} placeholder="IFSC Code" className="border p-2" />
          <input type="text" name="upiId" value={form.bankDetails.upiId || ''} onChange={handleBankChange} placeholder="UPI ID" className="border p-2" />

          <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
