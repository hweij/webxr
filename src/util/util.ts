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

export function createWall(points: number[], holes: number[][], matFront: THREE.Material, matBack: THREE.Material, pos: THREE.Vector3, rot?: THREE.Vector3, teleport?: boolean) {
  const group = new THREE.Group();
  const n = points.length / 2;
  const shape = new THREE.Shape();
  shape.moveTo(points[0], points[1]);
  for (let i = 1; i < n; i++) {
      const idx = i * 2;
      shape.lineTo(points[idx], points[idx + 1]);
  }
  for (let hole of holes) {
      const n = hole.length / 2;
      const path = new THREE.Path();
      path.moveTo(hole[0], hole[1]);
      for (let i = 1; i < n; i++) {
          const idx = i * 2;
          path.lineTo(hole[idx], hole[idx + 1]);
      }
      shape.holes.push(path);
  }
  const geometry = new THREE.ShapeGeometry(shape);

  let euler = null;
  if (rot) {
      const f = Math.PI / 180;
      euler = new THREE.Euler(rot.x * f, rot.y * f, rot.z * f);
  }
  const outside = new THREE.Mesh(geometry, matFront);
  group.add(outside);

  const inside = new THREE.Mesh(geometry, matBack);
  // Mirror, so it shows on the other side (and normals match as well)
  inside.scale.z = -1;
  group.add(inside);

  if (teleport) {
      inside.userData.teleport = true;
      outside.userData.teleport = true;
  }

  if (euler) {
      group.setRotationFromEuler(euler);
  }
  group.position.set(pos.x, pos.y, pos.z);
  return group;
}
