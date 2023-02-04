precision highp float;

varying float vAlpha;
varying vec2 vUv;

void main() {
  float d = 2.0 * distance(vUv, vec2(0.5,0.5));
  float alpha = vAlpha * (1.0 - (d * d));
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
