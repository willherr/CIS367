/**
 * Created by Vincent Ball on 2/23/2017.
 */

class BasketballHoop {
    constructor (gl) {

        let backboard1 = vec3.fromValues(220/255, 220/255, 220/255);
        let backboard2 = vec3.fromValues(195/255, 195/255, 195/255);

        let pole1color = vec3.fromValues(22/255, 28/255, 33/255);
        let pole2color = vec3.fromValues(55/255, 70/255, 85/255);

        this.rim = new Torus(gl, 0.1, 0.01, 30, 10);
        this.backboard = new TruncatedConeOrig(gl, 0.45, 0.45, 0.03, 4, 2, backboard1, backboard2);
        this.pole = new TruncatedConeOrig(gl, 0.04, 0.04, 3.2, 40, 2, pole1color, pole2color);
        this.secondPole = new TruncatedConeOrig(gl, 0.05, 0.05, 0.7, 40, 2, pole1color, pole2color);

        this.poleTransform = mat4.create();
        mat4.rotateY (this.poleTransform, this.poleTransform, -Math.PI/12);
        let moveDown = vec3.fromValues (1.75, -1, -1.7);
        mat4.translate (this.poleTransform, this.poleTransform, moveDown);

        this.secondPoleTransform = mat4.create();
        mat4.rotateY (this.secondPoleTransform, this.secondPoleTransform, -Math.PI/12);
        let moveOver = vec3.fromValues (1.75, -1, -1.7);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, moveOver);
        mat4.rotateX (this.secondPoleTransform, this.secondPoleTransform, -Math.PI/3);
        let moveOver2 = vec3.fromValues (0, -2.75, 1.62);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, moveOver2);

        this.backboardTransform = mat4.create();
        mat4.rotateX(this.backboardTransform, this.backboardTransform, Math.PI/2.3);
        mat4.rotateY(this.backboardTransform, this.backboardTransform, Math.PI/3.3);
        let moveBB = vec3.fromValues (0.2, 2.2, 1.4);
        mat4.translate (this.backboardTransform, this.backboardTransform, moveBB);

        this.rimTransform = mat4.create();
        let moveUp = vec3.fromValues (1.225, -0.105, 2.1);
        mat4.translate (this.rimTransform, this.rimTransform, moveUp);
        mat4.rotateY(this.rimTransform, this.rimTransform, Math.PI/200);
        mat4.rotateX(this.rimTransform, this.rimTransform, Math.PI/100);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {

        mat4.mul (this.tmp, coordFrame, this.poleTransform);
        this.pole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.secondPoleTransform);
        this.secondPole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.backboardTransform);
        this.backboard.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.rimTransform);
        this.rim.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}