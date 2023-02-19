import * as THREE from 'three';
import { Vector3 } from 'three';

import { GameObject } from "../../game_object";

const WIDTH = 6;
const DEPTH = 4;
const HEIGHT = 2.4;

/** Outside wall default material */
const matOutside = new THREE.MeshLambertMaterial({ color: 0xcccccc });
/** Inside wall, default material */
const matInside = new THREE.MeshLambertMaterial({ color: 0xffff55, side: THREE.BackSide });

const boxGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
boxGeo.translate(0, HEIGHT / 2, 0);
const boxMat = new THREE.MeshLambertMaterial({
    color: 0xff00ff,
    wireframe: true
});

export class Office implements GameObject {
    group = new THREE.Group;

    constructor() {
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        this.group.add(boxMesh);

        // Create a wall
        this.createWalls();
    }

    tick(_dt: number) {

    }

    setParent(p: THREE.Group) {
        p.add(this.group);
    }

    createWalls() {
        // Front
        this.createWall([
            0, 0, 0, HEIGHT, WIDTH, HEIGHT, WIDTH, 0,
            1.9, 0, 1.9, 2, 1, 2, 1, 0],
            [[3, 1, 4, 1, 4, 2, 3, 2]],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0, DEPTH / 2));
        // Back
        this.createWall([
            0, 0, 0, HEIGHT, WIDTH, HEIGHT, WIDTH, 0],
            [[3, 1, 4, 1, 4, 2, 3, 2]],
            matOutside, matInside,
            new Vector3(WIDTH / 2, 0, -DEPTH / 2),
            new Vector3(0, 180, 0));
        // Left
        this.createWall([
            0, 0, 0, HEIGHT, DEPTH, HEIGHT, DEPTH, 0],
            [[1, 1, 2, 1, 2, 2, 1, 2]],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0, -DEPTH / 2),
            new Vector3(0, -90, 0));
        // Right
        this.createWall([
            0, 0, 0, HEIGHT, DEPTH, HEIGHT, DEPTH, 0],
            [[1, 1, 2, 1, 2, 2, 1, 2]],
            matOutside, matInside,
            new Vector3(WIDTH / 2, 0, DEPTH / 2),
            new Vector3(0, 90, 0));
        // Roof
        this.createWall([
            0, 0, 0, DEPTH, WIDTH, DEPTH, WIDTH, 0],
            [],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, HEIGHT, DEPTH / 2),
            new Vector3(-90, 0, 0));
        // Floor
        this.createWall([
            0, 0, 0, DEPTH, WIDTH, DEPTH, WIDTH, 0],
            [],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0.01, -DEPTH / 2),
            new Vector3(90, 0, 0));
    }

    createWall(points: number[], holes: number[][], matFront: THREE.Material, matBack: THREE.Material, pos: Vector3, rot?: Vector3) {
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
        if (euler) {
            outside.setRotationFromEuler(euler);
        }
        outside.position.set(pos.x, pos.y, pos.z);
        this.group.add(outside);

        const inside = new THREE.Mesh(geometry, matBack);
        if (euler) {
            inside.setRotationFromEuler(euler);
        }
        inside.position.set(pos.x, pos.y, pos.z);
        this.group.add(inside);
    }
}
