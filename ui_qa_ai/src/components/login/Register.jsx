import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import lockIcon from '../../assets/images/lock-icon.png';
import userIcon from '../../assets/images/user-icon.png';
import { toast } from 'react-toastify';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await axios.post('http://127.0.0.1:8000/authentication/register', {
        email,
        password,
      });
      toast.success('Đăng ký thành công!', {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
            });
      navigate('/login');
    } catch (err) {
      toast.error('Đăng ký thất bại!', {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
            }); // Hiển thị thông báo lỗi
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h2>Fill out the form below to register</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <img src={userIcon} alt="User Icon" className="input-icon" />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <img src={lockIcon} alt="Lock Icon" className="input-icon" />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
              <img src={lockIcon} alt="Lock Icon" className="input-icon" />
            </div>
          </div>
          <button type="submit">REGISTER</button>
        </form>
        <p className="register-link">
          Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
        </p>
      </div>
    </div>
  );
};

export default Register;