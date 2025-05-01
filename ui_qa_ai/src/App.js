import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/loginPage/Login';
import Register from './components/login/RegisterPage/Register';
import QuestionGenerator from './components/user/QuestionGeneratorPage/QuestionGenerator';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import HomeDashboard from './components/home/HomeDashboard';
import MainLayout from './components/sidebar/MainLayout';
import UserList from './components/admin/userManagement/UserList';
import DashboardAdmin from './components/admin/statistics/DashboardAdmin';
import Config from './components/admin/config/Config';
import ApiKeyManager from './components/admin/apikeyConfig/ApiKeyManager';
import TransactionHistory from './components/admin/Transaction/TransactionHistory';
import AdminBlogManager from './components/admin/blog/AdminBlogManager';
import RechargePage from './components/home/RechargePage';
import ChangePassword from './components/user/ChangePasswordPage/ChangePassword ';
import RequireAuth from './components/security/RequireAuth';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
            {/* Các route không cần sidebar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/homedashboard" element={<HomeDashboard />} />
            <Route path="/rechargepage" element={<RechargePage />} />
            <Route path="/" element={<HomeDashboard />} />

            {/* Các route dùng chung layout có sidebar */}
            <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
              {/* USER ROUTES */}
              <Route path="questiongenerator" element={<QuestionGenerator />} />
              <Route path="/changepassword" element={<ChangePassword />} />

              {/* ADMIN ROUTES */}
              <Route path="admin/dashboardadmin" element={<DashboardAdmin />} />
              <Route path="admin/userlist" element={<UserList />} />
              <Route path="admin/transactionhistory" element={<TransactionHistory />} />
              <Route path="admin/adminblogmanager" element={<AdminBlogManager />} />
              <Route path="admin/config" element={<Config />} />
              <Route path="admin/apikey" element={<ApiKeyManager />} />
            </Route>
          </Routes>
      </div>
    </Router>
  );
};

export default App;
