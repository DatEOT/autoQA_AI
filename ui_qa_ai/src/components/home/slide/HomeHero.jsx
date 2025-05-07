import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeHero.css';
import cardImage from '../../../assets/images/imgdemo.jpg';

const HomeHero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span>Welcome to QnA application</span>
            </h1>
            <button 
              className="hero-button" 
              onClick={handleGetStarted}
              aria-label="Get started"
            >
              Bắt đầu ngay
            </button>
          </div>
          
          <div className="hero-card">
            <img 
              src={cardImage} 
              alt="Question card preview" 
              className="hero-card-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;