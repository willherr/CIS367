/** Created by William Herrmann **/
class Lamp {

	constructor(gl) {

		let x = 1.8;
		let y = -1;
		let z = -1;

		let silver1 = vec3.fromValues(192 / 255, 192 / 255, 192 / 255);
		let silver2 = vec3.fromValues(211 / 255, 211 / 255, 211 / 255);

		let yellow1 = vec3.fromValues(255 / 255, 255 / 255, 224 / 255);
		let yellow2 = vec3.fromValues(255 / 255, 255 / 255, 224 / 255);

		this.lightPole = new Cylinder(gl, .05, .05, 1, 30, silver1, silver2);
		this.lightBulb = new RecursiveSphere(gl, .08, 5, yellow1, yellow2);

		this.lightPoleTransform = mat4.create();
		let moveLightPole = vec3.fromValues(x, y, z);
		mat4.translate(this.lightPoleTransform, this.lightPoleTransform, moveLightPole);

		this.lightBulbTransform = mat4.create();
		let moveLightBulb = vec3.fromValues(x, y, z + .4);
		mat4.translate(this.lightBulbTransform, this.lightBulbTransform, moveLightBulb);

		let scaleBulb      = vec3.fromValues(1, 1, 2);
		mat4.scale(this.lightBulbTransform, this.lightBulbTransform, scaleBulb);

		this.tmp = mat4.create();
	}

	draw(vertexAttr, colorAttr, modelUniform, coordFrame) {

		gl.uniform3fv(objTintUnif, vec3.fromValues(185/255, 185/255, 185/255));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, 1);
		gl.uniform1f(specCoeffUnif, .8);
		gl.uniform1f(shininessUnif, 100);

		mat4.mul(this.tmp, coordFrame, this.lightPoleTransform);
		this.lightPole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		gl.disableVertexAttribArray(normalAttr);
		gl.enableVertexAttribArray(colAttr);
		gl.uniform1i(useLightingUnif, false);
		gl.uniform3fv(objTintUnif, vec3.fromValues(1, 1, 0));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, 1);
		gl.uniform1f(specCoeffUnif, 1);
		gl.uniform1f(shininessUnif, 1);

		mat4.mul(this.tmp, coordFrame, this.lightBulbTransform);
		this.lightBulb.draw(vertexAttr, colAttr, modelUniform, this.tmp);
	}
}