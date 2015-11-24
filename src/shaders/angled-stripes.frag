#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_depth;
varying vec2 v_uv;

#define M_PI 3.1415926535897932384626433832795

void main() {
  vec2 uv = -1.0 + 2.0 * v_uv;
  vec2 a = vec2( 0.0, 0.0 );
  vec2 b = vec2( 1.0, 1.0 );
  float angle = atan( b.x-a.x, b.y-a.y );

  float p = ( (angle) / M_PI ) * 0.5;
  float sx = ( 1.0 - p ) * uv.x;
  float sy = p * uv.y;
  float s = sin( ( sx - sy ) * 100.0 );

  vec3 c = vec3( 1.0, 1.0, 1.0 );
  if( s < 0.3 ){
      c = vec3( 0.0, 0.0, 0.0 );
  }
  gl_FragColor = vec4( c.xyz * u_depth, 1.0);
}
