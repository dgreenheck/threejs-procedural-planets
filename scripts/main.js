import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import createUI from './ui';
import { Atmosphere } from './atmosphere';

window.onload = () => loadScene();

const uniforms = {
  seed: { value: 0 },
  radius: { value: 20.0 },
  amplitude: { value: 0.5 },
  period: { value: 1 },
  persistence: { value: 0.5 },
  lacunarity: { value: 2 },
  octaves: { value: 7 },
  sunIntensity: { value: 1 },
  sunDirection: { value: new THREE.Vector3(1, 1, 1) },
  sunColor: { value: new THREE.Color(0xffffff) },
  bumpStrength: { value: 1.0 },
  bumpOffset: { value: 0.001 },
  oceanColor: { value: new THREE.Color(0x206090) },
  beachColor: { value: new THREE.Color(0xecddd5) },
  landColor: { value: new THREE.Color(0x5fa134) },
  mountainColor: { value: new THREE.Color(0xf0f0f0) },
  thresholds: { value: new THREE.Vector3(0.2, 0.4, 1.5) },
  transitions: { value: new THREE.Vector3(0.1, 0.1, 0.2) }
}

function loadScene() {
  console.log('loading scene');

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);

  camera.position.z = 50;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);

  composer.addPass(renderPass);
 
  const bloomPass = new UnrealBloomPass();
  bloomPass.threshold = 0;
  bloomPass.strength = 0.2;
  bloomPass.radius = 0.5;
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const vertexShader = document.getElementById('planet-vert-shader').innerHTML;
  const fragmentShader = document.getElementById('planet-frag-shader').innerHTML;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });

  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), material);
  planet.geometry.computeTangents();
  scene.add(planet);

  const atmosphere = new Atmosphere(10000, 20, 5, 0.5, 30);
  scene.add(atmosphere);

  function animate() {
    requestAnimationFrame(animate);

    composer.render();
  }

  // Events
  window.addEventListener('resize', () => {
    // Resize camera aspect ratio and renderer size to the new window size
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  createUI(uniforms, atmosphere, bloomPass);
  animate();

  console.log('done');
}