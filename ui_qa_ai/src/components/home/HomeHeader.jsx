import React from 'react';
import './stylehome/HomeHeader.css';
import { Link } from 'react-router-dom';

function HomeHeader() {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-text">Ứng Dụng QA</span>
        <span className="logo-question">?</span>
      </div>
      <nav className="nav">
        <ul>
          <li><a href="#product">Product</a></li>
          <li><a href="#developer">Developer</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact Us</a></li>
          <li>
            <Link to="/login" className="login-btn">LOGIN</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default HomeHeader;
