#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mouse;

void main() {
  float d = distance(gl_FragCoord.xy, u_resolution.xy * vec2(0.5, 0.5).xy);
  float x = sin(5.0 + (0.15 * d) + (u_time * 7.5)) * 10.0;

  // some drivers don't appear to cope with over ranged values.
  x = clamp( x, 0.0, 1.0 );

  gl_FragColor = vec4( x, x, x, 1.0 );
}
