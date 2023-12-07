import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export default function createUI(uniforms, atmosphere, bloomPass) {
  const gui = new GUI();

  const terrainFolder = gui.addFolder('Terrain');
  terrainFolder.add(uniforms.radius, 'value', 1, 20).name('Radius');
  terrainFolder.add(uniforms.amplitude, 'value', 0, 5).name('Amplitude');
  terrainFolder.add(uniforms.period, 'value', 0.1, 1).name('Period');
  terrainFolder.add(uniforms.persistence, 'value', 0, 1).name('Persistence');
  terrainFolder.add(uniforms.lacunarity, 'value', 1, 5).name('Lacunarity');
  terrainFolder.add(uniforms.octaves, 'value', 1, 8, 1).name('Octaves');

  const colorsFolder = terrainFolder.addFolder('Colors').close();
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

  const thresholdsFolder = terrainFolder.addFolder('Thresholds').close();
  thresholdsFolder.add(uniforms.thresholds.value, 'x', 0, 2).name('Water -> Sand');
  thresholdsFolder.add(uniforms.thresholds.value, 'y', 0, 2).name('Sand -> Grass');
  thresholdsFolder.add(uniforms.thresholds.value, 'z', 0, 2).name('Grass -> Mountains');

  const transitionsFolder = terrainFolder.addFolder('Transitions').close();
  transitionsFolder.add(uniforms.transitions.value, 'x', 0, 0.2).name('Water -> Sand');
  transitionsFolder.add(uniforms.transitions.value, 'y', 0, 0.2).name('Sand -> Grass');
  transitionsFolder.add(uniforms.transitions.value, 'z', 0, 0.2).name('Grass -> Mountains');
  
  const atmosphereFolder = gui.addFolder('Atmosphere');
  atmosphereFolder.add(atmosphere, 'samples', 1, 100000);
  atmosphereFolder.add(atmosphere, 'density', 0, 1);
  atmosphereFolder.add(atmosphere, 'cloudScale', 0.1, 100);
  atmosphereFolder.add(atmosphere, 'radius', 0, 100);
  atmosphereFolder.add(atmosphere, 'thickness', 0.1, 5);
  atmosphereFolder.onChange(() => {
    atmosphere.update();
  });

  const postprocessingFolder = gui.addFolder('Post-Processing');
  const bloomFolder = postprocessingFolder.addFolder('Bloom');
  bloomFolder.add(bloomPass, 'threshold', 0, 1);
  bloomFolder.add(bloomPass, 'strength', 0, 1);
  bloomFolder.add(bloomPass, 'radius', 0, 2);

  const bumpMapFolder = gui.addFolder('Bump Mapping');
  bumpMapFolder.add(uniforms.bumpStrength, 'value', 0, 1).name('Bump Strength');
  bumpMapFolder.add(uniforms.bumpOffset, 'value', 0.0001, 0.1).name('Bump Offset');

  const sunFolder = gui.addFolder('Sun');
  sunFolder.add(uniforms.sunIntensity, 'value', 0, 10).name('Intensity');

  const lightDirFolder = sunFolder.addFolder('Direction').close();
  lightDirFolder.add(uniforms.sunDirection.value, 'x', -1, 1).name('X');
  lightDirFolder.add(uniforms.sunDirection.value, 'y', -1, 1).name('Y');
  lightDirFolder.add(uniforms.sunDirection.value, 'z', -1, 1).name('Z');

  const lightColorFolder = sunFolder.addFolder('Color').close();
  lightColorFolder.add(uniforms.sunColor.value, 'r', 0, 1).name('R');
  lightColorFolder.add(uniforms.sunColor.value, 'g', 0, 1).name('G');
  lightColorFolder.add(uniforms.sunColor.value, 'b', 0, 1).name('B');
}