/**
 * Created by User on 3/13/2017.
 */
/**
 * Created by Vincent Ball on 2/23/2017.
 */

class BasketballHoops {
    constructor (gl) {

        let backboard1 = vec3.fromValues(220/255, 220/255, 220/255);
        let backboard2 = vec3.fromValues(195/255, 195/255, 195/255);

        let pole1color = vec3.fromValues(22/255, 28/255, 33/255);
        let pole2color = vec3.fromValues(55/255, 70/255, 85/255);

        this.rim = new Torus(gl, 0.1, 0.01, 30, 10);
        this.backboard = new TruncatedConeOrig(gl, 0.45, 0.45, 0.03, 4, 2, backboard1, backboard2);
        this.pole = new Cylinder(gl, 0.045, 0.045, 2.1, 40, pole1color, pole2color);
        this.secondPole = new Cylinder(gl, 0.04, 0.04, 0.33, 40, 2, pole1color, pole2color);

        this.poleTransform = mat4.create();
        let moveDown = vec3.fromValues (1.35, -1.35, 0);
        mat4.translate (this.poleTransform, this.poleTransform, moveDown);

        this.secondPoleTransform = mat4.create();
        let move2pole = vec3.fromValues (1.2, -1.2, 1);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, move2pole);
        mat4.rotateX(this.secondPoleTransform, this.secondPoleTransform, Math.PI/2);
        mat4.rotateY(this.secondPoleTransform, this.secondPoleTransform, Math.PI/4);

        this.backboardTransform = mat4.create();

        mat4.rotateX(this.backboardTransform, this.backboardTransform, Math.PI/2);
        mat4.rotateY(this.backboardTransform, this.backboardTransform, Math.PI/4);
        let moveBB = vec3.fromValues (0, 1.15, 1.5);
        mat4.translate (this.backboardTransform, this.backboardTransform, moveBB);
        mat4.rotateZ(this.backboardTransform, this.backboardTransform, -Math.PI/4);

        this.rimTransform = mat4.create();
        let moveUp = vec3.fromValues (0.985, -0.995, 0.96);
        mat4.translate (this.rimTransform, this.rimTransform, moveUp);
        /*
        mat4.rotateY(this.rimTransform, this.rimTransform, Math.PI/200);
        mat4.rotateX(this.rimTransform, this.rimTransform, Math.PI/100);
        */

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