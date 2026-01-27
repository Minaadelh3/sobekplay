import React from 'react';
import { useBox } from '@react-three/cannon';

interface TrackProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    type?: 'straight' | 'turn';
}

const TrackSegment: React.FC<TrackProps> = ({ position, rotation = [0, 0, 0], type = 'straight' }) => {
    // Physical Body
    const [ref] = useBox(() => ({
        type: 'Static',
        position,
        rotation,
        args: [20, 1, 50] // Massively wide track
    }));

    return (
        <group ref={ref}>
            {/* The Floor */}
            <mesh receiveShadow>
                <boxGeometry args={[20, 1, 50]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.8} />
            </mesh>

            {/* Neon Strips */}
            <mesh position={[-9.5, 0.6, 0]}>
                <boxGeometry args={[0.5, 0.1, 50]} />
                <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} />
            </mesh>
            <mesh position={[9.5, 0.6, 0]}>
                <boxGeometry args={[0.5, 0.1, 50]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
            </mesh>
        </group>
    );
};

export default TrackSegment;
