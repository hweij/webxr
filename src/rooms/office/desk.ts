import * as THREE from "three";

import { GameObject } from "../../game_object";

const WIDTH = 1.6;
const DEPTH = 0.8;
const HEIGHT = 0.8;

const deskGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
deskGeo.translate(0, HEIGHT / 2, 0);
const deskMaterial = new THREE.MeshLambertMaterial({
    color: 0xBAA48A
});

export class Desk implements GameObject {
    group = new THREE.Group;

    constructor() {
        const deskMesh = new THREE.Mesh(deskGeo, deskMaterial);
        this.group.add(deskMesh)
    }
    
    tick(_dt: number) {

    }

    setParent(p: THREE.Group) {
        p.add(this.group);
    }
}
