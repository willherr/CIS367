/**
 * Created by Vincent Ball on 2/10/2017.
 */
class CylindricalRing extends GeometricObject {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} innerRadius  radius of the cone base
     * @param {Number} outerRadius radius of the cone top
     * @param {Number} height  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor (gl, outerRadius, innerRadius, height, subDiv, col1, col2) {
        super(gl);
        //Draw outer circle then draw inner circle.  Connect those two using triangle strip
        //(say 8 points for each circle) --> (0,8,1,9,2,10,11,12......)

        /* if colors are undefined, generate random colors */
        let col1Undefined, col2Undefined = false;
        if (typeof col1 === "undefined"){ col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col1Undefined = true;}
        if (typeof col2 === "undefined"){ col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
            col2Undefined = true;}
        let randColor = vec3.create();
        let vertices = [];
        this.vbuff = gl.createBuffer();

        //let bigRadius = innerRadius > outerRadius ? innerRadius: outerRadius;
        //let smallRadius = bigRadius == innerRadius ? outerRadius: innerRadius;

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */

        /***** Create outer bottom radius of ring *****/
        for (let k = 0; k < subDiv + 1; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = outerRadius * Math.cos (angle);
            let y = outerRadius * Math.sin (angle);
            
            /* the first three floats are 3D (x,y,z) position */
            vertices.push (x, y, 0); /* perimeter of base */
            vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            /* the next three floats are RGB */
            vertices.push(randColor[0], randColor[1], randColor[2]);
        }


        /***** Create inner bottom radius of ring *****/
        for (let k = 0; k < subDiv + 1; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = innerRadius * Math.cos (angle);
            let y = innerRadius * Math.sin (angle);

            vertices.push (x, y, 0); //perimeter of base
            vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            /* the next three floats are RGB */
            vertices.push(randColor[0], randColor[1], randColor[2]);
        }


        /***** Create top outer radius of ring *****/
        for (let k = 0; k < subDiv + 1; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = outerRadius * Math.cos (angle);
            let y = outerRadius * Math.sin (angle);

            /* the first three floats are 3D (x,y,z) position */
            vertices.push (x, y, height); /* perimeter of base */
            vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            /* the next three floats are RGB */
            vertices.push(randColor[0], randColor[1], randColor[2]);
        }


        /***** Create top inner radius of ring *****/
        for (let k = 0; k < subDiv + 1; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = innerRadius * Math.cos (angle);
            let y = innerRadius * Math.sin (angle);

            //the first three floats are 3D (x,y,z) position
            vertices.push (x, y, height); //perimeter of base
            vec3.lerp (randColor, col1, col2, Math.random());
            vertices.push(randColor[0], randColor[1], randColor[2]);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


        /******************INDEX********************************/
        /***** Generate index order for bottom ring*****/
        let botRingIndex = [];
        for (let k = 0; k < subDiv + 1; k++){
            botRingIndex.push(k);
            botRingIndex.push(subDiv + k + 1);
        }
        this.botRingIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botRingIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(botRingIndex), gl.STATIC_DRAW);

        /***** Generate index order for top ring*****/
        let topRingIndex = [];
        let begin = (subDiv * 2) +2;
        for (let k = begin; k < begin + (subDiv + 1); k++){
            topRingIndex.push(k);
            topRingIndex.push(subDiv + k + 1);
        }
        this.topRingIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topRingIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(topRingIndex), gl.STATIC_DRAW);

        /***** Generate index order for outer wall*****/
        let outerWallIndex = [];
        let first = (subDiv * 2) + 2;
        for (let k = 0; k < subDiv + 1; k++){
            outerWallIndex.push(first + k);
            outerWallIndex.push(k);
        }
        this.outerWallIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.outerWallIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(outerWallIndex), gl.STATIC_DRAW);

        /***** Generate index order for inner wall*****/
        let innerWallIndex = [];
        let start = (subDiv * 3) + 3;
        for (let k = 0; k < subDiv + 1; k++){
            innerWallIndex.push(start + k);
            innerWallIndex.push(subDiv + k + 1);
        }
        this.innerWallIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.innerWallIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(innerWallIndex), gl.STATIC_DRAW);

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */
        this.indices = [{"primitive": gl.TRIANGLE_STRIP, "buffer": this.botRingIdxBuff, "numPoints": botRingIndex.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.topRingIdxBuff, "numPoints": topRingIndex.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.outerWallIdxBuff, "numPoints": outerWallIndex.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": this.innerWallIdxBuff, "numPoints": innerWallIndex.length}
        ];
    }
	//
    // /**
    //  * Draw the object
    //  * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
    //  * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
    //  * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
    //  * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
    //  */
    // draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
    //     /* copy the coordinate frame matrix to the uniform memory in shader */
    //     gl.uniformMatrix4fv(modelUniform, false, coordFrame);
	//
    //     /* binder the (vertex+color) buffer */
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
	//
    //     /* with the "packed layout"  (x,y,z,r,g,b),
    //      the stride distance between one group to the next is 24 bytes */
    //     gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
    //     gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */
	//
    //     //draw top and bottom
    //     for (let k = 0; k < 4; k++) {
    //         let obj = this.indices[k];
    //         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
    //         gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
    //     }
	//
    // }
}