import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import Register from './components/login/Register';
import Dashboard from './components/UI/Dashboard';
import './styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeDashboard from './page/HomeDashboard';
import AdminLayout from './components/admin/AdminLayout';
import UserList from './components/admin/UserList';
import DashboardAdmin from './components/admin/DashboardAdmin';
const App = () => {
  return (
    <Router>
      <div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/homedashboard" element={<HomeDashboard />} />
          <Route path="/" element={<HomeDashboard />} />

          {/* ADMIN NESTED ROUTES */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboardadmin" element={<DashboardAdmin />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/:role" element={<UserList />} />
            <Route path="settings" element={<div>Settings content</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
