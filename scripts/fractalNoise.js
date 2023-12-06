import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';

const noise = new SimplexNoise();

// Fractal noise
export default function fnoise(x, y, z, uniforms) {
  let amplitude = 1.0;
  let scale = uniforms.n_scale.value;
  let total = 0.0;
  let maxAmplitude = 0.0; 

  for (let i = 0; i < uniforms.n_octaves.value; i++) {
    total += noise.noise3d(x / scale, y / scale, z / scale) * amplitude;
    scale /= uniforms.n_lacunarity.value;
    maxAmplitude += amplitude;
    amplitude *= uniforms.n_persistence.value;
  }

  return uniforms.n_amplitude.value * (total / maxAmplitude);
}