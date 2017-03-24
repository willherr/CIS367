/** Created by William Herrmann **/
class Basketball {

	constructor(gl) {


		let orange1 = vec3.fromValues(255 / 255, 115 / 255, 0 / 255);
		let orange2 = vec3.fromValues(255 / 255, 140 / 255, 0 / 255);

		this.ball = new RecursiveSphere(gl, .09, 5, orange1, orange2);

		this.ballTransform = mat4.create();
		let moveBall = vec3.fromValues(.3, 0, 1);
		mat4.translate(this.ballTransform, this.ballTransform, moveBall);

		this.tmp = mat4.create();
	}

	draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
		gl.uniform3fv(objTintUnif, vec3.fromValues(1, 155 / 255, 0));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, 1);
		gl.uniform1f(specCoeffUnif, .5);
		gl.uniform1f(shininessUnif, 30);
		mat4.mul(this.tmp, coordFrame, this.ballTransform);
		this.ball.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}