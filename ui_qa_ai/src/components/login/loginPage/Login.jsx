import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import lockIcon from '../../../assets/images/lock-icon.png';
import userIcon from '../../../assets/images/user-icon.png';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/authentication/login',
        { email, password },
        {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
          },
        }
      );
  
      const { access_token, role, balance, idUser  } = response.data;
  
      // 👇 Chặn user nếu hết token
      if (role === 'user' && (balance === null || balance <= 0)) {
        setError('Tài khoản của bạn không đủ token để sử dụng.');
        toast.error('Token đã hết, vui lòng nạp thêm!');
        return;
      }
  
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('email', email);
      localStorage.setItem('balance', balance);
      localStorage.setItem('idUser', idUser);

  
      toast.success('Đăng nhập thành công!', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light',
      });
  
      navigate(role === 'admin' ? '/admin/dashboardadmin' : '/questiongenerator');
    } catch (err) {
      if (err.response?.data?.detail === 'Tài khoản đã bị khóa') {
        setError('Tài khoản của bạn đã bị khóa.');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
      }
  
      toast.error('Đăng nhập thất bại!', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light',
      });
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h1>LOGIN</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="off"
              />
              <img src={userIcon} alt="User Icon" className="input-icon" />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="off"
              />
              <img src={lockIcon} alt="Lock Icon" className="input-icon" />
            </div>
          </div>
          <div className="form-options">
            <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>
          </div>
          <button type="submit">LOGIN</button>
        </form>
        <p className="register-link">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
