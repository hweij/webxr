import * as THREE from "three";
import { Float32BufferAttribute } from "three";

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
