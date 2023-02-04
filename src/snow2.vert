precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

attribute vec3 position;
attribute vec3 offset;
attribute float tCreated;

varying float vAlpha;

void main() {
  float h = offset.y - mod(time - tCreated, 20.0);

  float tAngle = max(0.0, h) + tCreated;

  float angleZ = mod(tAngle, 1.0) * 2.0 * 3.1415;
  float c = cos(angleZ);
  float s = sin(angleZ);
  vec3 rotZ = vec3((position.x * c) - (position.y * s), (position.x * s) + (position.y * c), position.z);

  float angleY = mod(tAngle, 1.3) * 2.0 * 3.1415 / 1.3;
  float cy = cos(angleY);
  float sy = sin(angleY);
  vec3 rotY = vec3((rotZ.x * cy) - (rotZ.z * sy), rotZ.y, (rotZ.x * sy) + (rotZ.z * cy));

  vec3 vPosition = vec3(offset.x, max(0.01, h), offset.z) + rotY;
  vAlpha = clamp((h + 10.0) * 0.1, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
