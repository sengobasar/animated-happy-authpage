import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Golden Spiral Particles Component
function GoldenSpiralParticles({ mousePosition }) {
  const particlesRef = useRef();
  const particleCount = 1000;

  // Generate golden spiral positions
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = i * goldenAngle;
      const radius = 15 * Math.sqrt(t);

      // Golden spiral trajectory
      const x = radius * Math.cos(angle);
      const y = (t - 0.5) * 20; // Vertical spread
      const z = radius * Math.sin(angle);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradient (purple to cyan)
      const color = new THREE.Color();
      color.setHSL(0.6 + t * 0.2, 0.8, 0.5 + t * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = Math.random() * 2 + 0.5;
    }

    return { positions, colors, scales };
  }, [particleCount]);

  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Original position
      const x = particles.positions[i3];
      const y = particles.positions[i3 + 1];
      const z = particles.positions[i3 + 2];

      // Rotate around Y-axis (spiral rotation)
      const angle = time * 0.2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      positions[i3] = x * cosA - z * sinA;
      positions[i3 + 2] = x * sinA + z * cosA;

      // Mouse influence (depth-aware)
      const mouseInfluence = 0.5;
      const distance = Math.sqrt(
        Math.pow(positions[i3] - mousePosition.x * 5, 2) +
        Math.pow(positions[i3 + 2] - mousePosition.y * 5, 2)
      );
      
      const force = Math.max(0, 1 - distance / 10);
      positions[i3] += (mousePosition.x * mouseInfluence * force);
      positions[i3 + 1] += (mousePosition.y * mouseInfluence * force * 0.5);
      positions[i3 + 2] += (mousePosition.y * mouseInfluence * force);

      // Floating wave effect
      positions[i3 + 1] = y + Math.sin(time + i * 0.1) * 0.5;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={particleCount}
          array={particles.scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Rotating Cosmic Ring
function CosmicRing() {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.3;
      ringRef.current.rotation.y += 0.003;
      ringRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[8, 0.3, 16, 100]} />
      <meshStandardMaterial
        color="#764ba2"
        emissive="#667eea"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

// Center Glowing Sphere
function CenterSphere() {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      sphereRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color="#667eea"
        emissive="#764ba2"
        emissiveIntensity={1}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// Main Cosmic Hero Component
function CosmicHero() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    });
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={styles.heroContainer}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={styles.canvas}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#667eea" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#764ba2" />

        {/* Background Stars */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Main Elements */}
        <CenterSphere />
        <CosmicRing />
        <GoldenSpiralParticles mousePosition={mousePosition} />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={10}
          maxDistance={40}
        />
      </Canvas>

      {/* Overlay Text */}
      <div style={styles.overlay}>
        <h1 style={styles.title}>Welcome to the Cosmos</h1>
        <p style={styles.subtitle}>
          Experience the beauty of the golden spiral
        </p>
      </div>
    </div>
  );
}

const styles = {
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    background: '#0a0a0a',
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: 'white',
    zIndex: 10,
    pointerEvents: 'none',
  },
  title: {
    fontSize: '64px',
    fontWeight: '700',
    margin: '0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 40px rgba(102, 126, 234, 0.5)',
  },
  subtitle: {
    fontSize: '24px',
    margin: '20px 0 0 0',
    color: 'rgba(255, 255, 255, 0.8)',
  },
};

export default CosmicHero;
