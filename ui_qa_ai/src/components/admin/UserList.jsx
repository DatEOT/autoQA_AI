import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import './styleadmin/UserList.css';

const UserList = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const { role } = useParams();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = useCallback(() => {
    axios.get("http://127.0.0.1:8000/Usermanagement/getUsers",
      {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
        },
      }
    )
      .then(res => {
        let data = res.data;
        if (role) {
          data = data.filter(user => user.role === role);
        }
        setUsers(data);
      })
      .catch(err => console.error("Error loading users:", err));
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (editingId) {
      axios.put(`http://127.0.0.1:8000/Usermanagement/updateUser/${editingId}?role=${form.role}`,
        {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
          },
        }
      )
        .then(() => {
          toast.success("User updated successfully!");
          setEditingId(null);
          setForm({ email: '', password: '', role: 'user' });
          fetchUsers();
        })
        .catch(err => {
          console.error("Error updating user:", err);
          toast.error("Failed to update user.");
        });
    } else {
      axios.post("http://127.0.0.1:8000/Usermanagement/createUser", form,
        {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
          },
        }
      )
        .then(() => {
          toast.success("User created successfully!");
          setForm({ email: '', password: '', role: 'user' });
          fetchUsers();
        })
        .catch(err => {
          console.error("Error creating user:", err);
          toast.error("Failed to create user.");
        });
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ email: user.email, password: '', role: user.role });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://127.0.0.1:8000/Usermanagement/delete/${id}`,
          {
            headers: {
              'API-Key': process.env.REACT_APP_API_KEY,
            },
          }
        )
          .then(() => {
            toast.success("User deleted successfully!");
            fetchUsers();
          })
          .catch((err) => {
            toast.error("Delete failed!");
            console.error("Lỗi xoá:", err);
          });
      }
    });
  };

  const handleSearch = () => {
    if (searchEmail.trim() === '') {
      fetchUsers();
    } else {
      const encodedEmail = encodeURIComponent(searchEmail);
      axios.get(`http://127.0.0.1:8000/Usermanagement/getUserByEmail/${encodedEmail}`,
        {
          headers: {
            'API-Key': process.env.REACT_APP_API_KEY,
          },
        }
      )
        .then(res => {
          setUsers([res.data]);
        })
        .catch(() => {
          toast.error("Không tìm thấy email!");
          setUsers([]);
        });
    }
  };

  const toggleActive = (id, currentStatus) => {
    axios.put(`http://127.0.0.1:8000/Usermanagement/setActive/${id}?is_active=${!currentStatus}`,
      {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
        },
      }
    )
      .then(() => {
        toast.success(`User has been ${!currentStatus ? 'unlocked' : 'locked'} successfully!`);
        fetchUsers();
      })
      .catch(() => {
        toast.error("Failed to update user status!");
      });
  };

  const handleUpdateBalance = (id, action) => {
    Swal.fire({
      title: `${action === "add" ? "Cộng" : "Trừ"} tiền cho user`,
      input: "number",
      inputLabel: "Nhập số tiền",
      inputAttributes: {
        min: 0.01,
        step: 0.01,
      },
      inputValidator: (value) => {
        if (!value || isNaN(value)) {
          return "Vui lòng nhập số hợp lệ";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        const amount = parseFloat(result.value);
        const finalAmount = action === "add" ? amount : -amount;

        axios
          .put(`http://127.0.0.1:8000/Usermanagement/updateBalance/${id}?amount=${finalAmount}`,
            {
              headers: {
                'API-Key': process.env.REACT_APP_API_KEY,
              },
            }
          )
          .then(() => {
            toast.success(`${action === "add" ? "Cộng" : "Trừ"} tiền thành công!`);
            fetchUsers();
          })
          .catch((err) => {
            toast.error("Lỗi cập nhật số dư");
            console.error("Balance error:", err);
          });
      }
    });
  };

  return (
    <div className="user-list">
      <h2>User Management</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="form-section">
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={editingId !== null}
        />

        {!editingId && (
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
        )}

        {editingId && (
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}

        <button onClick={handleSubmit}>
          {editingId ? "Update" : "Create"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>Role</th><th>Active</th><th>Balance</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_active ? '✅' : '❌'}</td>
              <td>${parseFloat(user.balance).toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                <button className="lock-btn" onClick={() => toggleActive(user.id, user.is_active)}>
                  {user.is_active ? "Lock" : "Unlock"}
                </button>
                <button className="balance-btn add-balance" onClick={() => handleUpdateBalance(user.id, "add")}>+ $</button>
                <button className="balance-btn sub-balance" onClick={() => handleUpdateBalance(user.id, "subtract")}>− $</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
