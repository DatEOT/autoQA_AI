import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeHero.css';
import cardImage from '../../../assets/images/imgdemo.jpg';

function HomeHero() {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate('/login');
  };

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-container">
          <div className="hero-content">
            <h1><span>Welcome to QnA application</span></h1>
            <button className="hero-button" onClick={handleOnClick}>Bắt đầu ngay</button>
          </div>
          <div className="hero-card">
            <img src={cardImage} alt="Question card preview" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
