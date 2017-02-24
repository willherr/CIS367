/**
 * Created by Vincent Ball on 2/19/2017.
 */
class Cube {
    /**
     *
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl the current WebGL context
     * @param {Number} length  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor (gl, length, subDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        let col1Undefined, col2Undefined = false;
        if (typeof col1 === "undefined"){ col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col1Undefined = true;}
        if (typeof col2 === "undefined"){ col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col2Undefined = true;}
        let randColor = vec3.create();

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */

        let vertices = [];

        /*****************BACK*****************/
        vertices.push(-length, length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 0);

        vertices.push(-length, -length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 0);

        vertices.push(length, length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 0);

        vertices.push(length, -length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 0);


        /*************FRONT************/
        vertices.push(-length, length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 0, 255);

        vertices.push(-length, -length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 0, 255);

        vertices.push(length, length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 0, 255);

        vertices.push(length, -length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 0, 255);


        /***********BOTTOM**************/
        vertices.push(-length, -length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 0);

        vertices.push(-length, -length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 0);

        vertices.push(length, -length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 0);

        vertices.push(length, -length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 0);


        /***********TOP**************/
        vertices.push(-length, length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 255);

        vertices.push(-length, length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 255);

        vertices.push(length, length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 255);

        vertices.push(length, length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(0, 255, 255);


        /*************LEFT***************/
        vertices.push(-length, length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 255, 0);

        vertices.push(-length, -length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 255, 0);

        vertices.push(-length, length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 255, 0);

        vertices.push(-length, -length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 255, 0);


        /**************RIGHT*************/
        vertices.push(length, length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 255);

        vertices.push(length, -length, length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 255);

        vertices.push(length, length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 255);

        vertices.push(length, -length, -length);
        vec3.lerp(randColor, col1, col2, Math.random());
        vertices.push(randColor[0], randColor[1], randColor[2]);
        //vertices.push(255, 0, 255);

        this.vbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        let indices = [];
        let indices2 = [];
        let indices3 = [];
        let indices4 = [];
        let indices5 = [];
        let indices6 = [];


        //Back
        indices.push(0,2,1,3);

        //Front
        indices2.push(4,6,5,7);

        //Bottom
        indices3.push(8,10,9,11);

        //Top
        indices4.push(12,14,13,15);

        //Left
        indices5.push(16,18,17,19);

        //Right
        indices6.push(20,22,21,23);


        this.index_buffer = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices), gl.STATIC_DRAW);

        this.index_buffer2 = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer2);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices2), gl.STATIC_DRAW);

        this.index_buffer3 = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer3);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices3), gl.STATIC_DRAW);

        this.index_buffer4 = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer4);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices4), gl.STATIC_DRAW);

        this.index_buffer5 = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer5);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices5), gl.STATIC_DRAW);

        this.index_buffer6 = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer6);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(indices6), gl.STATIC_DRAW);

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        this.indices = [{"primitive": gl.TRIANGLE_STRIP, "buffer": this.index_buffer, "numPoints": indices.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.index_buffer2, "numPoints": indices2.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.index_buffer3, "numPoints": indices3.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.index_buffer4, "numPoints": indices4.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.index_buffer5, "numPoints": indices5.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.index_buffer6, "numPoints": indices6.length}];

    }

    /**
     * Draw the object
     * @param {Number} vertexAttr handle to a vec3 attribute in the vertex shader for vertex xyz-position
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


        for (let k = 1; k < 2; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

        for (let k = 2; k < 3; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

        for (let k = 3; k < 4; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

        for (let k = 4; k < 5; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

        for (let k = 5; k < 6; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

    }
}