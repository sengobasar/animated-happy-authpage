import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [characterState, setCharacterState] = useState('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const [isYellowWobbling, setIsYellowWobbling] = useState(false);
  
  // Individual expressions for each shape
  const [expressions, setExpressions] = useState({
    purple: 'smile',
    orange: 'smile',
    black: 'smile',
    yellow: 'smile',
  });

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseTime = useRef(Date.now());
  
  const shapeRefs = {
    purple: useRef(null),
    orange: useRef(null),
    black: useRef(null),
    yellow: useRef(null),
  };

  const [eyePositions, setEyePositions] = useState({
    purple: { x: 0, y: 0 },
    orange: { x: 0, y: 0 },
    black: { x: 0, y: 0 },
    yellow: { x: 0, y: 0 },
  });

  // Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (characterState !== 'password') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, [characterState]);

  // Random expression changes - MORE SMILES!
  useEffect(() => {
    const expressionInterval = setInterval(() => {
      if (characterState === 'idle') {
        const shapes = ['purple', 'orange', 'black', 'yellow'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // 70% chance of smile, 20% wide-smile, 10% surprised
        const rand = Math.random();
        let randomExpression;
        if (rand < 0.7) {
          randomExpression = 'smile';
        } else if (rand < 0.9) {
          randomExpression = 'wide-smile';
        } else {
          randomExpression = 'surprised';
        }
        
        setExpressions(prev => ({
          ...prev,
          [randomShape]: randomExpression,
        }));

        // Reset after 2.5 seconds
        setTimeout(() => {
          setExpressions(prev => ({
            ...prev,
            [randomShape]: 'smile', // Back to smile (not normal)
          }));
        }, 2500);
      }
    }, 2500); // More frequent (every 2.5 seconds instead of 4)

    return () => clearInterval(expressionInterval);
  }, [characterState]);

  // Track mouse and calculate speed - LESS SENSITIVE
  useEffect(() => {
    const handleMouse = (e) => {
      const now = Date.now();
      const timeDiff = now - lastMouseTime.current;
      
      if (timeDiff > 0) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - lastMousePos.current.x, 2) +
          Math.pow(e.clientY - lastMousePos.current.y, 2)
        );
        const speed = distance / timeDiff;
        setMouseSpeed(speed);

        // Increased threshold: only wobbles at VERY fast movement (3.0 instead of 1.5)
        if (speed > 3.0 && !isYellowWobbling) {
          setIsYellowWobbling(true);
          setTimeout(() => setIsYellowWobbling(false), 1000);
        }
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseTime.current = now;
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [isYellowWobbling]);

  // Calculate eye positions for each shape
  useEffect(() => {
    if (characterState === 'password') return;

    const newPositions = {};

    Object.keys(shapeRefs).forEach((key) => {
      if (!shapeRefs[key].current) return;

      const rect = shapeRefs[key].current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = mousePos.x - centerX;
      const deltaY = mousePos.y - centerY;
      const angle = Math.atan2(deltaY, deltaX);

      const distance = Math.min(
        Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 20,
        7
      );

      newPositions[key] = {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });

    setEyePositions(newPositions);
  }, [mousePos, characterState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email && password) {
      setCharacterState('happy');
      setExpressions({
        purple: 'wide-smile',
        orange: 'wide-smile',
        black: 'wide-smile',
        yellow: 'wide-smile',
      });
      setTimeout(() => {
        onLogin(email.split('@')[0]);
      }, 1500);
    } else {
      setCharacterState('sad');
      setExpressions({
        purple: 'sad',
        orange: 'sad',
        black: 'sad',
        yellow: 'sad',
      });
      setTimeout(() => {
        setCharacterState('idle');
        setExpressions({
          purple: 'smile',
          orange: 'smile',
          black: 'smile',
          yellow: 'smile',
        });
      }, 1500);
    }
  };

  // Render eyes
  const renderEyes = (shapeKey, size = 'medium', spacing = 30) => {
    const eyeSizes = {
      small: { eye: 20, pupil: 8 },
      medium: { eye: 24, pupil: 10 },
      large: { eye: 28, pupil: 12 },
    };

    const { eye, pupil } = eyeSizes[size];
    const expression = expressions[shapeKey];

    return (
      <div style={{ display: 'flex', gap: `${spacing}px` }}>
        {[0, 1].map((index) => (
          <motion.div
            key={index}
            style={{
              width: `${eye}px`,
              height: `${eye}px`,
              background: 'white',
              borderRadius: '50%',
              position: 'relative',
              border: '2px solid rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            animate={
              isBlinking || characterState === 'password'
                ? { scaleY: 0.1 }
                : expression === 'wide-smile' || characterState === 'happy'
                ? { scaleY: 0.7, scaleX: 1.3 }
                : expression === 'surprised'
                ? { scaleY: 1.4, scaleX: 1.2 }
                : { scaleY: 1, scaleX: 1 }
            }
            transition={{ duration: 0.15 }}
          >
            <motion.div
              style={{
                width: `${pupil}px`,
                height: `${pupil}px`,
                background: '#1a1a2e',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                x: eyePositions[shapeKey]?.x || 0,
                y: eyePositions[shapeKey]?.y || 0,
                scale: expression === 'surprised' ? 1.3 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  width: '35%',
                  height: '35%',
                  background: 'white',
                  borderRadius: '50%',
                  opacity: 0.8,
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render mouth with different expressions
  const renderMouth = (shapeKey, color = 'rgba(0,0,0,0.6)') => {
    const expression = expressions[shapeKey];

    return (
      <motion.div
        style={{
          marginTop: '10px',
        }}
        animate={{
          width: 
            expression === 'wide-smile' || characterState === 'happy' ? '55px' :
            expression === 'smile' ? '45px' :
            expression === 'surprised' ? '25px' :
            characterState === 'sad' ? '40px' : '40px',
          height: 
            expression === 'wide-smile' || characterState === 'happy' ? '25px' :
            expression === 'smile' ? '15px' : // Smaller smile height
            expression === 'surprised' ? '25px' :
            characterState === 'sad' ? '3px' : '15px', // Default smile
          borderRadius: 
            expression === 'wide-smile' || characterState === 'happy' ? '0 0 30px 30px' :
            expression === 'smile' ? '0 0 22px 22px' :
            expression === 'surprised' ? '50%' :
            characterState === 'sad' ? '30px 30px 0 0' : '0 0 22px 22px',
          background: 
            expression === 'wide-smile' || expression === 'smile' || characterState === 'happy' ? color :
            expression === 'surprised' ? color : 'transparent',
          border: `2px solid ${color}`,
        }}
        transition={{ duration: 0.3 }}
      />
    );
  };

  return (
    <div style={styles.page}>
      {/* Floating sparkles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            ...styles.sparkle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          ✨
        </motion.div>
      ))}

      <div style={styles.container}>
        
        {/* Character Section */}
        <div style={styles.characterSection}>
          <div style={styles.shapesContainer}>
            
            {/* Purple Rectangle */}
            <motion.div
              ref={shapeRefs.purple}
              style={styles.purpleRect}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div style={styles.shapeFace}>
                {renderEyes('purple', 'medium', 25)}
                {renderMouth('purple', 'rgba(255,255,255,0.5)')}
              </div>
            </motion.div>

            {/* Black Rectangle */}
            <motion.div
              ref={shapeRefs.black}
              style={styles.blackRect}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            >
              <div style={styles.shapeFace}>
                {renderEyes('black', 'small', 20)}
                {renderMouth('black', 'rgba(255,255,255,0.4)')}
              </div>
            </motion.div>

            {/* Orange Half Circle */}
            <motion.div
              ref={shapeRefs.orange}
              style={styles.orangeHalf}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <div style={{...styles.shapeFace, marginTop: '-20px'}}>
                {renderEyes('orange', 'small', 30)}
                {renderMouth('orange', 'rgba(0,0,0,0.5)')}
              </div>
            </motion.div>

            {/* Yellow Rectangle - Less sensitive wobble */}
            <motion.div
              ref={shapeRefs.yellow}
              style={styles.yellowRect}
              animate={
                isYellowWobbling
                  ? {
                      rotate: [0, -15, 12, -8, 5, -3, 0],
                      y: [0, -10, 5, -3, 0],
                    }
                  : {
                      y: [0, -7, 0],
                    }
              }
              transition={
                isYellowWobbling
                  ? {
                      duration: 0.8,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.5,
                    }
              }
            >
              <div style={styles.shapeFace}>
                {renderEyes('yellow', 'medium', 20)}
                {renderMouth('yellow', 'rgba(0,0,0,0.5)')}
              </div>
              
              {/* Sweat drop when wobbling */}
              {isYellowWobbling && (
                <motion.div
                  style={styles.sweatDrop}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 30, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  💧
                </motion.div>
              )}
            </motion.div>

            {/* Hands when password */}
            <motion.div
              style={styles.hands}
              animate={
                characterState === 'password'
                  ? { 
                      y: -200,
                      opacity: 1,
                    }
                  : { 
                      y: 100,
                      opacity: 0,
                    }
              }
              transition={{ duration: 0.4 }}
            >
              <span style={styles.hand}>🤚</span>
              <span style={styles.hand}>🤚</span>
              <span style={styles.hand}>🤚</span>
              <span style={styles.hand}>🤚</span>
            </motion.div>

            {/* Hearts when happy */}
            {characterState === 'happy' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      ...styles.heart,
                      left: `${10 + i * 12}%`,
                    }}
                    initial={{ y: 100, opacity: 0, scale: 0 }}
                    animate={{ 
                      y: -80, 
                      opacity: [0, 1, 0.7, 0],
                      scale: [0, 1.4, 1, 0.6],
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      repeat: 1,
                    }}
                  >
                    💖
                  </motion.div>
                ))}
              </>
            )}

            {/* Speed indicator - only shows at VERY high speed now */}
            {mouseSpeed > 3.0 && (
              <motion.div
                style={styles.speedIndicator}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                💨 Whoa!
              </motion.div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div style={styles.formSection}>
          <motion.h1 
            style={styles.title}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome Back! 👋
          </motion.h1>
          <motion.p 
            style={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Enter your credentials to continue
          </motion.p>

          <form onSubmit={handleSubmit}>
            <motion.div 
              style={styles.formGroup}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setCharacterState('email')}
                onBlur={() => setCharacterState('idle')}
                placeholder="your@email.com"
                style={styles.input}
              />
            </motion.div>

            <motion.div 
              style={styles.formGroup}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setCharacterState('password')}
                onBlur={() => setCharacterState('idle')}
                placeholder="••••••••"
                style={styles.input}
              />
            </motion.div>

            <motion.button
              type="submit"
              style={styles.button}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 15px 35px rgba(102, 126, 234, 0.35)',
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Login
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: '12px',
    zIndex: 0,
  },
  container: {
    background: 'white',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 30px 90px rgba(0,0,0,0.25)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    maxWidth: '950px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  characterSection: {
    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
    padding: '60px 40px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shapesContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0',
    position: 'relative',
    height: '300px',
  },
  purpleRect: {
    width: '120px',
    height: '240px',
    background: 'linear-gradient(180deg, #7c4dff 0%, #651fff 100%)',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(124, 77, 255, 0.4)',
    position: 'relative',
    zIndex: 4,
  },
  blackRect: {
    width: '100px',
    height: '180px',
    background: 'linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%)',
    borderRadius: '15px 15px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    marginLeft: '-15px',
    zIndex: 3,
  },
  orangeHalf: {
    width: '140px',
    height: '140px',
    background: 'linear-gradient(180deg, #ff9800 0%, #f57c00 100%)',
    borderRadius: '140px 140px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '20px',
    boxShadow: '0 10px 30px rgba(255, 152, 0, 0.4)',
    position: 'relative',
    marginLeft: '-20px',
    zIndex: 2,
  },
  yellowRect: {
    width: '110px',
    height: '200px',
    background: 'linear-gradient(180deg, #ffd54f 0%, #ffc107 100%)',
    borderRadius: '18px 18px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(255, 193, 7, 0.4)',
    position: 'relative',
    marginLeft: '-25px',
    zIndex: 1,
    transformOrigin: 'bottom center',
  },
  shapeFace: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  sweatDrop: {
    position: 'absolute',
    top: '20%',
    right: '15%',
    fontSize: '20px',
  },
  hands: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    gap: '20px',
    fontSize: '50px',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))',
    zIndex: 10,
  },
  hand: {
    display: 'block',
  },
  heart: {
    position: 'absolute',
    bottom: '0',
    fontSize: '28px',
    pointerEvents: 'none',
    zIndex: 5,
  },
  speedIndicator: {
    position: 'absolute',
    top: '10%',
    right: '10%',
    fontSize: '24px',
    background: 'rgba(255,255,255,0.9)',
    padding: '10px 20px',
    borderRadius: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    zIndex: 5,
  },
  formSection: {
    padding: '60px 50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: 'white',
  },
  title: {
    fontSize: '36px',
    color: '#2c3e50',
    marginBottom: '12px',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '40px',
  },
  formGroup: {
    marginBottom: '28px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: '15px',
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'all 0.3s ease',
  },
};

export default Login;
