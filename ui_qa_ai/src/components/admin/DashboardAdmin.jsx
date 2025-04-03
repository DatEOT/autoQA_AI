import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styleadmin/DashboardAdmin.css';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const [counts, setCounts] = useState({ user: 0, admin: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/roleUser/countRoles",
      {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
        },
      }
    )
      .then(res => {
        setCounts({
          user: res.data.user || 0,
          admin: res.data.admin || 0,
        });
      });
  }, []);

  return (
    <div className="dashboard-admin">
      <h2>Admin Dashboard</h2>
      <div className="card-container">
        <div className="card user" onClick={() => navigate('/admin/users/user')}>
          <h3>Total Users</h3>
          <span>{counts.user}</span>
        </div>
        <div className="card admin" onClick={() => navigate('/admin/users/admin')}>
          <h3>Total Admins</h3>
          <span>{counts.admin}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
