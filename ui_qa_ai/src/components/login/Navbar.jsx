import React from 'react';
// import { useNavigate } from 'react-router-dom';

const Navbar = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     alert('Đã đăng xuất!');
//     navigate('/login');
//   };

  return (
    <nav className="navbar">
      <h3>Ứng dụng QA</h3>
      {/* <button onClick={handleLogout}>Đăng xuất</button> */}
    </nav>
  );
};

export default Navbar;