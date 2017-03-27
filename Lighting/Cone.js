/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Cone {
	/**
	 * Create a 3D cone with tip at the Z+ axis and base on the XY plane
	 * @param {Object} gl      the current WebGL context
	 * @param {Number} radius  radius of the cone base
	 * @param {Number} height  height of the cone
	 * @param {Number} radialDiv  number of radial subdivision of the cone base
	 * @param {vec3}   [col1]    color #1 to use
	 * @param {vec3}   [col2]    color #2 to use
	 */
	constructor (gl, RADIUS, HEIGHT, radialDiv, verticalDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
		if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
		if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
		let randColor = vec3.create();
		let vertices = [];
        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */
        /*
         Stack  |  Elevations     | Radii
         ---------+-----------------+---------
         1    |    0, H         |   R, 0
         2    |    0, H/2, H    |   R, R/2, 0
         3    | 0, H/3, 2H/3, H | R, 2R/3, R/3, 0
         */
		for (let s = 0; s < verticalDiv; s++) {
			let h = s * HEIGHT / verticalDiv;
			let r = (verticalDiv - s) * RADIUS / verticalDiv;
			for (let k = 0; k < radialDiv; k++) {
				let angle = k * 2 * Math.PI / radialDiv;
				let x = r * Math.cos(angle);
				let y = r * Math.sin(angle);

                /* the first three floats are 3D (x,y,z) position */
				vertices.push(x, y, h);
				vec3.lerp(randColor, col1, col2, Math.random());
                /* linear interpolation between two colors */
                /* the next three floats are RGB */
				vertices.push(randColor[0], randColor[1], randColor[2]);
			}
		}
		vertices.push(0,0,HEIGHT); /* tip of cone */
		vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
		vertices.push(randColor[0], randColor[1], randColor[2]);
		vertices.push (0,0,0); /* center of base */
		vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
		vertices.push(randColor[0], randColor[1], randColor[2]);

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
		this.vbuff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
		gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

		this.indices = [];
		// this.buff = [];
		var index;
		for (let s = 0; s < verticalDiv - 1; s++) {
			index = [];
			let start = s * radialDiv;
			for (let k = 0; k < radialDiv; k++) {
				index.push(start + k + radialDiv, start + k);
			}
			index.push(start + radialDiv, start);
			let buff = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
			this.indices.push({primitive: gl.TRIANGLE_STRIP, buffer: buff, numPoints: index.length});
		}

		// Generate index for the topmost stack
		index = [];
		index.push(verticalDiv * radialDiv);
		let start = (verticalDiv - 1) * radialDiv;
		for (let k = 0; k < radialDiv; k++)
			index.push(start + k);
		index.push(start);
		let topBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, topBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
		this.indices.push({primitive: gl.TRIANGLE_FAN, buffer: topBuff, numPoints: radialDiv + 2});

		// Generate index for the bottom circle
		index = [];
		index.push(verticalDiv * radialDiv + 1);
		for (let k = radialDiv - 1; k >= 0; k--)
			index.push(k);
		index.push(radialDiv - 1);
		let botBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, botBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
		this.indices.push({primitive: gl.TRIANGLE_FAN, buffer: botBuff, numPoints: radialDiv + 2});
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

		for (let k = 0; k < this.indices.length; k++) {
			let obj = this.indices[k];
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
			gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
		}
	}
}