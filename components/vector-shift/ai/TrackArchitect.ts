import { Vector3, Quaternion, Euler } from 'three';
import { v4 as uuidv4 } from 'uuid';

// --- TYPES ---

export type BiomeType = 'NEON_ASWAN' | 'HIGH_DAM_INDUSTRIAL';

export type ModuleType = 'EASY' | 'MEDIUM' | 'HARD' | 'SPECIAL';

export interface Connector {
    position: Vector3; // Relative to module center
    rotation: Euler;   // Orientation of the data flow
    type: 'STANDARD' | 'WIDE' | 'TUBE';
}

export interface TrackModuleDef {
    id: string;
    type: ModuleType;
    prefabId: string; // ID to render the visual React component
    entry: Connector;
    exit: Connector;
    length: number;
    difficultyRating: number;
}

export interface PlacedModule {
    instanceId: string;
    defId: string;
    position: Vector3;
    rotation: Euler;
    biome: BiomeType;
}

// --- DATA: MODULE LIBRARY ---
// This would be much larger in production, usually loaded from JSON
const MODULE_LIBRARY: TrackModuleDef[] = [
    {
        id: 'straight_long',
        type: 'EASY',
        prefabId: 'Straight_50m',
        entry: { position: new Vector3(0, 0, 25), rotation: new Euler(0, 0, 0), type: 'STANDARD' },
        exit: { position: new Vector3(0, 0, -25), rotation: new Euler(0, 0, 0), type: 'STANDARD' },
        length: 50,
        difficultyRating: 1
    },
    {
        id: 'turn_right_90',
        type: 'MEDIUM',
        prefabId: 'Turn_Right_90',
        entry: { position: new Vector3(0, 0, 25), rotation: new Euler(0, 0, 0), type: 'STANDARD' },
        exit: { position: new Vector3(50, 0, 25), rotation: new Euler(0, -Math.PI / 2, 0), type: 'STANDARD' }, // Simplified pivot logic
        length: 50,
        difficultyRating: 3
    },
    // We can add "The Split" or "Corkscrew" here
];

// --- LOGIC: THE ARCHITECT ---

export class TrackArchitect {
    private history: PlacedModule[] = [];
    private currentBiome: BiomeType = 'NEON_ASWAN';

    // Config
    private maxQueueSize = 10;

    constructor() {
        // Seed the start
        this.history.push({
            instanceId: 'start',
            defId: 'straight_long',
            position: new Vector3(0, 0, 0),
            rotation: new Euler(0, 0, 0),
            biome: 'NEON_ASWAN'
        });
    }

    /**
     * The Main WFC Loop
     * Returns the full queue of modules to render
     */
    public generate(playerPos: Vector3): PlacedModule[] {
        // 1. Cull old modules (simple distance check or index)
        const lastModule = this.history[this.history.length - 1];

        // 2. Look Ahead - do we need more?
        // Simple logic: maintain buffer
        if (this.history.length < this.maxQueueSize) {
            const next = this.collapseNext(lastModule);
            this.history.push(next);
        }

        return this.history;
    }

    private collapseNext(prev: PlacedModule): PlacedModule {
        // A real WFC would filter all possibilities based on constraints.
        // Here we just pick a valid Connector match.

        // 1. Get Definition of Previous to find its EXIT
        const prevDef = MODULE_LIBRARY.find(m => m.id === prev.defId);
        if (!prevDef) throw new Error('Definition Missing');

        // 2. Calculate World Exit Point of Previous
        // Transform local Exit Point by Previous Position/Rotation
        // This math needs a full Matrix4 in 3D, simplified here for prototype concept:
        const exitOffset = prevDef.exit.position.clone().applyEuler(prev.rotation);
        const spawnPoint = prev.position.clone().add(exitOffset);

        // 3. Pick Random Next Module
        const nextDef = MODULE_LIBRARY[Math.floor(Math.random() * MODULE_LIBRARY.length)];

        // 4. Calculate New Rotation
        // New Rot = Prev Rot + Exit Rot
        const newRot = new Euler(
            prev.rotation.x + prevDef.exit.rotation.x,
            prev.rotation.y + prevDef.exit.rotation.y,
            prev.rotation.z + prevDef.exit.rotation.z
        );

        // 5. Adjust Spawn Point to align ENTRY of Next with EXIT of Prev
        // This part is the tricky math in 6DoF WFC
        // For now, let's assume all modules pivot perfectly at (0,0,0) or Entry

        return {
            instanceId: uuidv4(),
            defId: nextDef.id,
            position: spawnPoint, // Needs proper offset adjustment based on Next.Entry
            rotation: newRot,
            biome: this.currentBiome
        };
    }
}
