import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import Register from './components/login/Register';
import Navbar from './components/login/Navbar';
import Dashboard from './components/UI/Dashboard';
import './styles.css';
import './auth.css';
import './ui.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (
    <Router>
      <div>
      <ToastContainer
          position="top-right" // Vị trí thông báo (góc trên bên phải)
          autoClose={3000} // Tự động đóng sau 3 giây
          hideProgressBar={false} // Hiển thị thanh tiến trình
          newestOnTop={false} // Thông báo mới không đè lên thông báo cũ
          closeOnClick // Đóng khi nhấp vào thông báo
          rtl={false} // Không đảo ngược (right-to-left)
          pauseOnFocusLoss // Tạm dừng khi mất focus
          draggable // Có thể kéo thông báo
          pauseOnHover // Tạm dừng khi di chuột qua
          theme="light" // Chủ đề sáng (có thể đổi thành "dark")
        />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;