import * as THREE from "three";
import { Vector3 } from "three";
import { Teleport } from "../teleport";

export function createWall(points: number[], holes: number[][], matFront: THREE.Material, matBack: THREE.Material, pos: Vector3, rot?: Vector3) {
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

    if (euler) {
        group.setRotationFromEuler(euler);
    }
    group.position.set(pos.x, pos.y, pos.z);
    return group;
}
