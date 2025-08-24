// src/components/AIAvatar3D.jsx
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// This mapping connects ElevenLabs viseme names to Ready Player Me morph target names
const visemeToMorphTarget = {
  'sil': 'mouthClose', 'p': 'mouthClose', 'b': 'mouthClose', 'm': 'mouthClose',
  'f': 'mouthF', 'v': 'mouthF',
  't': 'mouthUpperUp', 'd': 'mouthUpperUp', 'n': 'mouthUpperUp', 'l': 'mouthUpperUp', 's': 'mouthUpperUp', 'z': 'mouthUpperUp', 'r': 'mouthUpperUp',
  'k': 'jawOpen', 'g': 'jawOpen',
  'i': 'mouthSmile', 'I': 'mouthSmile',
  'u': 'mouthFunnel', 'U': 'mouthFunnel', 'o': 'mouthFunnel', 'O': 'mouthFunnel',
  'a': 'jawOpen', 'A': 'jawOpen', 'E': 'jawOpen',
  'e': 'mouthSmile',
  'schwa': 'jawOpen',
  'th': 'mouthUpperUp',
  'ch': 'mouthSh', 'j': 'mouthSh', 'sh': 'mouthSh',
};

function AvatarModel({ currentViseme }) {
  const avatarUrl = "https://models.readyplayer.me/68aa94334dd25e5878c6d0d1.glb";
  const { scene, nodes } = useGLTF(avatarUrl);

  useEffect(() => {
    // Find the head and teeth meshes which contain the morph targets
    const headMesh = nodes.Wolf3D_Head;
    const teethMesh = nodes.Wolf3D_Teeth;

    if (headMesh && headMesh.morphTargetDictionary && teethMesh) {
      // First, reset all morph target influences to 0
      Object.keys(headMesh.morphTargetDictionary).forEach(key => {
        const index = headMesh.morphTargetDictionary[key];
        headMesh.morphTargetInfluences[index] = 0;
        teethMesh.morphTargetInfluences[index] = 0;
      });

      // Find the correct morph target for the current viseme and set its influence to 1
      const morphTargetName = visemeToMorphTarget[currentViseme];
      if (morphTargetName) {
        const index = headMesh.morphTargetDictionary[morphTargetName];
        if (index !== undefined) {
          headMesh.morphTargetInfluences[index] = 1;
          teethMesh.morphTargetInfluences[index] = 1;
        }
      }
    }
  }, [currentViseme, nodes]);

  return (
      <primitive object={scene} scale={2} position={[0, -2, 0]} />
  );
}

export default function AIAvatar3D({ currentViseme }) {
  return (
    <div className="w-full h-full bg-gray-800 rounded-2xl border border-gray-700">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 25 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 3, 5]} intensity={2.5} />
        <Suspense fallback={null}>
          <AvatarModel currentViseme={currentViseme} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}