import * as THREE from "three";

import { GameObject3D } from "./game_frame";

export class MainScene extends GameObject3D {
    constructor() {
        super(new THREE.Scene());

        this.scene.background = new THREE.Color(0xc3e9ff);
        this.scene.add(new THREE.HemisphereLight(0x888877, 0x777788));
        const light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(0.5, 1, 0.3);
        this.scene.add(light);
    }

    get scene() {
        return this.node as THREE.Scene;
    }
}
