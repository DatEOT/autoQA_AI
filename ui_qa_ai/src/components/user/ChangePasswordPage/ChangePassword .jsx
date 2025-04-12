import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import "./ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      const userId = localStorage.getItem('idUser');
      if (!userId) {
        toast.error('Không xác định được người dùng');
        return;
      }

      const formData = new URLSearchParams();
      formData.append('user_id', userId);
      formData.append('old_password', oldPassword);
      formData.append('new_password', newPassword);

      const response = await axios.put(
        'http://127.0.0.1:8000/Usermanagement/changePassword',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'API-Key': process.env.REACT_APP_API_KEY,
          },
        }
      );

      toast.success(response.data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="container mt-5 change-password-container" style={{ maxWidth: '400px' }}>
      <h3>Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>Mật khẩu cũ</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label>Mật khẩu mới</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label>Nhập lại mật khẩu mới</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label className="form-check-label" htmlFor="showPassword">
            Hiển thị mật khẩu
          </label>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Cập nhật
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
