import * as THREE from 'three';
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

const noiseGen = new SimplexNoise();
const texLoader = new THREE.TextureLoader();
const cloudTex = texLoader.load('/cloud.png');

export class Atmosphere extends THREE.Points {
  constructor(samples, radius, thickness, density, cloudScale) {
    super();

    this.samples = samples;
    this.radius = radius;
    this.thickness = thickness;
    this.density = density;
    this.cloudScale = cloudScale;

    this.material = new THREE.PointsMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.2,
      size: 3,
      depthWrite: false
    });

    this.update();
  }

  update() {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }

    const geometry = new THREE.BufferGeometry();

    const verts = [];

    // Sample points within the atmosphere
    for(let i = 0; i < this.samples; i++) {
      let r = Math.random() * this.thickness + this.radius;
      let theta = Math.PI * Math.random() - (Math.PI / 2);
      let phi = 2 * Math.PI * Math.random();

      const x = r * Math.cos(theta) * Math.cos(phi);
      const y = r * Math.sin(theta);
      const z = r * Math.cos(theta) * Math.sin(phi);

      const n = (noiseGen.noise3d(x / this.cloudScale, y / this.cloudScale, z / this.cloudScale) + 1.0) / 2.0;
      if (n < this.density) {
        verts.push(x, y, z);
        i++;
      }
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));

    this.geometry = geometry;
  }
}