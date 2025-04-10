import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
        <div className="logo-box">
            QnA application<span className="logo-question">?</span>
        </div>

          <div className="social-icons">
            <a href="linkedin"><i className="fab fa-linkedin-in"></i></a>
            <a href="twitter"><i className="fab fa-twitter"></i></a>
            <a href="facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="youtube"><i className="fab fa-youtube"></i></a>
          </div>
          <p className="footer-email">info@qna.com</p>
        </div>
        <div className="footer-right">
          <h3>Stay in Touch</h3>
          <p>Subscribe to our newsletter to get the latest news and updates on QnA.</p>
          <input type="email" placeholder="Enter your email address" />
          <div className="checkbox">
            <input type="checkbox" id="agree" />
            <label htmlFor="agree">
              Yes, I agree that Harbinger may contact me for news, updates, marketing and sales purposes. I confirm the processing of my Personal Data as per the terms in the <a href="submit">Privacy Policy</a>. I understand that I can opt-out of this communication at any time by selecting the unsubscribe option provided in every communication.
            </label>
          </div>
          <button className="submit-btn">Submit</button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
