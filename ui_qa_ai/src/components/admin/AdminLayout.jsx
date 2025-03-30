import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './styleadmin/AdminLayout.css';
import { FaTachometerAlt, FaUsers, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa'; // Thêm biểu tượng từ react-icons

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(
    location.pathname.startsWith('/admin/users')
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/homedashboard');
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="logo">Admin</h2>
        <nav>
          <ul>
            <li>
              <Link to="/admin/dashboardadmin">
                <FaTachometerAlt className="menu-icon" /> Dashboard
              </Link>
            </li>
            
            <li>
              <div className="menu-parent" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <FaUsers className="menu-icon" /> Users
              </div>
              {userMenuOpen && (
                <ul className="submenu">
                  <li>
                    <Link to="/admin/users">
                      <FaUsers className="submenu-icon" /> User List
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/loginhistory">
                      <FaHistory className="submenu-icon" /> Login History
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link to="/admin/settings">
                <FaCog className="menu-icon" /> Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-right">
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
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