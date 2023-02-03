import * as THREE from 'three';

const vert = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

attribute vec3 position;
attribute vec3 offset;
attribute float tCreated;

varying float vAlpha;

void main() {
  float h = offset.y - (time - tCreated);
  vec3 vPosition = vec3(offset.x, max(0.01, h), offset.z) + position;
  vAlpha = clamp((h + 10.0) * 0.1, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;

const frag = `
precision highp float;

varying float vAlpha;

void main() {
  gl_FragColor = vec4(0.0, 1.0, 1.0, vAlpha);
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