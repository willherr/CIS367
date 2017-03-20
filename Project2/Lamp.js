/** Created by William Herrmann **/
class Lamp {

	constructor(gl) {

		let x = 1.8;
		let y = -1;
		let z = -1;

		let silver1 = vec3.fromValues(192 / 255, 192 / 255, 192 / 255);
		let silver2 = vec3.fromValues(211 / 255, 211 / 255, 211 / 255);

		let yellow1 = vec3.fromValues(255 / 255, 255 / 255, 224 / 255);
		let yellow2 = vec3.fromValues(255 / 255, 250 / 255, 205 / 255);

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

		mat4.mul(this.tmp, coordFrame, this.lightPoleTransform);
		this.lightPole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul(this.tmp, coordFrame, this.lightBulbTransform);
		this.lightBulb.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}