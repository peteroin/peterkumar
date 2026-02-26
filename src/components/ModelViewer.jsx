import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function FallbackBox() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#4f46e5" wireframe />
    </mesh>
  );
}

// Added 'environment' prop to change lighting dynamically
export default function ModelViewer({ modelUrl, environment = 'city' }) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
        {/* Suspense boundary added here to catch loading errors! */}
        <Suspense fallback={<FallbackBox />}>
          {/* Stage now uses the dynamic environment prop */}
          <Stage environment={environment} intensity={0.6}>
            {modelUrl ? <GLTFModel url={modelUrl} /> : <FallbackBox />}
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={false} />
      </Canvas>
    </div>
  );
}