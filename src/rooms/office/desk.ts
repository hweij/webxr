import * as THREE from "three";

import { GameContext, GameObject } from "../../game_object";

const WIDTH = 1.6;
const DEPTH = 0.8;
const HEIGHT = 0.8;
const THICK = 0.03;
const LEGTHICK = 0.04;

const deskGeo = new THREE.BoxGeometry(WIDTH, THICK, DEPTH);
const legGeo = new THREE.BoxGeometry(LEGTHICK, HEIGHT, LEGTHICK);
deskGeo.translate(0, HEIGHT, 0);
const deskMaterial = new THREE.MeshLambertMaterial({
    color: 0xBAA48A
});
const legMaterial = new THREE.MeshLambertMaterial({
    color: 0x444444
});

export class Desk implements GameObject {
    group = new THREE.Group;

    constructor() {
        const deskMesh = new THREE.Mesh(deskGeo, deskMaterial);
        this.group.add(deskMesh)
        // Legs
        const x = (WIDTH - LEGTHICK) / 2 - 0.02;
        const y = (DEPTH - LEGTHICK) / 2 - 0.02;
        this._addLeg(-x, -y);
        this._addLeg(-x, y);
        this._addLeg(x, y);
        this._addLeg(x, -y);
    }

    tick(_context: GameContext) {

    }

    get mesh() {
        return this.group;
    }
    
    _addLeg(x: number, y: number) {
        const mesh = new THREE.Mesh(legGeo, legMaterial);
        mesh.position.x = x;
        mesh.position.y = HEIGHT/2;
        mesh.position.z = y;
        this.group.add(mesh)
    }
}
