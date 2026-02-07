import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface AntigravityInnerProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron';
  fieldStrength?: number;
}

interface Particle {
  t: number;
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
  zFactor: number;
  mx: number;
  my: number;
  mz: number;
  cx: number;
  cy: number;
  cz: number;
  vx: number;
  vy: number;
  vz: number;
  randomRadiusOffset: number;
}

// Seeded random number generator for deterministic results
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const createParticles = (count: number, width: number, height: number): Particle[] => {
  const temp: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 1000;
    const t = seededRandom(seed) * 100;
    const factor = 20 + seededRandom(seed + 1) * 100;
    const speed = 0.01 + seededRandom(seed + 2) / 200;
    const xFactor = -50 + seededRandom(seed + 3) * 100;
    const yFactor = -50 + seededRandom(seed + 4) * 100;
    const zFactor = -50 + seededRandom(seed + 5) * 100;

    const x = (seededRandom(seed + 6) - 0.5) * width;
    const y = (seededRandom(seed + 7) - 0.5) * height;
    const z = (seededRandom(seed + 8) - 0.5) * 20;

    const randomRadiusOffset = (seededRandom(seed + 9) - 0.5) * 2;

    temp.push({
      t,
      factor,
      speed,
      xFactor,
      yFactor,
      zFactor,
      mx: x,
      my: y,
      mz: z,
      cx: x,
      cy: y,
      cz: z,
      vx: 0,
      vy: 0,
      vz: 0,
      randomRadiusOffset
    });
  }
  return temp;
};

// Global mouse position tracker
const mousePos = { x: 0, y: 0 };
let mouseTrackerInitialized = false;

const initMouseTracker = () => {
  if (mouseTrackerInitialized) return;
  mouseTrackerInitialized = true;
  
  window.addEventListener('mousemove', (e) => {
    // Normalize to -1 to 1 range
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
};

const AntigravityInner = ({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#000000',
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10
}: AntigravityInnerProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  const dummy = useRef(new THREE.Object3D());

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });

  // Initialize global mouse tracker
  useEffect(() => {
    initMouseTracker();
  }, []);

  // Create particles once on mount with initial viewport size
  const [particles] = useState<Particle[]>(() => 
    createParticles(count, viewport.width || 100, viewport.height || 100)
  );

  // Update particle positions when viewport changes
  useEffect(() => {
    const width = viewport.width || 100;
    const height = viewport.height || 100;
    particles.forEach((particle, i) => {
      const seed = i * 1000;
      particle.mx = (seededRandom(seed + 6) - 0.5) * width;
      particle.my = (seededRandom(seed + 7) - 0.5) * height;
      particle.cx = particle.mx;
      particle.cy = particle.my;
    });
  }, [viewport.width, viewport.height, particles]);

  useFrame(state => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { viewport: v } = state;
    
    // Use global mouse position instead of canvas pointer
    const m = { x: mousePos.x, y: mousePos.y };

    const mouseDist = Math.sqrt(Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2));

    if (mouseDist > 0.001) {
      lastMouseMoveTime.current = Date.now();
      lastMousePos.current = { x: m.x, y: m.y };
    }

    let destX = (m.x * v.width) / 2;
    let destY = (m.y * v.height) / 2;

    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (v.width / 4);
      destY = Math.cos(time * 0.5 * 2) * (v.height / 4);
    }

    const smoothFactor = 0.05;
    virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;

    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    particles.forEach((particle, i) => {
      const { speed, mx, my, mz, cz, randomRadiusOffset } = particle;

      const t = particle.t += speed / 2;

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const targetPos = { x: mx, y: my, z: mz * depthFactor };

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;

        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));

        const currentRingRadius = ringRadius + wave + deviation;

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor);
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      dummy.current.position.set(particle.cx, particle.cy, particle.cz);

      dummy.current.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      dummy.current.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
      );

      const distFromRing = Math.abs(currentDistToMouse - ringRadius);
      let scaleFactor = 1 - distFromRing / 10;

      scaleFactor = Math.max(0, Math.min(1, scaleFactor));

      const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;
      dummy.current.scale.set(finalScale, finalScale, finalScale);

      dummy.current.updateMatrix();

      mesh.setMatrixAt(i, dummy.current.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === 'capsule' && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
      {particleShape === 'sphere' && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === 'box' && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === 'tetrahedron' && <tetrahedronGeometry args={[0.3]} />}
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
};

const Antigravity = (props: AntigravityInnerProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
      <AntigravityInner {...props} />
    </Canvas>
  );
};

export default Antigravity;
