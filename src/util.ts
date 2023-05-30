import * as THREE from "three";
import { Float32BufferAttribute } from "three";

export function createBezelGeometry(width: number, height: number, depth: number, bezelWidth: number) {
  const geo = new THREE.BufferGeometry();
  const x = width / 2;
  const y = height / 2;
  const z = -depth / 2;
  const ix = x - bezelWidth;
  const iy = y - bezelWidth;
  const pos = new THREE.BufferAttribute(new Float32Array(
    [
      // Front
      -ix, iy, z, -x, -y, z, -x, y, z, -ix, iy, z, -ix, -iy, z, -x, -y, z,
      x, y, z, x, -y, z, ix, iy, z, x, -y, z, ix, -iy, z, ix, iy, z,
      x, y, z, ix, iy, z, -x, y, z, -x, y, z, ix, iy, z, -ix, iy, z,
      -x, -y, z, ix, -iy, z, x, -y, z, -ix, -iy, z, ix, -iy, z, -x, -y, z,
      // Back
      -x, y, -z, -x, -y, -z, -ix, iy, -z, -x, -y, -z, -ix, -iy, -z, -ix, iy, -z,
      ix, iy, -z, x, -y, -z, x, y, -z, ix, iy, -z, ix, -iy, -z, x, -y, -z,
      -x, y, -z, ix, iy, -z, x, y, -z, -ix, iy, -z, ix, iy, -z, -x, y, -z,
      x, -y, -z, ix, -iy, -z, -x, -y, -z, -x, -y, -z, ix, -iy, -z, -ix, -iy, -z,
      // Outside
      -x, y, z, -x, -y, z, -x, -y, -z, -x, -y, -z, -x, y, -z, -x, y, z,
      x, -y, -z, x, -y, z, x, y, z, x, y, z, x, y, -z, x, -y, -z,
      -x, y, z, -x, y, -z, x, y, -z, x, y, -z, x, y, z, -x, y, z,
      x, -y, -z, -x, -y, -z, -x, -y, z, -x, -y, z, x, -y, z, x, -y, -z,
      // inside
      ix, iy, z, ix, -iy, z, ix, -iy, -z, ix, -iy, -z, ix, iy, -z, ix, iy, z,
      -ix, -iy, -z, -ix, -iy, z, -ix, iy, z, -ix, iy, z, -ix, iy, -z, -ix, -iy, -z,
      -ix, -iy, z, -ix, -iy, -z, ix, -iy, -z, ix, -iy, -z, ix, -iy, z, -ix, -iy, z,
      ix, iy, -z, -ix, iy, -z, -ix, iy, z, -ix, iy, z, ix, iy, z, ix, iy, -z,
    ]), 3);
  geo.setAttribute('position', pos);
  geo.computeVertexNormals();
  return geo;
}

export function createLandscape(width: number, depth: number, segments: number) {
  const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
  const vertices = geo.getAttribute("position") as Float32BufferAttribute;
  const ar = vertices.array as Float32Array;
  let offset = 2; // Offset for z-coordinate
  for (let x=0; x<=segments; x++) {
    for (let y=0; y <= segments; y++) {
      ar[offset] = Math.random() * 0.1;
      offset += 3;
    }
  }
  vertices.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
