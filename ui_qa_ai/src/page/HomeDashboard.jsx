import React from 'react';
import HomeHeader from '../components/home/HomeHeader';
import HomeHero from '../components/home/HomeHero';
import Footer from '../components/home/Footer';

function App() {
  return (
    <div className="app">
      <HomeHeader />
      <HomeHero />
      <Footer />
    </div>
  );
}

export default App;