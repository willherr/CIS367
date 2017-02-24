/**
 * Created by User on 2/23/2017.
 */

class BasketballHoop {
    constructor (gl) {

        this.rim = new Torus(gl, 0.07, 0.02, 30, 10);
        this.backboard = new Cube(gl, 0.10, 20);
        this.pole = new TruncatedCone(gl, 0.04, 0.04, 0.4, 40, 2);
        this.secondPole = new TruncatedCone(gl, 0.02, 0.02, 0.22, 40, 2);

        //this.net = new Cone(0.05, 0.3, 30, 2);

        this.rimTransform = mat4.create();
        mat4.rotateX(this.rimTransform, this.rimTransform, Math.PI/2);
        let moveUp = vec3.fromValues (0.13, 0, -0.075);
        mat4.translate (this.rimTransform, this.rimTransform, moveUp);

        this.poleTransform = mat4.create();
        mat4.rotateX (this.poleTransform, this.poleTransform, -Math.PI/2);
        let moveDown = vec3.fromValues (-0.33, 0, -0.295);
        mat4.translate (this.poleTransform, this.poleTransform, moveDown);

        this.secondPoleTransform = mat4.create();
        mat4.rotateY (this.secondPoleTransform, this.secondPoleTransform, Math.PI/2);
        let moveOver = vec3.fromValues (-0.05, 0.085, -0.3);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, moveOver);

        this.backboardTransform = mat4.create();
        mat4.rotateY (this.backboardTransform, this.backboardTransform, Math.PI/1.05);
        let moveBB = vec3.fromValues (0.11, 0.11, 0.28);
        mat4.translate (this.backboardTransform, this.backboardTransform, moveBB);

        this.tmp = mat4.create();

    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {

        mat4.mul (this.tmp, coordFrame, this.rimTransform);
        this.rim.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.poleTransform);
        this.pole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.secondPoleTransform);
        this.secondPole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.backboardTransform);
        this.backboard.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        /*
        mat4.mul (this.tmp, coordFrame, this.gemTransform);
        this.net.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
        */

    }
}