import * as THREE from 'three';
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

const texLoader = new THREE.TextureLoader();
const cloudTex = texLoader.load('/cloud.png');

export class Atmosphere extends THREE.Points {
  
  /**
   * 
   * @param {{
   *   particles: number, 
   *   minParticleSize: number,
   *   maxParticleSize: number,
   *   radius: number,
   *   thickness: number,
   *   density: number,
   *   speed: number,
   *   color: THREE.Color,
   *   opacity: float,
   *   lightDirection: THREE.Vector3
   * }} params 
   */
  constructor(params) {
    super();

    this.params = params;

    const noiseFunctions = document.getElementById('noise-functions').innerHTML;
    const vertexShader = document.getElementById('atmosphere-vert-shader').innerHTML;
    const fragmentShader = document.getElementById('atmosphere-frag-shader').innerHTML;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: params.color },
        density: { value: this.params.density },
        scale: { value: this.params.scale },
        speed: { value: this.params.speed },
        pointTexture: { value: cloudTex },
        lightDirection: params.lightDirection
      },
      vertexShader,
      fragmentShader: fragmentShader.replace(
        'void main() {',
        `${noiseFunctions}
         void main() {`
      ),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
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
    const uvs = [];
    const sizes = [];
    
    // Sample points within the atmosphere
    for(let i = 0; i < this.params.particles; i++) {
      let r = Math.random() * this.params.thickness + this.params.radius;

      // Pick a random point within a cube of size [-1, 1]
      // This approach works better than parameterizing the spherical coordinates
      // since it doesn't have the issue of particles being bunched at the poles
      const p = new THREE.Vector3(
        2 * Math.random() - 1,
        2 * Math.random() - 1,
        2 * Math.random() - 1
      );

      // Project onto the surface of a sphere
      p.normalize();
      p.multiplyScalar(r);

      const size = Math.random() * (this.params.maxParticleSize - this.params.minParticleSize) + this.params.minParticleSize;

      verts.push(p.x, p.y, p.z);
      uvs.push(new THREE.Vector2(0.5, 0.5));
      sizes.push(size);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));

    this.geometry = geometry;
  }
}