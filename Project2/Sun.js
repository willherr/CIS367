/** Created by William Herrmann **/
class Sun {

	constructor(gl) {

		let orange = vec3.fromValues(255 / 255, 115 / 255, 0 / 255);
		let yellow = vec3.fromValues(255 / 255, 255 / 255, 0 / 255);

		this.sunObj = new RecursiveSphere(gl, .2, 6, orange, yellow);

		this.sunObjTransform = mat4.create();
		let moveSunObj = vec3.fromValues(-7, -1.3, 1);
		mat4.translate(this.sunObjTransform, this.sunObjTransform, moveSunObj);

		this.tmp = mat4.create();
	}

	draw(vertexAttr, colorAttr, modelUniform, coordFrame) {

		mat4.mul(this.tmp, coordFrame, this.sunObjTransform);
		this.sunObj.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}