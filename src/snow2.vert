precision highp float;

const float PI2 = 3.14159 * 2.0;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 offset;
attribute float tCreated;

varying float vAlpha;
varying vec2 vUv;

void main() {
  float h = offset.y - mod(time - tCreated, 40.0);

  float tAngle = max(0.0, h) + tCreated;
  float angleZ = mod(tAngle, 1.0) * PI2;
  float angleY = mod(tAngle, PI2);

  // Rotation matrix:
  float ca = cos(angleZ);
  float sa = sin(angleZ);
  float cy = cos(angleY);
  float sy = sin(angleY);
  mat3 mRot = mat3(cy, -ca * cy, sa * sy,   sy, ca * cy, -sa * cy,   0, sa, ca);

  vec3 posRot = mRot * position;

  vec3 vPosition = vec3(offset.x, max(0.01, h), offset.z) + posRot;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  vAlpha = clamp((h + 10.0) * 0.1, 0.0, 1.0);
  vUv = uv;
}
