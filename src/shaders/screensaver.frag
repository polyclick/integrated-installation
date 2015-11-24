#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_mouse;
uniform int u_mode;
uniform float u_amount;
uniform float u_speed;
uniform int u_mask;
varying vec2 v_uv;

void main() {

    // screen space coordinate
    vec2 st = -1.0 + 2.0 * v_uv;

    // movement in time
    float movement = u_time * u_speed;

    // final y position
    float y = 0.0;

    // vertical
    if(u_mode == 0) {
      y = sign(sin(st.x * u_amount + movement));

      // if(u_mask == 1) {
      //   vec2 ss = gl_FragCoord.xy / u_resolution.xy;
      //   y = sign(sin(st.x * u_amount)) * step(ss.x, tan(u_time * 5.0));
      // }
    }

    // horizontal
    if(u_mode == 1) {
      y = sign(sin(st.y * u_amount + movement));

      // if(u_mask == 1) {
      //   vec2 ss = gl_FragCoord.xy / u_resolution.xy;
      //   y = sign(sin(st.y * u_amount)) * step(ss.y, tan(u_time * 5.0));
      // }
    }

    gl_FragColor = vec4(vec3(y), 1.0);
}
