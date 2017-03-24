/**
 * Created by Vincent Ball on 2/23/2017.
 */

class Fence2 {
    constructor (gl) {

        let steel1 = vec3.fromValues(60/255, 60/255, 60/255);
        let steel2 = vec3.fromValues(108/255, 108/255, 108/255);

        this.fence2 = new Cylinder(gl, 0.022, 0.022, 0.95, 10, steel1, steel2);

        this.fence2Transform = mat4.create();
        let move = vec3.fromValues (0, 0, 0);
        mat4.translate (this.fence2Transform, this.fence2Transform, move);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
		gl.uniform3fv(objTintUnif, vec3.fromValues(108/255, 108/255, 108/255));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, 1);
		gl.uniform1f(specCoeffUnif, .5);
		gl.uniform1f(shininessUnif, 30)
        mat4.mul (this.tmp, coordFrame, this.fence2Transform);
        this.fence2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    }
}