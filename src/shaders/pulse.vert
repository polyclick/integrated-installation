#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mouse;
varying vec2 v_uv;

void main() {
    v_uv = uv;

    float strength = 25.0;
    float movement = u_mouse * 10.0;

    float wave = (cos(position.y * 0.05 + movement) + 1.0 ) * strength;
    float zPosition = wave;

    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(position.x, position.y, zPosition, 1.0);
}
