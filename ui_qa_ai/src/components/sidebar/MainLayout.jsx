// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CSidebar,
  CSidebarNav,
  CNavItem,
  CNavTitle,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSpeedometer,
  cilUser,
  cilNotes,
  cilExitToApp,
  cilHistory,
  cilList,
  cilWallet,
} from '@coreui/icons';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const balance = localStorage.getItem('balance');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/homedashboard');
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <CSidebar className="border-end" colorScheme="dark">
        <CSidebarNav>
        <CNavTitle>User Info</CNavTitle>
          <div className="px-3 text-white small">
            <strong>Email:</strong> {email}
          </div>
          {role === 'user' && (
            <div className="px-3 text-white small mb-2">
              <strong>Token:</strong> {balance}
            </div>
          )}

          <CNavTitle>Menu</CNavTitle>

          {role === 'admin' ? (
            <>
              <CNavItem href="/admin/dashboardadmin" active={location.pathname === '/admin/dashboardadmin'}>
                <CIcon customClassName="nav-icon" icon={cilSpeedometer} /> Dashboard
              </CNavItem>
              <CNavItem href="/admin/userlist" active={location.pathname === '/admin/userlist'}>
                <CIcon customClassName="nav-icon" icon={cilUser} /> Users
              </CNavItem>
              <CNavItem href="/admin/transactionhistory" active={location.pathname === '/admin/transactionhistory'}>
                <CIcon customClassName="nav-icon" icon={cilHistory} /> Transaction History
              </CNavItem>
              <CNavItem href="/admin/adminblogmanager" active={location.pathname === '/admin/adminblogmanager'}>
                <CIcon customClassName="nav-icon" icon={cilNotes} /> Blog
              </CNavItem>
            </>
          ) : (
            <>
              <CNavItem href="/questiongenerator" active={location.pathname === '/questiongenerator'}>
                <CIcon customClassName="nav-icon" icon={cilList} /> Tạo câu hỏi
              </CNavItem>
              <CNavItem href="/changepassword" active={location.pathname === '/changepassword'}>
                <CIcon customClassName="nav-icon" icon={cilWallet} /> Đổi mật khẩu
              </CNavItem>
            </>
          )}

          <CNavItem className="px-3 mt-3">
            <button
              onClick={handleLogout}
              className="btn btn-outline-light w-100 d-flex align-items-center gap-2"
            >
              <CIcon customClassName="nav-icon" icon={cilExitToApp} />
              Logout
            </button>
          </CNavItem>
        </CSidebarNav>
      </CSidebar>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="p-4 bg-light flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
