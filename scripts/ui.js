import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export default function createUI(planetParams, atmosphereParams, atmosphere, bloomPass) {
  const gui = new GUI();

  const terrainFolder = gui.addFolder('Terrain');
  terrainFolder.add(planetParams.type, 'value', { simplex: 1, fractal: 2, ridgedFractal: 3 }).name('Type');
  terrainFolder.add(planetParams.amplitude, 'value', 0.1, 1.5).name('Amplitude');
  terrainFolder.add(planetParams.sharpness, 'value', 0, 5).name('Sharpness');
  terrainFolder.add(planetParams.offset, 'value', -2, 2).name('Offset');
  terrainFolder.add(planetParams.period, 'value', 0.1, 2).name('Period');
  terrainFolder.add(planetParams.persistence, 'value', 0, 1).name('Persistence');
  terrainFolder.add(planetParams.lacunarity, 'value', 1, 3).name('Lacunarity');
  terrainFolder.add(planetParams.octaves, 'value', 1, 8, 1).name('Octaves');
  terrainFolder.onChange((value) => {
    atmosphere.update();
  });

  const layersFolder = terrainFolder.addFolder('Layers').close();
  const layer1Folder = layersFolder.addFolder('Layer 1');
  layer1Folder.add(planetParams.color1.value, 'r', 0, 1).name('Red');
  layer1Folder.add(planetParams.color1.value, 'g', 0, 1).name('Green');
  layer1Folder.add(planetParams.color1.value, 'b', 0, 1).name('Blue');

  const layer2Folder = layersFolder.addFolder('Layer 2');
  layer2Folder.add(planetParams.transition2, 'value', 0, 3).name('Transition Point');
  layer2Folder.add(planetParams.blend12, 'value', 0, 1).name('Blend Factor (1->2)');
  layer2Folder.add(planetParams.color2.value, 'r', 0, 1).name('Red');
  layer2Folder.add(planetParams.color2.value, 'g', 0, 1).name('Green');
  layer2Folder.add(planetParams.color2.value, 'b', 0, 1).name('Blue');

  const layer3Folder = layersFolder.addFolder('Layer 3');
  layer3Folder.add(planetParams.transition3, 'value', 0, 3).name('Transition Point');
  layer3Folder.add(planetParams.blend23, 'value', 0, 1).name('Blend Factor (2->3)');
  layer3Folder.add(planetParams.color3.value, 'r', 0, 1).name('Red');
  layer3Folder.add(planetParams.color3.value, 'g', 0, 1).name('Green');
  layer3Folder.add(planetParams.color3.value, 'b', 0, 1).name('Blue');

  const layer4Folder = layersFolder.addFolder('Layer 4');
  layer4Folder.add(planetParams.transition4, 'value', 0, 3).name('Transition Point');
  layer4Folder.add(planetParams.blend34, 'value', 0, 1).name('Blend Factor (3->4)');
  layer4Folder.add(planetParams.color4.value, 'r', 0, 1).name('Red');
  layer4Folder.add(planetParams.color4.value, 'g', 0, 1).name('Green');
  layer4Folder.add(planetParams.color4.value, 'b', 0, 1).name('Blue');

  const layer5Folder = layersFolder.addFolder('Layer 5');
  layer5Folder.add(planetParams.transition5, 'value', 0, 3).name('Transition Point');
  layer5Folder.add(planetParams.blend45, 'value', 0, 1).name('Blend Factor (4->5)');
  layer5Folder.add(planetParams.color5.value, 'r', 0, 1).name('Red');
  layer5Folder.add(planetParams.color5.value, 'g', 0, 1).name('Green');
  layer5Folder.add(planetParams.color5.value, 'b', 0, 1).name('Blue');
  
  const atmosphereFolder = gui.addFolder('Atmosphere');
  atmosphereFolder.add(atmosphereParams.thickness, 'value', 0.1, 5).name('Thickness');
  atmosphereFolder.add(atmosphereParams.particles, 'value', 1, 50000, 1).name('Particle Count');
  atmosphereFolder.add(atmosphereParams.minParticleSize, 'value', 0, 200).name('Min Particle Size');
  atmosphereFolder.add(atmosphereParams.maxParticleSize, 'value', 0, 200).name('Max Particle Size');
  atmosphereFolder.add(atmosphereParams.density, 'value', -2, 2).name('Density');
  atmosphereFolder.add(atmosphereParams.opacity, 'value', 0, 1).name('Opacity');
  atmosphereFolder.add(atmosphereParams.scale, 'value', 1, 30).name('Scale');
  atmosphereFolder.add(atmosphereParams.speed, 'value', 0, 0.1).name('Speed');
  const atmosphereColorFolder = atmosphereFolder.addFolder('Color');
  atmosphereColorFolder.add(atmosphereParams.color.value, 'r', 0, 1).name('Red');
  atmosphereColorFolder.add(atmosphereParams.color.value, 'g', 0, 1).name('Green');
  atmosphereColorFolder.add(atmosphereParams.color.value, 'b', 0, 1).name('Blue');
  atmosphereFolder.onChange((value) => {
    atmosphere.update();
  });

  const lightingFolder = gui.addFolder('Lighting');  
  lightingFolder.add(planetParams.ambientIntensity, 'value', 0, 5).name('Ambient');
  lightingFolder.add(planetParams.diffuseIntensity, 'value', 0, 5).name('Diffuse');
  lightingFolder.add(planetParams.specularIntensity, 'value', 0, 5).name('Specular');
  lightingFolder.add(planetParams.shininess, 'value', 0, 25).name('Shininess');

  const lightDirFolder = lightingFolder.addFolder('Direction').close();
  lightDirFolder.add(planetParams.lightDirection.value, 'x', -1, 1).name('X');
  lightDirFolder.add(planetParams.lightDirection.value, 'y', -1, 1).name('Y');
  lightDirFolder.add(planetParams.lightDirection.value, 'z', -1, 1).name('Z');

  const lightColorFolder = lightingFolder.addFolder('Color').close();
  lightColorFolder.add(planetParams.lightColor.value, 'r', 0, 1).name('R');
  lightColorFolder.add(planetParams.lightColor.value, 'g', 0, 1).name('G');
  lightColorFolder.add(planetParams.lightColor.value, 'b', 0, 1).name('B');

  const bumpMapFolder = gui.addFolder('Bump Mapping');
  bumpMapFolder.add(planetParams.bumpStrength, 'value', 0, 1).name('Bump Strength');
  bumpMapFolder.add(planetParams.bumpOffset, 'value', 0.0001, 0.1).name('Bump Offset');

  const postprocessingFolder = gui.addFolder('Post-Processing');
  const bloomFolder = postprocessingFolder.addFolder('Bloom');
  bloomFolder.add(bloomPass, 'threshold', 0, 1);
  bloomFolder.add(bloomPass, 'strength', 0, 1);
  bloomFolder.add(bloomPass, 'radius', 0, 2);
}