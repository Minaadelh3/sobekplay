import React, { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import { BiomeType } from '../ai/TrackArchitect';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

interface ModuleProps {
    defId: string;
    position: [number, number, number];
    rotation: [number, number, number];
    biome: BiomeType;
}

// ASSETS / TEXTURES (Placeholder colors for now)
const BIOME_COLORS = {
    'NEON_ASWAN': {
        floor: '#1a0b2e',
        neon: '#00ff9d', // Nubian Green
        walls: '#2d1b4e'
    },
    'HIGH_DAM_INDUSTRIAL': {
        floor: '#1f2226',
        neon: '#ffae00', // Industrial Amber
        walls: '#363b42'
    }
};

const TrackModule: React.FC<ModuleProps> = ({ defId, position, rotation, biome }) => {
    // Physical Body (Static)
    // In a real app, this shape would match the defId's Mesh
    const [ref] = useBox(() => ({
        type: 'Static',
        position,
        rotation,
        args: [20, 1, 50] // Default size, needs to be dynamic based on DefId
    }));

    const style = BIOME_COLORS[biome];

    // Render based on Prefab ID
    // Simplification: We only have 'Straight_50m' and 'Turn' logic visualized generically
    const isTurn = defId.includes('turn');

    return (
        <group ref={ref}>
            {/* Floor */}
            <mesh receiveShadow>
                <boxGeometry args={[20, 1, 50]} />
                <meshStandardMaterial color={style.floor} roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Neon Accents (Procedural Branding) */}
            <mesh position={[-9.5, 0.6, 0]}>
                <boxGeometry args={[0.5, 0.2, 50]} />
                <meshStandardMaterial color={style.neon} emissive={style.neon} emissiveIntensity={2} />
            </mesh>
            <mesh position={[9.5, 0.6, 0]}>
                <boxGeometry args={[0.5, 0.2, 50]} />
                <meshStandardMaterial color={style.neon} emissive={style.neon} emissiveIntensity={2} />
            </mesh>

            {/* Biome Specific Props */}
            {biome === 'NEON_ASWAN' && (
                <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial wireframe color={style.neon} />
                </mesh>
            )}

            {biome === 'HIGH_DAM_INDUSTRIAL' && (
                <mesh position={[0, 5, 0]}>
                    <cylinderGeometry args={[1, 1, 4, 8]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
            )}
        </group>
    );
};

export default TrackModule;
