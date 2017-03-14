/** Created by William Herrmann **/
class Basketball {

	constructor (gl) {

		let orange1 = vec3.fromValues(255/255, 115/255, 0/255);
		let orange2 = vec3.fromValues(255/255, 140/255, 0/255);

		this.ball = new RecursiveSphere(gl, .08, 5, orange1, orange2);

		this.ballTransform = mat4.create();
		let moveBall       = vec3.fromValues(.3, 0, 1);
		mat4.translate(this.ballTransform, this.ballTransform, moveBall);

		this.tmp = mat4.create();
	}

	draw (vertexAttr, colorAttr, modelUniform, coordFrame) {

		mat4.mul (this.tmp, coordFrame, this.ballTransform);
		this.ball.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}/**
 * Created by willherr on 3/13/2017.
 */
