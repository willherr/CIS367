/**
 * Created by William Herrmann on 3/9/2017.
 */


class Shooter {

	constructor (gl) {

		let skin1 = vec3.fromValues(222/255, 184/255, 135/255);
		let skin2 = vec3.fromValues(210/255, 180/255, 140/255);

		let jersey1 = vec3.fromValues(30/255, 144/255, 255/255);
		let jersey2 = vec3.fromValues(0/255, 191/255, 255/255);
		let jersey3 = vec3.fromValues(176/255, 196/255, 222/255);

		let pants1 = vec3.fromValues(0, 0, 150/255);
		let pants2 = vec3.fromValues(0, 0, 110/255);

		this.head = new RecursiveSphere(gl, .03, 5, skin1, skin2);
		this.body = new Cube(gl, .07, 1, jersey1, jersey2, jersey3);
		this.lleg = new Cylinder(gl, .01, .01, .07, 20, pants1, pants2);
		this.rleg = new Cylinder(gl, .01, .01, .07, 20, pants1, pants2);
		this.larm = new Cone(gl, .01, .06, 20, 1, skin1, skin2);
		this.rarm = new Cone(gl, .01, .06, 20, 1, skin1, skin2);


		this.headTransform = mat4.create();
		let moveHead       = vec3.fromValues(0, 0, .07);
		mat4.translate(this.headTransform, this.headTransform, moveHead);

		this.llegTransform = mat4.create();
		let moveLLeg       = vec3.fromValues(0, -.02, -.07);
		mat4.translate(this.llegTransform, this.llegTransform, moveLLeg);

		this.rlegTransform = mat4.create();
		let moveRLeg       = vec3.fromValues(0, .02, -.07);
		mat4.translate(this.rlegTransform, this.rlegTransform, moveRLeg);

		this.larmTransform = mat4.create();
		let moveLArm       = vec3.fromValues(0, .055, .045);
		mat4.translate(this.larmTransform, this.larmTransform, moveLArm);
		mat4.rotateX(this.larmTransform, this.larmTransform, 5*Math.PI/6);

		this.rarmTransform = mat4.create();
		let moveRArm       = vec3.fromValues(0, -.05, .07);
		mat4.translate(this.rarmTransform, this.rarmTransform, moveRArm);
		mat4.rotateX(this.rarmTransform, this.rarmTransform, 21*Math.PI/18);

		this.bodyTransform = mat4.create();
		let scaleBody      = vec3.fromValues(.03/.07, .05/.07, 1);
		mat4.scale(this.bodyTransform, this.bodyTransform, scaleBody);


		this.tmp = mat4.create();
	}

	draw (vertexAttr, colorAttr, modelUniform, coordFrame) {

		gl.uniform3fv(objTintUnif, vec3.fromValues(222/255, 184/255, 135/255));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, 1);
		gl.uniform1f(specCoeffUnif, .5);
		gl.uniform1f(shininessUnif, 20);

		mat4.mul (this.tmp, coordFrame, this.headTransform);
		this.head.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.larmTransform);
		this.larm.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.rarmTransform);
		this.rarm.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		gl.uniform3fv(objTintUnif, vec3.fromValues(0, 0, 150/255));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, .5);
		gl.uniform1f(specCoeffUnif, .1);
		gl.uniform1f(shininessUnif, 5);

		mat4.mul (this.tmp, coordFrame, this.llegTransform);
		this.lleg.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.rlegTransform);
		this.rleg.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		gl.uniform3fv(objTintUnif, vec3.fromValues(30/255, 144/255, 255/255));
		gl.uniform1f(ambCoeffUnif, 1);
		gl.uniform1f(diffCoeffUnif, .5);
		gl.uniform1f(specCoeffUnif, .1);
		gl.uniform1f(shininessUnif, 15);

		mat4.mul (this.tmp, coordFrame, this.bodyTransform);
		this.body.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}