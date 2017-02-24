/**
 * Created by Vincent Ball on 2/23/2017.
 */

class BasketballHoop {
    constructor (gl) {

        this.rim = new Torus(gl, 0.06, 0.01, 30, 10);
        this.backboard = new Cube(gl, 0.1, 20);
        this.pole = new TruncatedCone(gl, 0.04, 0.04, 0.7, 40, 2);
        this.secondPole = new TruncatedCone(gl, 0.035, 0.035, 0.175, 40, 2);
        this.net = new Cone(gl, 0.01, 0.13, 30, 2);
        this.net2 = new Cone(gl, 0.01, 0.13, 30, 2);
        this.net3 = new Cone(gl, 0.01, 0.13, 30, 2);
        this.net4 = new Cone(gl, 0.01, 0.13, 30, 2);
        this.net5 = new Cone(gl, 0.01, 0.13, 30, 2);

        this.rimTransform = mat4.create();
        mat4.rotateX(this.rimTransform, this.rimTransform, Math.PI/2);
        let moveUp = vec3.fromValues (0.045, 0, -0.41);
        mat4.translate (this.rimTransform, this.rimTransform, moveUp);
        mat4.rotateX (this.rimTransform, this.rimTransform, -Math.PI/10);

        this.poleTransform = mat4.create();
        mat4.rotateX (this.poleTransform, this.poleTransform, -Math.PI/2);
        let moveDown = vec3.fromValues (-0.33, 0, -0.295);
        mat4.translate (this.poleTransform, this.poleTransform, moveDown);

        this.secondPoleTransform = mat4.create();
        mat4.rotateY (this.secondPoleTransform, this.secondPoleTransform, Math.PI/2);
        let moveOver = vec3.fromValues (-0.1, 0.375, -0.358);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, moveOver);
        mat4.rotateX (this.secondPoleTransform, this.secondPoleTransform, -Math.PI/10);

        this.backboardTransform = mat4.create();
        mat4.rotateY (this.backboardTransform, this.backboardTransform, Math.PI/1.01);
        let moveBB = vec3.fromValues (0.13, 0.46, 0.28);
        mat4.translate (this.backboardTransform, this.backboardTransform, moveBB);


        /* Can make into a for loop later for net */
        this.netTransform = mat4.create();
        mat4.rotateX(this.netTransform, this.netTransform, Math.PI/2);
        let moveNet = vec3.fromValues (0.005, 0, -0.39);
        mat4.translate (this.netTransform, this.netTransform, moveNet);

        this.net2Transform = mat4.create();
        mat4.rotateX(this.net2Transform, this.net2Transform, -Math.PI/2);
        let moveNet2 = vec3.fromValues (0.025, 0, 0.27);
        mat4.translate (this.net2Transform, this.net2Transform, moveNet2);

        this.net3Transform = mat4.create();
        mat4.rotateX(this.net3Transform, this.net3Transform, Math.PI/2);
        let moveNet3 = vec3.fromValues (0.045, 0, -0.39);
        mat4.translate (this.net3Transform, this.net3Transform, moveNet3);

        this.net4Transform = mat4.create();
        mat4.rotateX(this.net4Transform, this.net4Transform, -Math.PI/2);
        let moveNet4 = vec3.fromValues (0.065, 0, 0.27);
        mat4.translate (this.net4Transform, this.net4Transform, moveNet4);

        this.net5Transform = mat4.create();
        mat4.rotateX(this.net5Transform, this.net5Transform, Math.PI/2);
        let moveNet5 = vec3.fromValues (0.085, 0, -0.39);
        mat4.translate (this.net5Transform, this.net5Transform, moveNet5);

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

        /* Can make into a for loop later for net */
        mat4.mul (this.tmp, coordFrame, this.netTransform);
        this.net.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.net2Transform);
        this.net2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.net3Transform);
        this.net3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.net4Transform);
        this.net4.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.net5Transform);
        this.net5.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}