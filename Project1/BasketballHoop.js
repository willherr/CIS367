/**
 * Created by Vincent Ball on 2/23/2017.
 */

class BasketballHoop {
    constructor (gl) {

        this.rim = new Torus(gl, 0.09, 0.01, 30, 10);
        this.backboard = new TruncatedCone2(gl, 0.375, 0.375, 0.03, 4, 2);
        this.pole = new TruncatedCone(gl, 0.04, 0.04, 2.75, 40, 2);
        this.secondPole = new TruncatedCone(gl, 0.05, 0.05, 0.7, 40, 2);
        this.net  = new Cylinder(gl, 0.02, 0.02, 0.45, 30);
        this.net2 = new Cylinder(gl, 0.02, 0.02, 0.45, 30);
        this.net3 = new Cylinder(gl, 0.02, 0.02, 0.45, 30);
        this.net4 = new Cylinder(gl, 0.02, 0.02, 0.45, 30);
        this.net5 = new Cylinder(gl, 0.02, 0.02, 0.45, 30);

        this.poleTransform = mat4.create();
        //mat4.rotateX (this.poleTransform, this.poleTransform, -Math.PI/14);
        mat4.rotateY (this.poleTransform, this.poleTransform, -Math.PI/12);
        let moveDown = vec3.fromValues (1.75, -1, -1.7);
        mat4.translate (this.poleTransform, this.poleTransform, moveDown);

        this.secondPoleTransform = mat4.create();
        //mat4.rotateY (this.secondPoleTransform, this.secondPoleTransform, Math.PI/2);
        mat4.rotateY (this.secondPoleTransform, this.secondPoleTransform, -Math.PI/12);
        let moveOver = vec3.fromValues (1.75, -1, -1.7);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, moveOver);
        mat4.rotateX (this.secondPoleTransform, this.secondPoleTransform, -Math.PI/3);
        let moveOver2 = vec3.fromValues (0, -2.35, 1.38);
        mat4.translate (this.secondPoleTransform, this.secondPoleTransform, moveOver2);

        this.backboardTransform = mat4.create();
        mat4.rotateX(this.backboardTransform, this.backboardTransform, Math.PI/2.3);
        mat4.rotateY(this.backboardTransform, this.backboardTransform, Math.PI/3.3);
        let moveBB = vec3.fromValues (1, 2.25, 1.3);
        mat4.translate (this.backboardTransform, this.backboardTransform, moveBB);

        this.rimTransform = mat4.create();
        let moveUp = vec3.fromValues (1.638, 0.65, 2.07);
        mat4.translate (this.rimTransform, this.rimTransform, moveUp);
        mat4.rotateY(this.rimTransform, this.rimTransform, Math.PI/200);
        mat4.rotateX(this.rimTransform, this.rimTransform, Math.PI/100);

        this.netTransform = mat4.create();
        mat4.rotateX(this.netTransform, this.netTransform, Math.PI);
        let moveNet = vec3.fromValues (0.2, -0.6, -0.7);
        mat4.translate (this.netTransform, this.netTransform, moveNet);

        this.net2Transform = mat4.create();
        mat4.rotateX(this.net2Transform, this.net2Transform, Math.PI);
        let moveNet2 = vec3.fromValues (0.25, -0.6, -0.7);
        mat4.translate (this.net2Transform, this.net2Transform, moveNet2);
        
        this.net3Transform = mat4.create();
        mat4.rotateX(this.net3Transform, this.net3Transform, Math.PI);
        let moveNet3 = vec3.fromValues (0.3, -0.6, -0.7);
        mat4.translate (this.net3Transform, this.net3Transform, moveNet3);

        this.net4Transform = mat4.create();
        mat4.rotateX(this.net4Transform, this.net4Transform, Math.PI);
        let moveNet4 = vec3.fromValues (0.35, -0.6, -0.7);
        mat4.translate (this.net4Transform, this.net4Transform, moveNet4);

        this.net5Transform = mat4.create();
        mat4.rotateX(this.net5Transform, this.net5Transform, Math.PI);
        let moveNet5 = vec3.fromValues (0.4, -0.6, -0.7);
        mat4.translate (this.net5Transform, this.net5Transform, moveNet5);

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

        /* Can make into a for loop later for net */
        /*
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
        */
    }
}