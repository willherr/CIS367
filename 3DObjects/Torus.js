/**
 * Created by Vincent Ball on 2/10/2017.
 */
class Torus {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} largeRadius  radius of the cone base
     * @param {Number} smallRadius radius of the cone top
     * @param {Number} subDiv
     * @param {Number} vSubDiv
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor (gl, largeRadius, smallRadius, subDiv, vSubDiv, col1, col2) {

        //Draw outer circle then draw inner circle.  Connect those two using triangle strip
        //(say 8 points for each circle) --> (0,8,1,9,2,10,11,12......)

        /* if colors are undefined, generate random colors */
        let col1Undefined, col2Undefined = false;
        if (typeof col1 === "undefined"){ col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col1Undefined = true;}
        if (typeof col2 === "undefined"){ col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col2Undefined = true;}
        let randColor = vec3.create();
        this.vbuff = gl.createBuffer();
        let vertices = [];

        /********************VERTICES**********************/
        for (let latNumber = 0; latNumber <= vSubDiv; latNumber++)
        {
            let angle = latNumber * 8 * Math.PI / subDiv;

            for (let a = 0; a <= subDiv; a++) {
                let vAngle = a * 2 * Math.PI / subDiv;

                let x = (largeRadius + smallRadius * Math.cos(vAngle)) * Math.cos(angle);
                let y = (largeRadius + smallRadius * Math.cos(vAngle)) * Math.sin(angle);
                let z = smallRadius * Math.sin(vAngle);

                vertices.push(x, y, z);
                vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
                vertices.push(randColor[0], randColor[1], randColor[2]);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


        /********************INDEX**************************/
        let indices = [];
        for (let latNumber = 0; latNumber < vSubDiv; latNumber++) {
            for (let a = 0; a < subDiv; a++) {
                let first = (latNumber * (subDiv + 1)) + a;
                let second = first + subDiv + 1;
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);
                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        this.torusIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.torusIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices), gl.STATIC_DRAW);

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        this.indices = [{"primitive": gl.TRIANGLE_STRIP, "buffer": this.torusIdxBuff, "numPoints": indices.length}
        ];
    }

    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        /* copy the coordinate frame matrix to the uniform memory in shader */
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        /* binder the (vertex+color) buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

        /* with the "packed layout"  (x,y,z,r,g,b),
         the stride distance between one group to the next is 24 bytes */
        gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */

        //draw top and bottom
        for (let k = 0; k < 1; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

    }
}