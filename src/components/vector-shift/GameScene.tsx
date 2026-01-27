import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import GravRig from './GravRig';
import TrackSegment from './TrackSegment';

const GameScene: React.FC = () => {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows>
                {/* Cinematic Camera */}
                <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} />

                {/* The Void Atmosphere */}
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 10, 100]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                {/* Physics World (Gravity is 0 because we handle it manually for 6DoF) */}
                <Physics gravity={[0, 0, 0]} defaultContactMaterial={{ friction: 0.01, restitution: 0.5 }}>
                    <Suspense fallback={null}>

                        {/* The Player */}
                        <GravRig position={[0, 2, 0]} />

                        {/* Test Track (Static for Phase 1) */}
                        <TrackSegment position={[0, 0, 0]} />
                        <TrackSegment position={[0, 0, -50]} type="straight" />
                        <TrackSegment position={[0, 0, -100]} type="turn" rotation={[0, Math.PI / 4, 0]} />

                        {/* Ground Plane (Fallback) */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                            <planeGeometry args={[500, 500]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
                        </mesh>

                    </Suspense>
                </Physics>
            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute top-8 left-8 text-white font-mono pointer-events-none">
                <h1 className="text-4xl font-black italic tracking-tighter">VECTOR SHIFT <span className="text-xs text-accent-green">ALPHA</span></h1>
                <div className="mt-2 text-sm text-white/50">SYSTEM: NORMAL_G</div>
            </div>
        </div>
    );
};

export default GameScene;
