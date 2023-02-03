import * as THREE from 'three';
import { Object3D } from "three";

import { snowMaterial } from './snow2-shaders';

// const MAX_AGE = 5;
const MAX_FLAKES = 1000;

// var numFlakes = 0;

/** Flake geometry */
const flakeGeometryPositions = [
  0.01, 0, 0.01,
  -0.01, 0, 0.01,
  0, 0, -0.01
];

/** Geometry, the same for all flakes */
const geometry = new THREE.InstancedBufferGeometry();
geometry.instanceCount = MAX_FLAKES;
geometry.setAttribute('position', new THREE.Float32BufferAttribute(flakeGeometryPositions, 3));

const mesh = new THREE.Mesh(geometry, snowMaterial);

/** Snow flakes falling down **/
export class Snow2 {
  time = 0;
  offsets: number[] = [];
  created: number[] = [];

  constructor() {
    for (let i=0; i<MAX_FLAKES; i++) {
      this.offsets.push(Math.random() * 10 - 5, 2.0, Math.random() * 10 - 5);
      this.created.push(this.time);
    }
    geometry.setAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( this.offsets ), 3 ) );
    geometry.setAttribute( 'tCreated', new THREE.InstancedBufferAttribute( new Float32Array( this.created ), 1 ) );
  }

  setParent(parent: Object3D) {
    parent.add(mesh);
    console.log('Parent set for snow 2');
  }

  tick(dt: number) {
    this.time += dt;

    snowMaterial.uniforms[ 'time' ].value = this.time;
  }
}
