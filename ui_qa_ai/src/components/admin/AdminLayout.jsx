import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './styleadmin/AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="logo">Admin Panel</h2>
        <nav>
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-right">
            <button className="logout-btn" onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
