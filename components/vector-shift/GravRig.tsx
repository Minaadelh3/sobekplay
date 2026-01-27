import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { Vector3, Quaternion, Raycaster } from 'three';
import { useKeyboardControls } from '@react-three/drei';

// Ship DNA Config (Mock)
const SHIP_STATS = {
    thrust: 50,
    turnSpeed: 1.5,
    magnetism: 200,
    driftFactor: 0.95 // 0.9 = slippery, 0.99 = grippy
};

const GravRig = ({ position }: { position: [number, number, number] }) => {
    // Rigid Body
    const [ref, api] = useBox(() => ({
        mass: 500,
        position,
        args: [2, 1, 4], // Hull size
        fixedRotation: true, // We control rotation manually via torque? No, simpler to correct it.
        linearDamping: 0.1,
        angularDamping: 0.9
    }));

    // State
    const velocity = useRef(new Vector3());
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });

    // Input Listeners
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.key.toLowerCase()]: true }));
        const onKeyUp = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.key.toLowerCase()]: false }));
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        // 1. Get current velocity
        api.velocity.subscribe((v) => velocity.current.set(v[0], v[1], v[2]));

        // 2. Thrusters (Local Forward)
        // We need to apply force relative to the ship's rotation
        // For simplicity in Phase 1, let's assume "Forward" is -Z in local space
        const forwardForce = keys.w ? -SHIP_STATS.thrust : (keys.s ? SHIP_STATS.thrust * 0.5 : 0);

        // 3. Turning (Yaw)
        // Apply torque or manual rotation for arcade feel
        const turn = keys.a ? 1 : (keys.d ? -1 : 0);

        api.applyLocalForce([0, 0, forwardForce * 10], [0, 0, 0]);
        api.applyTorque([0, turn * SHIP_STATS.turnSpeed * 100, 0]);

        // 4. Magnetism / Gravity
        // Raycast down (-Y local)
        // If hit, pull towards hit point
        // For Phase 1: Just fake gravity down
        api.applyForce([0, -9.8 * 50, 0], [0, 0, 0]);

        // 5. Camera Follow
        const camPos = new Vector3(0, 5, 12);
        // Transform camPos by ship rotation? Complex.
        // Simple follow for now:
        state.camera.position.lerp(
            new Vector3(ref.current?.position.x, ref.current?.position.y + 5, ref.current?.position.z + 15),
            0.1
        );
        state.camera.lookAt(ref.current?.position.x, ref.current?.position.y, ref.current?.position.z);
    });

    return (
        <mesh ref={ref}>
            <boxGeometry args={[2, 1, 4]} />
            <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} wireframe />
            <group position={[0, 0, 2]}>
                <mesh position={[-0.8, 0, 0]}>
                    <coneGeometry args={[0.2, 0.5, 8]} rotation={[Math.PI / 2, 0, 0]} />
                    <meshBasicMaterial color={keys.w ? "orange" : "gray"} />
                </mesh>
                <mesh position={[0.8, 0, 0]}>
                    <coneGeometry args={[0.2, 0.5, 8]} rotation={[Math.PI / 2, 0, 0]} />
                    <meshBasicMaterial color={keys.w ? "orange" : "gray"} />
                </mesh>
            </group>
        </mesh>
    );
};

export default GravRig;
