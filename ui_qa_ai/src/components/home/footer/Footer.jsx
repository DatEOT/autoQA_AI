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
        <div className="footer-column footer-brand">
          {configData.logo ? (
            <img src={configData.logo} alt={configData.websiteName} className="footer-logo" />
          ) : (
            <div className="logo-placeholder">
              {configData.websiteName || 'QnA Application'}
              <span className="logo-question">?</span>
            </div>
          )}
          <p className="footer-description">
            Your trusted partner for quality services and solutions.
          </p>
          <div className="social-icons">
            {configData.facebook && (
              <a href={configData.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
            )}
            {configData.tiktok && (
              <a href={configData.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <i className="fab fa-tiktok"></i>
              </a>
            )}
            {configData.zalo && (
              <a href={configData.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo" className="social-icon-text">
                <i className="fas fa-comment-dots"></i>
              </a>
            )}
          </div>
        </div>

        <div className="footer-column footer-links">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-nav">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h3 className="footer-heading">Contact Us</h3>
          <div className="contact-info">
            {configData.phoneNumber1 && (
              <div className="contact-item">
                <i className="fas fa-phone-alt"></i>
                <a href={`tel:${configData.phoneNumber1}`}>{configData.phoneNumber1}</a>
              </div>
            )}
            {configData.phoneNumber2 && (
              <div className="contact-item">
                <i className="fas fa-phone-alt"></i>
                <a href={`tel:${configData.phoneNumber2}`}>{configData.phoneNumber2}</a>
              </div>
            )}
            {configData.address && (
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{configData.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="footer-column footer-map">
          <h3 className="footer-heading">Our Location</h3>
          {configData.address && mapUrl ? (
            <iframe
              className="google-map"
              src={mapUrl}
              width="100%"
              height="200"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map"
            ></iframe>
          ) : (
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <p>Address not available</p>
            </div>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} {configData.websiteName || 'QnA Application'}. All rights reserved.</p>
          <div className="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;