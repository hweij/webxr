import * as THREE from 'three';

import { Group, ShapeGeometry } from 'three';

import { GameObject } from '../game_object';

export class WallClock implements GameObject {
    group: Group = new THREE.Group();
    dialSeconds: THREE.Mesh;
    dialMinutes: THREE.Mesh;
    dialHours: THREE.Mesh;

    constructor() {
        // Create casing
        const casingGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05);
        casingGeo.rotateX(Math.PI/2);
        casingGeo.translate(0, 0, 0.025);

        const casingMat = new THREE.MeshLambertMaterial({ color: '#cccccc' });
        const casing = new THREE.Mesh(casingGeo, casingMat);

        // Dial meshes
        this.dialSeconds = this._createDial(0.12, 0.002, '#440000');
        this.dialMinutes = this._createDial(0.12, 0.004);
        this.dialHours = this._createDial(0.08, 0.004);

        this.group.add(casing, this.dialSeconds, this.dialMinutes, this.dialHours);
    }

    tick(_dt: number) {
        const now = new Date();
        const s = now.getSeconds();
        const m = now.getMinutes();
        this.dialSeconds.rotation.z = -s * Math.PI / 30;
        this.dialMinutes.rotation.z = -(s / 60 + m) * Math.PI / 30;
        this.dialHours.rotation.z = -((s/3600) + (m/60) + now.getHours()) * Math.PI / 6;
    }

    _createDial(length: number, width: number, color = '#000000') {
        const w2 = width / 2;
        const dialShape = new THREE.Shape();
        dialShape.moveTo(-w2,0);
        dialShape.lineTo(w2, 0);
        dialShape.lineTo(w2, length);
        dialShape.lineTo(-w2, length);
        const dialGeo = new ShapeGeometry(dialShape);
        dialGeo.translate(0, 0, 0.054);
        const dialMat = new THREE.MeshBasicMaterial({ color: color });
        return new THREE.Mesh(dialGeo, dialMat);
    }

    get mesh() {
        return this.group;
    }
}
