#version 300 es

precision highp float;

in float vAlpha;
in vec2 vUv;

out vec4 FragColor;

void main() {
  float d = 2.0 * distance(vUv, vec2(0.5,0.5));
  float alpha = vAlpha * (1.0 - (d * d));
  FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
