import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PlanetGeometry } from './planetGeometry.js';

window.onload = () => loadScene();

const uniforms = {
  radius: { value: 20.0 },
  n_amplitude: { value: 3 },
  n_scale: { value: 18 },
  n_persistence: { value: 0.5 },
  n_lacunarity: { value: 2 },
  n_octaves: { value: 7 },
  lightDir: { value: new THREE.Vector3(1, 1, 1) },
  oceanColor: { value: new THREE.Color(0x206090) },
  beachColor: { value: new THREE.Color(0xecddd5) },
  landColor: { value: new THREE.Color(0x5fa134) },
  mountainColor: { value: new THREE.Color(0xf0f0f0) },
  thresholds: { value: new THREE.Vector3(0.2, 0.4, 1.5) },
  transitions: { value: new THREE.Vector3(0.1, 0.1, 0.2) }
}

const segments = {
  phi: 128,
  theta: 128
}

function loadUI(planet, saoPass, bloomPass) {
  const gui = new GUI();

  const geometryFolder = gui.addFolder('Geometry');
  geometryFolder.add(uniforms.radius, 'value', 1, 20).name('Radius');
  geometryFolder.add(segments, 'phi', 3, 128, 1).name('Phi Segments');
  geometryFolder.add(segments, 'theta', 3, 128, 1).name('Theta Segments');
  geometryFolder.onChange(() => {
    planet.geometry = new PlanetGeometry(
      uniforms.radius.value, 
      segments.phi, 
      segments.theta,
      uniforms);
  });

  const noiseFolder = geometryFolder.addFolder('Noise');
  noiseFolder.add(uniforms.n_amplitude, 'value', 0, 5).name('Amplitude');
  noiseFolder.add(uniforms.n_scale, 'value', 1, 100).name('Scale');
  noiseFolder.add(uniforms.n_persistence, 'value', 0, 1).name('Persistence');
  noiseFolder.add(uniforms.n_lacunarity, 'value', 1, 5).name('Lacunarity');
  noiseFolder.add(uniforms.n_octaves, 'value', 1, 8, 1).name('Octaves');

  const colorsFolder = gui.addFolder('Colors');
  const waterFolder = colorsFolder.addFolder('Ocean');
  waterFolder.add(uniforms.oceanColor.value, 'r', 0, 1).name('Red');
  waterFolder.add(uniforms.oceanColor.value, 'g', 0, 1).name('Green');
  waterFolder.add(uniforms.oceanColor.value, 'b', 0, 1).name('Blue');

  const beachFolder = colorsFolder.addFolder('Beach');
  beachFolder.add(uniforms.beachColor.value, 'r', 0, 1).name('Red');
  beachFolder.add(uniforms.beachColor.value, 'g', 0, 1).name('Green');
  beachFolder.add(uniforms.beachColor.value, 'b', 0, 1).name('Blue');

  const landFolder = colorsFolder.addFolder('Land');
  landFolder.add(uniforms.landColor.value, 'r', 0, 1).name('Red');
  landFolder.add(uniforms.landColor.value, 'g', 0, 1).name('Green');
  landFolder.add(uniforms.landColor.value, 'b', 0, 1).name('Blue');

  const mountainFolder = colorsFolder.addFolder('Mountain');
  mountainFolder.add(uniforms.mountainColor.value, 'r', 0, 1).name('Red');
  mountainFolder.add(uniforms.mountainColor.value, 'g', 0, 1).name('Green');
  mountainFolder.add(uniforms.mountainColor.value, 'b', 0, 1).name('Blue');

  const thresholdsFolder = gui.addFolder('Thresholds');
  thresholdsFolder.add(uniforms.thresholds.value, 'x', 0, 2).name('Water -> Sand');
  thresholdsFolder.add(uniforms.thresholds.value, 'y', 0, 2).name('Sand -> Grass');
  thresholdsFolder.add(uniforms.thresholds.value, 'z', 0, 2).name('Grass -> Mountains');

  const transitionsFolder = gui.addFolder('Transitions');
  transitionsFolder.add(uniforms.transitions.value, 'x', 0, 0.2).name('Water -> Sand');
  transitionsFolder.add(uniforms.transitions.value, 'y', 0, 0.2).name('Sand -> Grass');
  transitionsFolder.add(uniforms.transitions.value, 'z', 0, 0.2).name('Grass -> Mountains');
  
  const postprocessingFolder = gui.addFolder('Post-Processing');

  const saoFolder = postprocessingFolder.addFolder('SAO');
  saoFolder.add(saoPass.params, 'output', {
    'Default': SAOPass.OUTPUT.Default,
    'SAO Only': SAOPass.OUTPUT.SAO,
    'Normal': SAOPass.OUTPUT.Normal
  }).onChange(function (value) {
    saoPass.params.output = value;
  });
  saoFolder.add(saoPass.params, 'saoBias', - 1, 1);
  saoFolder.add(saoPass.params, 'saoIntensity', 0, 1);
  saoFolder.add(saoPass.params, 'saoScale', 0, 10);
  saoFolder.add(saoPass.params, 'saoKernelRadius', 1, 100);
  saoFolder.add(saoPass.params, 'saoMinResolution', 0, 1);
  saoFolder.add(saoPass.params, 'saoBlur');
  saoFolder.add(saoPass.params, 'saoBlurRadius', 0, 200);
  saoFolder.add(saoPass.params, 'saoBlurStdDev', 0.5, 150);
  saoFolder.add(saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1);
  saoFolder.add(saoPass, 'enabled');

  const bloomFolder = postprocessingFolder.addFolder('Bloom');
  bloomFolder.add(bloomPass, 'threshold', 0, 1);
  bloomFolder.add(bloomPass, 'strength', 0, 1);
  bloomFolder.add(bloomPass, 'radius', 0, 2);
}

function loadScene() {
  console.log('loading scene');

  const renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1, 1, 1);
  light.castShadow = true;
  scene.add(light);

  camera.position.z = 50;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);

  composer.addPass(renderPass);
  const saoPass = new SAOPass(scene, camera);
  saoPass.params.saoBias = 0.75;
  saoPass.params.saoIntensity = 0.004;
  saoPass.params.saoScale = 1;
  saoPass.params.saoKernelRadius = 10;
  saoPass.params.saoBlurRadius = 8;
  saoPass.params.saoBlurStdDev = 5;
  composer.addPass(saoPass);

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

  const planet = new THREE.Mesh();
  planet.material = material;
  planet.geometry = new PlanetGeometry(
    uniforms.radius.value, 
    segments.phi, 
    segments.theta,
    uniforms);
  planet.receiveShadow = true;
  planet.castShadow = true;
  scene.add(planet);

  function animate() {
    requestAnimationFrame(animate);

    planet.rotation.y += 0.002;

    composer.render();
  }

  // Events
  window.addEventListener('resize', () => {
    // Resize camera aspect ratio and renderer size to the new window size
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  loadUI(planet, saoPass, bloomPass);
  animate();

  console.log('done');
}