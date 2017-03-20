/**
 * Created by Vincent Ball on 2/23/2017.
 */

class Fence {
    constructor (gl) {

        let steel1 = vec3.fromValues(60/255, 60/255, 60/255);
        let steel2 = vec3.fromValues(108/255, 108/255, 108/255);

        this.fence = new Cylinder(gl, 0.022, 0.022, 0.95, 10, steel1, steel2);

        this.fenceTransform = mat4.create();
        let move = vec3.fromValues (-1.45, -1.45, 0);
        mat4.translate (this.fenceTransform, this.fenceTransform, move);

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.fenceTransform);
        this.fence.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    }
}