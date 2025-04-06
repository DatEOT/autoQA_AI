import React from 'react';
import { Link } from 'react-router-dom';
import "../home/stylehome/HomeHeader.css"
function HomeHeader() {
  return (
    <header className="bg-dark bg-opacity-75 backdrop-blur sticky-top py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
      <div className="d-flex align-items-center">
        <span className="fs-3 fw-bold text-white border border-white px-3 py-1">QnA App</span>
        <span className="ms-2 text-warning fs-5 fw-bold" style={{ transform: 'rotate(15deg)' }}>?</span>
      </div>
      <nav>
        <ul className="nav">
          <li className="nav-item">
            <a href="#product" className="nav-link text-white">Product</a>
          </li>
          <li className="nav-item">
            <a href="#developer" className="nav-link text-white">Developer</a>
          </li>
          <li className="nav-item">
            <a href="#pricing" className="nav-link text-white">Pricing</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link text-white">About Us</a>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link text-white">Contact Us</a>
          </li>
          <li className="nav-item">
            <Link to="/login" className="btn btn-outline-light fw-bold ms-3">LOGIN</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default HomeHeader;
