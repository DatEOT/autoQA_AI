import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Footer.css';

function Footer() {
  const [configData, setConfigData] = useState({
    logo: '',
    websiteName: '',
    phoneNumber1: '',
    phoneNumber2: '',
    address: '',
    facebook: '',
    tiktok: '',
    zalo: ''
  });

  useEffect(() => {
    const idConfig = 1;
    const apiKey = process.env.REACT_APP_API_KEY; 
    const apiUrl = process.env.REACT_APP_API_URL;

    axios.get(`${apiUrl}/config/website/${idConfig}`, {
      headers: { 'API-Key': apiKey }
    })
      .then((res) => {
        setConfigData(prev => ({ ...prev, logo: res.data.logo, websiteName: res.data.websiteName }));
      })
      .catch((err) => console.error('Error fetching website config:', err));

    axios.get(`${apiUrl}/config/contact/${idConfig}`, {
      headers: { 'API-Key': apiKey }
    })
      .then((res) => {
        setConfigData(prev => ({
          ...prev,
          phoneNumber1: res.data.phoneNumber1,
          phoneNumber2: res.data.phoneNumber2,
          address: res.data.address
        }));
      })
      .catch((err) => console.error('Error fetching contact config:', err));

    axios.get(`${apiUrl}/config/social-media/${idConfig}`, {
      headers: { 'API-Key': apiKey }
    })
      .then((res) => {
        setConfigData(prev => ({
          ...prev,
          facebook: res.data.facebook,
          tiktok: res.data.tiktok,
          zalo: res.data.zalo
        }));
      })
      .catch((err) => console.error('Error fetching social media config:', err));
  }, []);

  const mapUrl = configData.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(configData.address)}&output=embed`
    : '';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column footer-left">
          {configData.logo ? (
            <img src={configData.logo} alt={configData.websiteName} className="footer-logo" />
          ) : (
            <div className="logo-placeholder">
              {configData.websiteName || 'QnA Application'}
              <span className="logo-question">?</span>
            </div>
          )}
          <div className="contact-info">
            {configData.phoneNumber1 && (
              <p className="footer-phone">Điện thoại 1: {configData.phoneNumber1}</p>
            )}
            {configData.phoneNumber2 && (
              <p className="footer-phone">Điện thoại 2: {configData.phoneNumber2}</p>
            )}
            {configData.address && (
              <p className="footer-address">Địa chỉ: {configData.address}</p>
            )}
          </div>
          <div className="social-icons">
            {configData.facebook && (
              <a href={configData.facebook} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
            )}
            {configData.tiktok && (
              <a href={configData.tiktok} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-tiktok"></i>
              </a>
            )}
            {configData.zalo && (
              <a href={configData.zalo} target="_blank" rel="noopener noreferrer" className="social-icon-text">Zalo</a>
            )}
          </div>
        </div>
        <div className="footer-column footer-middle">
          <h3 className="footer-heading">COMPANY</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-column footer-right">
          {configData.address && mapUrl ? (
            <iframe
              className="google-map"
              src={mapUrl}
              width="100%"
              height="300"
              style={{ border: '2px solid white' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            ></iframe>
          ) : (
            <p>Đang tải bản đồ hoặc địa chỉ không hợp lệ...</p>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} QnA Application. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;