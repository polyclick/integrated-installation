#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mouse;
uniform int u_mode;
uniform float u_amount;
uniform float u_speed;
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
}
