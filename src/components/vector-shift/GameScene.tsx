import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import GravRig from './GravRig';
import TrackModule from './modules/TrackModule'; // Updated import
import { TrackArchitect, PlacedModule } from './ai/TrackArchitect';
import { Vector3 } from 'three';

const GameScene: React.FC = () => {
    // AI Architect Instance
    const architect = useMemo(() => new TrackArchitect(), []);

    // State for Track Segments
    // In a full game, this would update based on player position in useFrame
    const [trackSegments, setTrackSegments] = useState<PlacedModule[]>(() => {
        // Initial Generation
        return architect.generate(new Vector3(0, 0, 0));
    });

    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows>
                {/* Cinematic Camera */}
                <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} />

                {/* The Void Atmosphere */}
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 20, 300]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                {/* Physics World */}
                <Physics gravity={[0, 0, 0]} defaultContactMaterial={{ friction: 0.01, restitution: 0.5 }}>
                    <Suspense fallback={null}>

                        {/* The Player */}
                        <GravRig position={[0, 5, 0]} />

                        {/* Procedural Track Generation */}
                        {trackSegments.map(mod => (
                            <TrackModule
                                key={mod.instanceId}
                                defId={mod.defId}
                                position={[mod.position.x, mod.position.y, mod.position.z]}
                                rotation={[mod.rotation.x, mod.rotation.y, mod.rotation.z]}
                                biome={mod.biome}
                            />
                        ))}

                    </Suspense>
                </Physics>
            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute top-8 left-8 text-white font-mono pointer-events-none">
                <h1 className="text-4xl font-black italic tracking-tighter">SOBEK: <span className="text-accent-green">VELOCITY</span></h1>
                <div className="mt-2 text-sm text-white/50">SYSTEM: WFC_ARCHITECT_ONLINE</div>
            </div>
        </div>
    );
};

export default GameScene;
