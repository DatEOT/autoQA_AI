import React from 'react';
import './stylehome/HomeHero.css';
import cardImage from '../../assets/images/background.jpg';

function HomeHero() {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-container">
          <div className="hero-content">
            <h1><span>Welcome to QA application</span></h1>
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
