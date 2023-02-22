import * as THREE from 'three';
import { Object3D } from "three";
import { GameObject } from '../game_object';

import vert from './snow_gpu.vert?raw';
import frag from './snow_gpu.frag?raw';

/** The time it takes a flake to fall onto the floor */
const FALL_TIME = 10;
/** The time it takes a flake to melt */
const MELT_TIME = 30;
/** Number of flakes in play */
export const NUM_FLAKES = 10000;

export const snowMaterial = new THREE.RawShaderMaterial( {
  uniforms: {
    'time': { value: 0.0 },
    'numFlakes': { value: NUM_FLAKES },
    'fallTime': { value: FALL_TIME },
    'meltTime': { value: MELT_TIME }
  },
  vertexShader: vert,
  fragmentShader: frag,
  side: THREE.DoubleSide,
  forceSinglePass: true,
  transparent: true
} );

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
geometry.instanceCount = NUM_FLAKES;
geometry.setAttribute('position', new THREE.Float32BufferAttribute(flakeGeometryPositions, 3));
geometry.setAttribute('uv', new THREE.Float32BufferAttribute(flakeGeometryUV, 2));

// Set default snow flake target positions
const instancepos = new Float32Array(NUM_FLAKES * 3);
for (let i=0; i< NUM_FLAKES; i++) {
  const offs = i * 3;
  instancepos[offs] = Math.random() * 10 - 5;
  instancepos[offs + 1] = 0.01;
  instancepos[offs + 2] = Math.random() * 10 - 5;
}
geometry.setAttribute( 'instancepos', new THREE.InstancedBufferAttribute( instancepos, 3 ) );

const mesh = new THREE.Mesh(geometry, snowMaterial);
// Make visible, but not to ray caster by changing layers
// mesh.layers.disable(0);
// mesh.layers.enable(3);

// Culling for instanced mesh culls all or none (not per instance), so we disable it.
mesh.frustumCulled = false;

/** Snow flakes falling down **/
export class SnowGpu implements GameObject {
  time = 0;

  setParent(parent: Object3D) {
    parent.add(mesh);
  }

  tick(dt: number) {
    this.time += dt;

    snowMaterial.uniforms.time.value = this.time;
  }

  setTargetPositions(pos: Float32Array) {
    geometry.setAttribute( 'instancepos', new THREE.InstancedBufferAttribute( pos, 3 ) );    
  }
}
