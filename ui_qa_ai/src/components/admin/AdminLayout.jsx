import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  //CNavGroup,
  CNavItem,
  CNavTitle,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSpeedometer,
  cilUser,
  cilNotes,
  cilSettings,
  cilExitToApp,
  cilHistory
} from '@coreui/icons';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/homedashboard');
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <CSidebar className="border-end" colorScheme="dark">
        <CSidebarHeader className="border-bottom">
          <CSidebarBrand>Admin</CSidebarBrand>
        </CSidebarHeader>
        <CSidebarNav>
          <CNavTitle>Menu</CNavTitle>

          <CNavItem href="/admin/dashboardadmin" active={location.pathname === '/admin/dashboardadmin'}>
            <CIcon customClassName="nav-icon" icon={cilSpeedometer} /> Dashboard
          </CNavItem>
          <CNavItem href="/admin/users" active={location.pathname === '/admin/users'}>
            <CIcon customClassName="nav-icon" icon={cilUser} /> Users
          </CNavItem>
            <CNavItem href="/admin/transactionhistory" active={location.pathname === '/admin/transactionhistory'}>
            <CIcon customClassName="nav-icon" icon={cilHistory} /> Transaction History
            </CNavItem>
          <CNavItem href="/admin/adminblogmanager" active={location.pathname === '/admin/adminblogmanager'}>
            <CIcon customClassName="nav-icon" icon={cilNotes} /> Blog
          </CNavItem>
          <CNavItem href="/admin/settings" active={location.pathname === '/admin/settings'}>
            <CIcon customClassName="nav-icon" icon={cilSettings} /> Settings
          </CNavItem>

          <CNavItem className="px-3">
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

export default AdminLayout;
