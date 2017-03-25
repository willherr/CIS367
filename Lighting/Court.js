/**
 * Created by William Herrmann on 3/9/2017.
 */


class Court {

	constructor (gl) {

		this.floor = new Cylinder(gl, 3, 3, 0.01, 4, 2);

		this.courtTransform = mat4.create();
		let moveCourt      = vec3.fromValues(0, 0, -.5);
		mat4.translate(this.courtTransform, this.courtTransform, moveCourt);

		this.tmp = mat4.create();
	}

	draw (vertexAttr, colorAttr, modelUniform, coordFrame) {

		gl.uniform3fv(objTintUnif, vec3.fromValues(208/255, 208/255, 208/255));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, .3);
		gl.uniform1f(specCoeffUnif, .3);
		gl.uniform1f(shininessUnif, 10);

		mat4.mul (this.tmp, coordFrame, this.courtTransform);
		this.floor.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}