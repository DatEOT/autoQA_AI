import React from 'react';
import HomeHeader from './header/HomeHeader';
import HomeHero from './slide/HomeHero';
import Footer from './footer/Footer';
import Blog from './blog/Blog';
import Policy from './policy/Policy';
import IntroStats from './Intro/IntroStats';

function App() {
  return (
    <div className="app">
      <HomeHeader />
      <HomeHero />
      <IntroStats />
      <Blog />
      <Policy />
      <Footer />
    </div>
  );
}

export default App;