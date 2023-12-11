import * as THREE from 'three';

const texLoader = new THREE.TextureLoader();
const cloudTex = texLoader.load('cloud.png');

export class Atmosphere extends THREE.Points {
  constructor(params) {
    super();

    this.params = params;

    const noiseFunctions = document.getElementById('noise-functions').innerHTML;
    const vertexShader = document.getElementById('atmosphere-vert-shader').innerHTML;
    const fragmentShader = document.getElementById('atmosphere-frag-shader').innerHTML;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: cloudTex },
        ...params
      },
      vertexShader,
      fragmentShader: fragmentShader.replace(
        'void main() {',
        `${noiseFunctions}
         void main() {`
      ),
      blending: THREE.NormalBlending,
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
    for(let i = 0; i < this.params.particles.value; i++) {
      let r = Math.random() * this.params.thickness.value + this.params.radius.value;

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

      const minSize = this.params.minParticleSize.value;
      const maxSize = this.params.maxParticleSize.value;
      const size = Math.random() * (maxSize - minSize) + minSize;

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