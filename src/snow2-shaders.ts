import * as THREE from 'three';

import vert from './snow2.vert?raw';
import frag from './snow2.frag?raw';

export const snowMaterial = new THREE.RawShaderMaterial( {
  uniforms: {
    'time': { value: 1.0 }
  },
  vertexShader: vert,
  fragmentShader: frag,
  side: THREE.DoubleSide,
  forceSinglePass: true,
  transparent: true
} );
