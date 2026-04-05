import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Line, OrbitControls, Environment, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Cpu, Database } from 'lucide-react';

const ParticleNetwork = () => {
  const pointsRef = useRef();
  const linesRef = useRef();
  
  // Generate random points in 3D space
  const particleCount = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const radius = 10;
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  // Animate the rotation and mouse interaction
  const { mouse } = useThree();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = time * 0.02;
    }
    
    // Mouse parallax effect
    state.camera.position.x += (mouse.x * 2 - state.camera.position.x) * 0.05;
    state.camera.position.y += (mouse.y * 2 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={pointsRef}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Some glowing hero spheres representing nodes */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
         <Sphere position={[2, 2, 2]} args={[0.3, 32, 32]}>
           <meshBasicMaterial color="#a855f7" transparent opacity={0.8} />
         </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
         <Sphere position={[-3, -1, 4]} args={[0.4, 32, 32]}>
           <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
         </Sphere>
      </Float>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={3}>
         <Sphere position={[4, -3, -2]} args={[0.2, 32, 32]}>
           <meshBasicMaterial color="#ec4899" transparent opacity={0.8} />
         </Sphere>
      </Float>
      
      {/* Decorative center ring */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[4.8, 5, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default function Hero3D({ onStart }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Three.js Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <ParticleNetwork />
          {/* Subtle post-processing or environment setup could go here */}
        </Canvas>
      </div>

      {/* Futuristic Gradient Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-10" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-blue-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Talking BI Premium V2 Live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-white leading-tight"
        >
          Talk to Your <span className="text-neon inline-block -tracking-widest pr-2">Data</span>
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl font-light"
        >
          AI-powered insights. Instantly. Experience the most immersive, futuristic analytics platform ever built.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
            className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="flex items-center gap-2">Start Exploring <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
          </button>
        </motion.div>

        {/* Floating Feature cards in 3D-ish style */}
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-3xl"
        >
           <HeroCard icon={<Activity />} title="Live Analytics" desc="Millisecond latency query processing." />
           <HeroCard icon={<Cpu />} title="AI Insights" desc="Multi-dimensional pattern recognition." />
           <HeroCard icon={<Database />} title="Huge Datasets" desc="Seamless processing of million-row scales." />
        </motion.div>
      </div>
    </motion.div>
  );
}

const HeroCard = ({ icon, title, desc }) => (
  <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center group cursor-default hover:-translate-y-2">
    <div className="p-3 bg-white/5 rounded-xl text-blue-400 mb-4 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-500 neon-glow">
      {icon}
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-zinc-500 text-sm">{desc}</p>
  </div>
);
