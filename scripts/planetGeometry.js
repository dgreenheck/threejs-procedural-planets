import * as THREE from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import fnoise from './fractalNoise';

function sphericalToCartesian(r, theta, phi) {
  const thetaRad = degToRad(theta);
  const phiRad = degToRad(phi);

  return new THREE.Vector3(
    r * Math.cos(phiRad) * Math.sin(thetaRad),
    r * Math.sin(phiRad),
    r * Math.cos(phiRad) * Math.cos(thetaRad));
}

export class PlanetGeometry extends THREE.BufferGeometry {
  constructor(radius, phiSegments, thetaSegments, uniforms) {
    super();

    const vertices = [];
    const normals = [];
    const noise = [];
    const triangles = [];

    const r = radius;
    const phiStep = 180 / phiSegments;
    const thetaStep = 360 / thetaSegments;

    function perturbedVertex(r, theta, phi) {
      // Get Cartesian coordinates of point on sphere
      const coords = sphericalToCartesian(r, theta, phi);
      // Compute noise value at that set of coordinates
      let delta = fnoise(coords.x, coords.y, coords.z, uniforms);
      // Don't allow negative noise
      delta = Math.max(0, delta);
      // Re-compute Cartesian coordinates of perturbed point
      return {
        delta,
        vertex: sphericalToCartesian(delta + r, theta, phi)
      };
    }
    
    const top = perturbedVertex(r, 0, 90);
    const bottom = perturbedVertex(r, 0, -90);

    // Push top point of sphere
    vertices.push(top.vertex.x, top.vertex.y, top.vertex.z);
    noise.push(top.noise);

    // Add vertices for each segment
    for (let phi = 90 - phiStep; phi >= -90 + phiStep; phi -= phiStep) {
      for (let theta = 0; theta <= 360; theta += thetaStep) {
        const { delta, vertex } = perturbedVertex(r, theta, phi);
        vertices.push(vertex.x, vertex.y, vertex.z);
        vertex.normalize();
        noise.push(delta);
      }
    }

    // Push bottom point of sphere

    vertices.push(bottom.vertex.x, bottom.vertex.y, bottom.vertex.z);
    normals.push(...[0, -1, 0])
    noise.push(bottom.noise);

    // Calculate indices for triangles
    let k = 1;
    for (let phi = 0; phi < phiSegments - 1; phi++) {
      if (phi === 0) {
        // Top row of triangles
        for (let theta = 0; theta < thetaSegments; theta++) {
          triangles.push(0, k, k + 1);
          k++;
        }
      } else {
        for (let theta = 0; theta < thetaSegments; theta++) {
          // Middle rows of triangles
          triangles.push(k - thetaSegments, k + 1, k + 2);
          triangles.push(k - thetaSegments, k + 2, k - thetaSegments + 1);

          // Bottom row of triangles
          if (phi === phiSegments - 2) {
            triangles.push((vertices.length / 3) - 1, k + 1, k + 2);
          }

          k++;
        }
        k++;
      }
    }

    this.setIndex(triangles);
    this.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.setAttribute('noise', new THREE.BufferAttribute(new Float32Array(noise), 1));

    console.log(`Triangle Count ${triangles.length / 3}`);
    this.computeBoundingBox();
    this.computeBoundingSphere();
    this.computeVertexNormals();
  }
}
