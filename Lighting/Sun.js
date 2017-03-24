/** Created by William Herrmann **/
class Sun {

	constructor(gl) {

		let orange = vec3.fromValues(255 / 255, 200 / 255, 0 / 255);
		let yellow = vec3.fromValues(255 / 255, 200 / 255, 0 / 255);

		this.sunObj = new RecursiveSphere(gl, .1, 6, orange, yellow);

		this.sunObjTransform = mat4.create();
		let moveSunObj = vec3.fromValues(-6, -2, 1);
		mat4.translate(this.sunObjTransform, this.sunObjTransform, moveSunObj);

		this.tmp = mat4.create();
	}

	draw(vertexAttr, colorAttr, modelUniform, coordFrame) {

		gl.uniform3fv(objTintUnif, vec3.fromValues(1, 240/255, 0));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, 1);
		gl.uniform1f(specCoeffUnif, 1);
		gl.uniform1f(shininessUnif, 1);

		mat4.mul(this.tmp, coordFrame, this.sunObjTransform);
		this.sunObj.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}