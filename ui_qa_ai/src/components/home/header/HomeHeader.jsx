import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./HomeHeader.css";

function HomeHeader() {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/config'}/website/1`, {
          headers: {
            "API-Key": process.env.REACT_APP_API_KEY
          }
        });
        if (data.logo) {
          setLogoUrl(data.logo);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <header className="main-header py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
      <div className="d-flex align-items-center">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="me-2 header-logo" />
        )}
      </div>
      <nav>
        <ul className="nav navbar-custom">
          <li className="nav-item">
              <Link to="/homedashboard" className="nav-link text-white">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/rechargepage" className="nav-link text-white">Recharge</Link>
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
