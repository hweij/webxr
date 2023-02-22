#version 300 es

precision highp float;

// This must match the number of elements in the indexed geometry
uniform float numFlakes;
// Time it takes a snow flake to fall to the floor
uniform float fallTime;
// Time it takes a flake to melt
uniform float meltTime;
// Current time, in seconds
uniform float time;

const float PI2 = 3.14159 * 2.0;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
// Mesh vertices
in vec3 position;
in vec2 uv;
// Per-instance position
in vec3 instancepos;

out float vAlpha;
out vec2 vUv;

void main() {
  float cycleTime = fallTime + meltTime;

  float created = float(gl_InstanceID) * cycleTime / numFlakes;

  float h = fallTime - mod(time - created, meltTime);

  float tAngle = max(instancepos.y, h) + created;
  float angleZ = mod(tAngle, 1.0) * PI2;
  float angleY = mod(tAngle, PI2);

  // Rotation matrix:
  float ca = cos(angleZ);
  float sa = sin(angleZ);
  float cy = cos(angleY);
  float sy = sin(angleY);
  mat3 mRot = mat3(cy, -ca * cy, sa * sy,   sy, ca * cy, -sa * cy,   0, sa, ca);

  vec3 posRot = mRot * position;

  vec3 vPosition = vec3(instancepos.x, max(instancepos.y, h), instancepos.z) + posRot;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  vAlpha = clamp((h + 10.0) * 0.1, 0.0, 1.0);
  vUv = uv;
}
