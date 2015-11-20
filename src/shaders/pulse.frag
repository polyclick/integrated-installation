#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mouse;
varying vec2 v_uv;

void main() {
    vec2 st = -1.0 + 2.0 * v_uv;

    float movement = u_time * 20.0;

    float y = sign(sin(st.x * 50.0 + movement));
    vec3 color = vec3(y);

    gl_FragColor = vec4(color, 1.0);
}
