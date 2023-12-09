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
  radius: { value: 20.0 },
  amplitude: { value: 1.19 },
  sharpness: { value: 2.296 },
  offset: { value: -0.016 },
  period: { value: 0.6 },
  persistence: { value: 0.484 },
  lacunarity: { value: 1.648 },
  octaves: { value: 8 },
  ambientIntensity: { value: 0.02 },
  diffuseIntensity: { value: 1 },
  specularIntensity: { value: 2 },
  shininess: { value: 10 },
  lightDirection: { value: new THREE.Vector3(1, 1, 1) },
  lightColor: { value: new THREE.Color(0xffffff) },
  bumpStrength: { value: 1.0 },
  bumpOffset: { value: 0.001 },
  color1: { value: new THREE.Color(0.014, 0.117, 0.279) },
  color2: { value: new THREE.Color(0.080, 0.527, 0.351) },
  color3: { value: new THREE.Color(0.620, 0.516, 0.372) },
  color4: { value: new THREE.Color(0.149, 0.254, 0.084) },
  color5: { value: new THREE.Color(0.150, 0.150, 0.150) },
  transition2: { value: 0.071 },
  transition3: { value: 0.215 },
  transition4: { value: 0.372 },
  transition5: { value: 1.2 },
  blend12: { value: 0.152 },
  blend23: { value: 0.152 },
  blend34: { value: 0.104 },
  blend45: { value: 0.168 }
}

function loadScene() {
  console.log('loading scene');

  const clock = new THREE.Clock(true);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // https://opengameart.org/content/night-sky-skybox-generator
  scene.background = new THREE.CubeTextureLoader()
    .setPath( '/' )
    .load( [
          'xpos.png',
          'xneg.png',
          'ypos.png',
          'yneg.png',
          'zpos.png',
          'zneg.png'
        ] );
        
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.1;
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

  const noiseFunctions = document.getElementById('noise-functions').innerHTML;
  const vertexShader = document.getElementById('planet-vert-shader').innerHTML;
  const fragmentShader = document.getElementById('planet-frag-shader').innerHTML;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertexShader.replace(
      'void main() {',
      `${noiseFunctions}
       void main() {`
    ),
    fragmentShader: fragmentShader.replace(
      'void main() {',
      `${noiseFunctions}
       void main() {`
    ),
  });

  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), material);
  planet.geometry.computeTangents();
  scene.add(planet);

  const atmosphere = new Atmosphere({
    particles: 5000,
    minParticleSize: 50,
    maxParticleSize: 100,
    radius: uniforms.radius.value + 1,
    thickness: 0.8,
    density: 0.2,
    scale: 14,
    color: new THREE.Color(0xffffff),
    speed: 0.03,
    lightDirection: uniforms.lightDirection
  });

  planet.add(atmosphere);

  function animate() {
    requestAnimationFrame(animate);
    atmosphere.material.uniforms.time.value = clock.getElapsedTime();
    atmosphere.rotation.y += 0.0002;
    controls.update();
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