import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/api';
import UserCard from '../../components/admin-dashboard/allusers/UserCard';
import EditUser from '../../components/admin-dashboard/allusers/EditUser';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);

  // ✅ Move fetchUsers outside useEffect so you can use it in onUpdated
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.getUsers, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 grid grid-cols-1  gap-4">
      {users.map(user => (
        <UserCard
          key={user._id}
          user={user}
          onEdit={(id) => setEditingUserId(id)}
        />
      ))}

      {/* Modal */}
      {editingUserId && (
        <EditUser
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
};

export default AllUsers;
