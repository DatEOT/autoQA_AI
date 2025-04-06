import React from 'react';
import HomeHeader from './HomeHeader';
import HomeHero from './HomeHero';
import Footer from './Footer';
import Blog from './Blog';
import Policy from './Policy';

function App() {
  return (
    <div className="app">
      <HomeHeader />
      <HomeHero />
      <Blog />
      <Policy />
      <Footer />
    </div>
  );
}

export default App;