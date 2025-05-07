import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Button, Tooltip, Input, Select, Table, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import './UserList.css';

const { Option } = Select;

const UserList = () => {
  const [state, setState] = useState({
    searchEmail: '',
    users: [],
    lastLogins: {},
    form: { email: '', password: '', role: 'user' },
    editingId: null,
    showCreateForm: false,
    showEditForm: false,
    isLoading: false
  });

  const { role } = useParams();
  const currentUserEmail = localStorage.getItem('email');
  const isSuperAdmin = currentUserEmail === 'admin@1234';

  const fetchLastLogin = useCallback((userId) => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/login_history/last_login/${userId}`, {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
          accept: 'application/json',
        },
      })
      .then((res) => {
        const time = new Date(res.data.last_login).toLocaleString('vi-VN');
        setState(prev => ({
          ...prev,
          lastLogins: { ...prev.lastLogins, [userId]: time }
        }));
      })
      .catch((err) => {
        console.error(`Failed to fetch last login for user ${userId}`, err);
        setState(prev => ({
          ...prev,
          lastLogins: { ...prev.lastLogins, [userId]: 'N/A' }
        }));
      });
  }, []);

  const fetchUsers = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    axios
      .get(`${process.env.REACT_APP_API_URL}/Usermanagement/getUsers`, {
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
        setState(prev => ({
          ...prev,
          users: data,
          isLoading: false
        }));
        data.forEach((user) => fetchLastLogin(user.id));
      })
      .catch((err) => {
        console.error('Error loading users:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      });
  }, [role, fetchLastLogin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      form: { ...prev.form, [name]: value }
    }));
  };

  const handleRoleChange = (value) => {
    setState(prev => ({
      ...prev,
      form: { ...prev.form, role: value }
    }));
  };

  const handleSubmit = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (state.editingId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Usermanagement/updateUser/${state.editingId}?role=${state.form.role}`,
          {},
          { headers: { 'API-Key': process.env.REACT_APP_API_KEY } }
        );
        toast.success('User updated successfully!');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/Usermanagement/createUser`, 
          state.form,
          { headers: { 'API-Key': process.env.REACT_APP_API_KEY } }
        );
        toast.success('User created successfully!');
      }

      setState(prev => ({
        ...prev,
        form: { email: '', password: '', role: 'user' },
        editingId: null,
        showCreateForm: false,
        showEditForm: false,
        isLoading: false
      }));
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      toast.error(`Failed to ${state.editingId ? 'update' : 'create'} user.`);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleEdit = (user) => {
    setState(prev => ({
      ...prev,
      editingId: user.id,
      form: { email: user.email, password: '', role: user.role },
      showEditForm: true,
      showCreateForm: false
    }));
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
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_API_URL}/Usermanagement/delete/${id}`, {
            headers: { 'API-Key': process.env.REACT_APP_API_KEY }
          })
          .then(() => {
            toast.success('User deleted successfully!');
            fetchUsers();
          })
          .catch((err) => {
            toast.error('Delete failed!');
            console.error('Delete error:', err);
          });
      }
    });
  };

  const handleSearch = () => {
    if (state.searchEmail.trim() === '') {
      fetchUsers();
    } else {
      const encodedEmail = encodeURIComponent(state.searchEmail);
      axios
        .get(`${process.env.REACT_APP_API_URL}/Usermanagement/getUserByEmail/${encodedEmail}`, {
          headers: { 'API-Key': process.env.REACT_APP_API_KEY }
        })
        .then((res) => {
          setState(prev => ({
            ...prev,
            users: [res.data]
          }));
          fetchLastLogin(res.data.id);
        })
        .catch(() => {
          toast.error('User not found!');
          setState(prev => ({ ...prev, users: [] }));
        });
    }
  };

  const toggleActive = (id, currentStatus) => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/Usermanagement/setActive/${id}?is_active=${!currentStatus}`,
        null,
        { headers: { 'API-Key': process.env.REACT_APP_API_KEY } }
      )
      .then(() => {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}!`);
        fetchUsers();
      })
      .catch(() => toast.error('Failed to update status!'));
  };

  const handleUpdateBalance = (id, action) => {
    Swal.fire({
      title: `${action === 'add' ? 'Add' : 'Subtract'} tokens`,
      input: 'number',
      inputLabel: 'Amount',
      inputAttributes: { min: 0.01, step: 0.01 },
      inputValidator: (value) => !value || isNaN(value) ? 'Please enter a valid number' : null,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const amount = parseFloat(result.value);
        const finalAmount = action === 'add' ? amount : -amount;

        axios
          .put(
            `${process.env.REACT_APP_API_URL}/Usermanagement/updateBalance/${id}?amount=${finalAmount}`,
            null,
            { headers: { 'API-Key': process.env.REACT_APP_API_KEY } }
          )
          .then(() => {
            toast.success(`Balance ${action === 'add' ? 'added' : 'subtracted'}!`);
            fetchUsers();
          })
          .catch((err) => {
            toast.error('Balance update failed');
            console.error('Balance error:', err);
          });
      }
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      filters: [
        { text: 'User', value: 'user' },
        { text: 'Admin', value: 'admin' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <span className={`role-badge ${role}`}>
          {role.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active) => (
        <span className={`status-badge ${is_active ? 'active' : 'inactive'}`}>
          {is_active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance) => (
        <span className="balance-value">
          {balance} <span className="token-icon">🪙</span>
        </span>
      ),
    },
    {
      title: 'Last Login',
      key: 'last_login',
      width: 180,
      render: (_, record) => state.lastLogins[record.id] || 'Loading...',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => {
        const isAdminRecord = record.role === 'admin';
        const disableDelete = isAdminRecord && !isSuperAdmin;
        
        return (
          <Space size="small">
            <Tooltip title="Edit">
              <Button 
                icon={<EditOutlined />} 
                shape="circle" 
                onClick={() => handleEdit(record)} 
              />
            </Tooltip>
            
            <Tooltip title={disableDelete ? "Can't delete admin" : "Delete"}>
              <Button
                danger
                icon={<DeleteOutlined />}
                shape="circle"
                disabled={disableDelete}
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
            
            <Tooltip title={record.is_active ? "Deactivate" : "Activate"}>
              <Button
                type={record.is_active ? "default" : "primary"}
                icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
                shape="circle"
                onClick={() => toggleActive(record.id, record.is_active)}
              />
            </Tooltip>
            
            <Tooltip title="Add tokens">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                shape="circle" 
                onClick={() => handleUpdateBalance(record.id, 'add')} 
              />
            </Tooltip>
            
            <Tooltip title="Subtract tokens">
              <Button 
                danger 
                icon={<MinusOutlined />} 
                shape="circle" 
                onClick={() => handleUpdateBalance(record.id, 'subtract')} 
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="user-management-container">
      <div className="user-management-header">      
        <div className="user-management-actions">
          <Input.Search
            placeholder="Search by email"
            value={state.searchEmail}
            onChange={(e) => {
              setState(prev => ({ ...prev, searchEmail: e.target.value }));
              if (e.target.value.trim() === '') fetchUsers();
            }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
          />
          
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setState(prev => ({
                ...prev,
                showCreateForm: !prev.showCreateForm,
                showEditForm: false,
                editingId: null,
                form: { email: '', password: '', role: 'user' }
              }));
            }}
          >
            {state.showCreateForm ? 'Cancel' : 'Create User'}
          </Button>
        </div>
      </div>

      {(state.showCreateForm || state.showEditForm) && (
        <div className="user-form-container">
          <div className="user-form">
            <Input
              placeholder="Email"
              name="email"
              value={state.form.email}
              onChange={handleChange}
              disabled={state.showEditForm}
              style={{ marginBottom: 12 }}
            />
            
            {state.showCreateForm && (
              <Input.Password
                placeholder="Password"
                name="password"
                value={state.form.password}
                onChange={handleChange}
                style={{ marginBottom: 12 }}
              />
            )}
            
            <Select
              value={state.form.role}
              onChange={handleRoleChange}
              style={{ width: '100%', marginBottom: 12 }}
            >
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
            
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={state.isLoading}
              block
            >
              {state.showEditForm ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </div>
      )}

      <div className="user-table-container">
        <Table
          columns={columns}
          dataSource={state.users}
          rowKey="id"
          loading={state.isLoading}
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </div>
    </div>
  );
};

export default UserList;