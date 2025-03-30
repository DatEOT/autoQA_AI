import React, { useEffect, useState, useCallback  } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import './styleadmin/UserList.css';

const UserList = () => {
  const { role } = useParams();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = useCallback(() => {
    axios.get("http://127.0.0.1:8000/users/getUsers")
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
      // Update role only
      axios.put(`http://127.0.0.1:8000/users/updateUser/${editingId}?role=${form.role}`)
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
      // Create new user
      axios.post("http://127.0.0.1:8000/users/createUser", form)
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
        axios.delete(`http://127.0.0.1:8000/users/delete/${id}`)
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

  return (
    <div className="user-list">
      <h2>User Management</h2>

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

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleSubmit}>
          {editingId ? "Update" : "Create"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
