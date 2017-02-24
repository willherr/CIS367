class Cone {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} radius  radius of the cone base
     * @param {Number} height  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {Number} vSubDiv number of vertical subdivisions of the cone (base to tip)
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor (gl, radius, height, subDiv, vSubDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        let col1Undefined, col2Undefined = false;
        if (typeof col1 === "undefined"){ col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col1Undefined = true;}
        if (typeof col2 === "undefined"){ col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col2Undefined = true;}
        //let randColor = vec3.create();
        let vertices = [];
        this.vbuff = gl.createBuffer();

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */
        vertices.push(0,0,height); /* tip of cone */
        //vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        vertices.push(255, 255, 255);
        for (let k = 0; k < subDiv; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = radius * Math.cos (angle);
            let y = radius * Math.sin (angle);

            /* the first three floats are 3D (x,y,z) position */
            vertices.push (x, y, 0); /* perimeter of base */
            //vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            /* the next three floats are RGB */
            vertices.push(255, 255, 255);
        }
        vertices.push (0,0,0); /* center of base */
        //vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        vertices.push(255, 255, 255);

        /***** Above this we have bottom, center of bottom, and tip created. */
        let subDivRadius = 0;
        let subDivHeight = 0;
        for(let i = 0; i < vSubDiv - 1; i++){
            subDivHeight += height/vSubDiv;
            for(let j = 0; j < subDiv; j++){
                subDivRadius = (1 - ((i+1) / vSubDiv)) * radius;
                let angle = j * 2 * Math.PI / subDiv;
                let x = subDivRadius * Math.cos (angle);
                let y = subDivRadius * Math.sin (angle);

                vertices.push(x, y, subDivHeight);

                //vec3.lerp(randColor, col1, col2, Math.random());
                vertices.push(255, 255, 255);

            }
            if (col1Undefined) col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            if (col2Undefined) col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            //randColor = vec3.create();
        }


        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        // Generate index order for top of cone
        let topIndex = [];
        topIndex.push(0);
        let minusIfOnlyOne = vSubDiv == 1 ? -1:0;
        for (let k = subDiv*vSubDiv - subDiv + 2 + minusIfOnlyOne; k <= subDiv*vSubDiv + 1 + minusIfOnlyOne; k++)
            topIndex.push(k);
        topIndex.push(subDiv*vSubDiv - subDiv + 2 + minusIfOnlyOne);
        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(topIndex), gl.STATIC_DRAW);


        // Generate vertical subdivision index buffers
        let vSubDivBufferHolder = [];
        let tempIndex = [];
        let lastVertex = 0;
        let firstVertex = 0;

        for(let i = 0; i < vSubDiv - 1; i++){          // loop number of vertical subdivisions - top
            tempIndex = [];
            for(let j = i*subDiv + 1; j < i*subDiv + subDiv + 1; j++){// loop number of circle subdivisions
                let c = 1;
                let d = 0;
                let e = 0;
                let f = 0;
                if(i != 0) {
                    d = -1;
                    e = 1;
                    f = 2;
                }
                tempIndex.push(j + subDiv + c); tempIndex.push(j+e);
                lastVertex = j + c + 1;
                firstVertex = i*subDiv + 1 + d + f;
            }
            tempIndex.push(lastVertex);
            tempIndex.push(firstVertex);
            vSubDivBufferHolder[i] = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vSubDivBufferHolder[i]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(tempIndex), gl.STATIC_DRAW);
        }


        // Generate index order for bottom of cone
        let botIndex = [];
        botIndex.push(subDiv + 1);
        for (let k = subDiv; k >= 1; k--)
            botIndex.push(k);
        botIndex.push(subDiv);
        this.botIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(botIndex), gl.STATIC_DRAW);



        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        this.indices = [{"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length},
            {"primitive": gl.TRIANGLE_FAN, "buffer": this.botIdxBuff, "numPoints": botIndex.length},
            {"vSubDivBufferHolder": vSubDivBufferHolder, "numPoints": 2 * (subDiv + 1)}];
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
        for (let k = 0; k < 2; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }

        let obj = this.indices[2];
        //draw vertical subdivisions
        for (let k = 0; k < obj.vSubDivBufferHolder.length; k++){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.vSubDivBufferHolder[k]);
            gl.drawElements(gl.TRIANGLE_STRIP, obj.numPoints, gl.UNSIGNED_BYTE, 0);
        }
    }
}