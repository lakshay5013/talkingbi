import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const NeuralNetwork = () => {
  const groupRef = useRef();
  
  // Create nodes
  const nodeCount = 40;
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodeCount; i++) {
        arr.push(new THREE.Vector3(
           (Math.random() - 0.5) * 20,
           (Math.random() - 0.5) * 20,
           (Math.random() - 0.5) * 10 - 5
        ));
    }
    return arr;
  }, [nodeCount]);

  // Create connections (lines between close nodes)
  const lines = useMemo(() => {
    const l = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const d = nodes[i].distanceTo(nodes[j]);
        if (d < 5) { // connect if close
          l.push([nodes[i], nodes[j]]);
        }
      }
    }
    return l;
  }, [nodes, nodeCount]);

  const { mouse } = useThree();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
      groupRef.current.rotation.x = time * 0.02;
    }
    // Deep Parallax
    state.camera.position.x += (mouse.x * 3 - state.camera.position.x) * 0.02;
    state.camera.position.y += (mouse.y * 3 - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((pos, i) => (
        <Sphere key={'node'+i} position={pos} args={[0.08, 16, 16]}>
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
        </Sphere>
      ))}
      
      {/* Connections */}
      {lines.map((pts, i) => (
        <Line key={'line'+i} points={pts} color="#8b5cf6" lineWidth={1} transparent opacity={0.15} />
      ))}
    </group>
  );
};

const WaveGrid = () => {
  const planeRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (planeRef.current) {
      const positions = planeRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.5 + time) * 2 + Math.cos(y * 0.5 + time) * 2;
      }
      planeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -8, -10]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.06} />
    </mesh>
  );
};

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <NeuralNetwork />
        <WaveGrid />
      </Canvas>
      {/* Radial Gradient overlay to ensure text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]" />
    </div>
  );
}
