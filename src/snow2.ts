import * as THREE from 'three';
import { Object3D } from "three";

import { snowMaterial } from './snow2-shaders';

const FALL_TIME = 10;
const MELT_TIME = 30;
const CYCLE_TIME = FALL_TIME + MELT_TIME;

const MAX_FLAKES = 10000;

// var numFlakes = 0;

/** Flake geometry, a quad of 2x2 cm */
const W = 0.01;
const Y = 0.002;
const flakeGeometryPositions = [
  -W, -Y, -W,
  -W,  Y,  W,
   W, -Y,  W,
   W, -Y,  W,
   W,  Y, -W,
  -W, -Y, -W,
 ];
const flakeGeometryUV = [
  0, 0,
  0, 1,
  1, 1,
  1, 1,
  1, 0,
  0, 0,
];

/** Geometry, the same for all flakes */
const geometry = new THREE.InstancedBufferGeometry();
geometry.instanceCount = MAX_FLAKES;
geometry.setAttribute('position', new THREE.Float32BufferAttribute(flakeGeometryPositions, 3));
geometry.setAttribute('uv', new THREE.Float32BufferAttribute(flakeGeometryUV, 2));

const mesh = new THREE.Mesh(geometry, snowMaterial);

// Culling for instanced mesh culls all or none (not per instance)
mesh.frustumCulled = false;

/** Snow flakes falling down **/
export class Snow2 {
  time = 0;
  offsets: number[] = [];
  created: number[] = [];

  constructor() {
    for (let i=0; i<MAX_FLAKES; i++) {
      this.offsets.push(Math.random() * 10 - 5, FALL_TIME, Math.random() * 10 - 5);
      this.created.push(this.time + (CYCLE_TIME * i / MAX_FLAKES));
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
