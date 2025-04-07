import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Button } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';
import './styleadmin/UserList.css';

const UserList = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const { role } = useParams();
  const [users, setUsers] = useState([]);
  const [lastLogins, setLastLogins] = useState({});
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchLastLogin = (userId) => {
    axios
      .get(`http://127.0.0.1:8000/login_history/last_login/${userId}`, {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
          accept: 'application/json',
        },
      })
      .then((res) => {
        const time = new Date(res.data.last_login).toLocaleString('vi-VN');
        setLastLogins((prev) => ({ ...prev, [userId]: time }));
      })
      .catch((err) => {
        console.error(`Failed to fetch last login for user ${userId}`, err);
        setLastLogins((prev) => ({ ...prev, [userId]: 'N/A' }));
      });
  };

  const fetchUsers = useCallback(() => {
    axios
      .get('http://127.0.0.1:8000/Usermanagement/getUsers', {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
          accept: 'application/json',
        },
      })
      .then((res) => {
        let data = res.data;
        if (role) {
          data = data.filter((user) => user.role === role);
        }
        setUsers(data);
        data.forEach((user) => fetchLastLogin(user.id));
      })
      .catch((err) => console.error('Error loading users:', err));
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (editingId) {
      axios
        .put(
          `http://127.0.0.1:8000/Usermanagement/updateUser/${editingId}?role=${form.role}`,
          {},
          {
            headers: {
              'API-Key': process.env.REACT_APP_API_KEY,
              accept: 'application/json',
            },
          }
        )
        .then(() => {
          toast.success('User updated successfully!');
          setEditingId(null);
          setForm({ email: '', password: '', role: 'user' });
          fetchUsers();
        })
        .catch((err) => {
          console.error('Error updating user:', err);
          toast.error('Failed to update user.');
        });
    } else {
      axios
        .post('http://127.0.0.1:8000/Usermanagement/createUser', form, {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
            accept: 'application/json',
          },
        })
        .then(() => {
          toast.success('User created successfully!');
          setForm({ email: '', password: '', role: 'user' });
          fetchUsers();
        })
        .catch((err) => {
          console.error('Error creating user:', err);
          toast.error('Failed to create user.');
        });
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ email: user.email, password: '', role: user.role });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://127.0.0.1:8000/Usermanagement/delete/${id}`, {
            headers: {
              'API-Key': process.env.REACT_APP_API_KEY,
              accept: 'application/json',
            },
          })
          .then(() => {
            toast.success('User deleted successfully!');
            fetchUsers();
          })
          .catch((err) => {
            toast.error('Delete failed!');
            console.error('Lỗi xoá:', err);
          });
      }
    });
  };

  const handleSearch = () => {
    if (searchEmail.trim() === '') {
      fetchUsers();
    } else {
      const encodedEmail = encodeURIComponent(searchEmail);
      axios
        .get(`http://127.0.0.1:8000/Usermanagement/getUserByEmail/${encodedEmail}`, {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
            accept: 'application/json',
          },
        })
        .then((res) => {
          setUsers([res.data]);
          fetchLastLogin(res.data.id);
        })
        .catch(() => {
          toast.error('Không tìm thấy email!');
          setUsers([]);
        });
    }
  };

  const toggleActive = (id, currentStatus) => {
    axios
      .put(
        `http://127.0.0.1:8000/Usermanagement/setActive/${id}?is_active=${!currentStatus}`,
        null,
        {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
            accept: 'application/json',
          },
        }
      )
      .then(() => {
        toast.success(`User has been ${!currentStatus ? 'unlocked' : 'locked'} successfully!`);
        fetchUsers();
      })
      .catch(() => {
        toast.error('Failed to update user status!');
      });
  };

  const handleUpdateBalance = (id, action) => {
    Swal.fire({
      title: `${action === 'add' ? 'Cộng' : 'Trừ'} tiền cho user`,
      input: 'number',
      inputLabel: 'Nhập số tiền',
      inputAttributes: {
        min: 0.01,
        step: 0.01,
      },
      inputValidator: (value) => {
        if (!value || isNaN(value)) {
          return 'Vui lòng nhập số hợp lệ';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const amount = parseFloat(result.value);
        const finalAmount = action === 'add' ? amount : -amount;

        axios
          .put(
            `http://127.0.0.1:8000/Usermanagement/updateBalance/${id}?amount=${finalAmount}`,
            null,
            {
              headers: {
                'API-Key': process.env.REACT_APP_API_KEY,
                accept: 'application/json',
              },
            }
          )
          .then(() => {
            toast.success(`${action === 'add' ? 'Cộng' : 'Trừ'} tiền thành công!`);
            fetchUsers();
          })
          .catch((err) => {
            toast.error('Lỗi cập nhật số dư');
            console.error('Balance error:', err);
          });
      }
    });
  };

  return (
    <div className="user-list">
      <h2>User Management</h2>

      <div className="form-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              // Nếu ô tìm kiếm trở nên rỗng, tự động reset bảng để hiển thị tất cả user
              if (e.target.value.trim() === '') {
                fetchUsers();
              }
            }}
            className="form-control d-inline-block w-auto mr-2"
          />
          <button onClick={handleSearch} >Search</button>
        </div>

        <button
          onClick={() => {
            if (showEditForm) {
              setShowEditForm(false);
              setEditingId(null);
            } else {
              setShowCreateForm(!showCreateForm);
            }
            setForm({ email: '', password: '', role: 'user' });
          }}
          className="create-user-btn"
        >
          {showEditForm ? 'Close Edit' : showCreateForm ? 'Close Create Form' : 'CreateUser'}
        </button>

        {showCreateForm && (
          <>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <button onClick={handleSubmit}>Create</button>
          </>
        )}

        {showEditForm && (
          <>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              disabled
            />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleSubmit}>Update</button>
          </>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Balance</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_active ? '✅' : '❌'}</td>
              <td>{user.balance} 🪙</td>
              <td>{lastLogins[user.id] || 'Loading...'}</td>
              <td>
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  shape="circle"
                  onClick={() => handleEdit(user)}
                />
                <Button
                  danger
                  type="default"
                  icon={<DeleteOutlined />}
                  shape="circle"
                  onClick={() => handleDelete(user.id)}
                />
                <Button
                  type="primary"
                  ghost
                  icon={user.is_active ? <LockOutlined /> : <UnlockOutlined />}
                  shape="circle"
                  onClick={() => toggleActive(user.id, user.is_active)}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  shape="circle"
                  onClick={() => handleUpdateBalance(user.id, 'add')}
                />
                <Button
                  type="primary"
                  danger
                  icon={<MinusOutlined />}
                  shape="circle"
                  onClick={() => handleUpdateBalance(user.id, 'subtract')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
