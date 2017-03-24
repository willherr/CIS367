precision mediump float;

varying vec4 varColor;
void main() {
  if (gl_FrontFacing)
    gl_FragColor = varColor;
  else
    gl_FragColor = vec4(1, 1, 1, 1);
}