import * as THREE from 'three';

import { ExtrudeGeometry, Group, MeshBasicMaterial, MeshLambertMaterial, ShapeGeometry } from 'three';

import { GameObject } from '../game_object';

export class WallClock implements GameObject {
    group: Group = new THREE.Group();
    dialSeconds: THREE.Mesh;
    dialMinutes: THREE.Mesh;
    dialHours: THREE.Mesh;
    date = new Date();

    constructor() {
        // Casing (ring)
        const ring = this._createOuterRing();

        // Back plate
        const plateGeo = new THREE.CircleGeometry(0.15);
        plateGeo.translate(0, 0, 0.03);
        const plateMat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
        const plate = new THREE.Mesh(plateGeo, plateMat);

        // Time markers, just above the ring
        const markers = this._createTimeMarkers();
        markers.position.set(0, 0, 0.035);

        // Dial meshes
        this.dialSeconds = this._createDial(-0.02, 0.12, 0.001, '#440000');
        this.dialMinutes = this._createDial(-0.02, 0.12, 0.004);
        this.dialHours = this._createDial(-0.02, 0.08, 0.004);

        this.group.add(plate, ring, markers, this.dialSeconds, this.dialMinutes, this.dialHours);
    }

    tick(_dt: number) {
        const now = this.date;
        now.setTime(Date.now());
        const s = now.getSeconds();
        const m = now.getMinutes();
        this.dialSeconds.rotation.z = -s * Math.PI / 30;
        this.dialMinutes.rotation.z = -(s / 60 + m) * Math.PI / 30;
        this.dialHours.rotation.z = -((s/3600) + (m/60) + now.getHours()) * Math.PI / 6;
    }

    _createOuterRing() {
        // Outer contour
        var outer = new THREE.Shape();
        outer.moveTo(0, 0 );
        outer.absarc(0, 0, 0.15, 0, Math.PI*2, false);

        // Inner contour (hole)
        var inner = new THREE.Path();
        inner.moveTo(0, 0);
        inner.absarc(0, 0, 0.13, 0, Math.PI*2, true );
        outer.holes.push( inner );

        const ringGeo = new ExtrudeGeometry(outer, { bevelEnabled: false, depth: 0.05, curveSegments: 24 });
        const ringMat = new MeshLambertMaterial({ color: '#555555' });
        return new THREE.Mesh(ringGeo, ringMat);
    }

    _createDial(start: number, end: number, width: number, color = '#000000') {
        const w2 = width / 2;
        const dialShape = new THREE.Shape();
        dialShape.moveTo(-w2,start);
        dialShape.lineTo(w2, start);
        dialShape.lineTo(w2, end);
        dialShape.lineTo(-w2, end);
        const dialGeo = new ShapeGeometry(dialShape);
        dialGeo.translate(0, 0, 0.04);
        const dialMat = new THREE.MeshLambertMaterial({ color: color });
        return new THREE.Mesh(dialGeo, dialMat);
    }

    _createTimeMarkers() {
        const W = 0.0025;
        const L = 0.005;
        const coords = [
            -W, -L, W, -L, W, L,
            -W, -L, W, L, -W, L
        ];
        const vertices = new Float32Array(12 * 6 * 3);  // 2 triangles for each hour marker
        for (let i=0; i<12; i++) {
            const angle = i * Math.PI / 6;
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            for (let j=0; j<6; j++) {
                const offset = (i * 6 + j) * 3;
                const x = coords[j * 2];
                const y = (coords[j * 2 + 1] - L) * ((i % 3) ? 1 : 2) + 0.12;
                // Rotate over angle
                const xr = (c * x) - (s * y);
                const yr = (s * x) + (c * y);
                vertices[offset] = xr;
                vertices[offset + 1] = yr;
                vertices[offset + 2] = 0;
            }
        }
        const geo = new THREE.BufferGeometry();
        const mat = new MeshBasicMaterial({color: '#000000'});
        geo.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        return new THREE.Mesh(geo, mat);
    }

    get mesh() {
        return this.group;
    }
}
