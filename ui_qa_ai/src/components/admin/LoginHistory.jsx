import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styleadmin/LoginHistory.css';

const LoginHistory = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/login_history/getAllHistory',
      {
        headers: {
          'API-Key': process.env.REACT_APP_API_KEY,
        },
      }
    )
      .then(res => setLogs(res.data))
      .catch(err => console.error("Failed to fetch login history:", err));
  }, []);

  return (
    <div className="login-history">
      <h2>Login History</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Login Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id_login_history}>
              <td>{log.id_login_history}</td>
              <td>{log.idUser}</td>
              <td>{new Date(log.login_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoginHistory;
