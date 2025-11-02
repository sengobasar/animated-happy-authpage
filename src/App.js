import React, { useState } from 'react';
import CosmicHero from './CosmicHero';
import Login from './Login';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  if (isLoggedIn) {
    return (
      <div style={styles.welcomePage}>
        <div style={styles.welcomeCard}>
          <h1>🎉 Welcome to the Cosmos, {userName}!</h1>
          <p style={styles.welcomeText}>You've successfully logged in</p>
          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setShowLogin(false);
            }} 
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div style={styles.pageContainer}>
        {/* Back button */}
        <button 
          onClick={() => setShowLogin(false)} 
          style={styles.backBtn}
        >
          ← Back to Cosmos
        </button>
        
        <Login 
          onLogin={(name) => {
            setUserName(name);
            setIsLoggedIn(true);
          }} 
        />
      </div>
    );
  }

  return (
    <div style={styles.heroPage}>
      {/* Cosmic Hero Section */}
      <CosmicHero />

      {/* Floating Login Button */}
      <button 
        onClick={() => setShowLogin(true)} 
        style={styles.loginBtn}
      >
        Enter Portal 🚀
      </button>
    </div>
  );
}

const styles = {
  heroPage: {
    position: 'relative',
    width: '100%',
    height: '100vh',
  },
  pageContainer: {
    position: 'relative',
  },
  loginBtn: {
    position: 'fixed',
    bottom: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '18px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
    zIndex: 100,
    transition: 'all 0.3s ease',
  },
  backBtn: {
    position: 'fixed',
    top: '30px',
    left: '30px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    zIndex: 100,
  },
  welcomePage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  welcomeCard: {
    background: 'white',
    padding: '60px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  welcomeText: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginTop: '10px',
    marginBottom: '30px',
  },
  logoutBtn: {
    padding: '15px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default App;
