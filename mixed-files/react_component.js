import React, { useState, useEffect } from 'react';
import axios from 'axios';

// React component for web application
const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      {loading ? <Spinner /> : <UserList users={users} />}
    </div>
  );
};

export default UserDashboard;