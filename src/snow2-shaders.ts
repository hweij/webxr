import * as THREE from 'three';

const vert = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

attribute vec3 position;
attribute vec3 offset;
attribute float tCreated;

void main() {
  vec3 vPosition = vec3(offset.x, max(0.0, offset.y - (time - tCreated)), offset.z) + position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;

const frag = `
precision highp float;

void main() {
  gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
}
`;

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