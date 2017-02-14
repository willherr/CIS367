/**
 * Created by willherr on 2/13/2017.
 */
class RecursiveSphere {

	/**
	 * Create a 3D sphere made recursively by subdividing a tetrahedron
	 * @param {Object} gl      the current WebGL context
	 * @param {Number} radius  the radius of the sphere from 0.1 to 0.9
	 * @param {Number} depth   number of recursive calls to make from 1 to 100
	 * @param {vec3}   col1    color #1 to use
	 * @param {vec3}   col2    color #2 to use
	 */
	constructor (gl, radius, depth, col1, col2) {

		/* if colors are undefined, generate random colors */
		let col1Undefined = false, col2Undefined = false;
		if (typeof col1 === "undefined"){
			col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			col1Undefined = true;}
		if (typeof col2 === "undefined"){
			col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			col2Undefined = true;}
		let randColor = vec3.create();
		this.vertices = [];
		this.vbuff = gl.createBuffer();

		/* Instead of allocating two separate JS arrays (one for position and one for color),
		 in the following loop we pack both position and color
		 so each tuple (x,y,z,r,g,b) describes the properties of a vertex
		 */


		/* Initial points of tetrahedron when radius = sqrt(3/2) */
		let T = vec3.fromValues(1, 0, -1/Math.sqrt(2));
		let A = vec3.fromValues(-1, 0, -1/Math.sqrt(2));
		let B = vec3.fromValues(0, 1, 1/Math.sqrt(2));
		let C = vec3.fromValues(0, -1, 1/Math.sqrt(2));

		this.createSphere(T, A, B, C, depth, radius, col1, col2, randColor);

		/* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
		gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);


		/***** Generate index order for sphere *****/
		let index = [];
		for (let k = 0; k < this.vertices.length/6; k++)
			index.push(k);
		this.indexBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(index), gl.STATIC_DRAW);


		/* Put the indices as an array of objects. Each object has three attributes:
		 primitive, buffer, and numPoints */
		this.indices = [{"primitive": gl.TRIANGLES, "buffer": this.indexBuff, "numPoints": index.length}];
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

		//draw sphere
		for (let k = 0; k < this.indices.length; k++) {
			let obj = this.indices[k];
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
			gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
		}
	}

	/**
	 * Method to take vertices of an initial tetrahedron and calls a recursive method to subdivide the triangular faces
	 * CCW orders -> TAB TBC TCA CBA
	 * @param {vec3} T All parameters are vertices of the original tetrahedron
	 * @param {vec3} A
	 * @param {vec3} B
	 * @param {vec3} C
	 * @param {Number} depth is the number of recursive calls
	 * @param {Number} radius of sphere
	 * @param {vec3} col1 color 1
	 * @param {vec3} col2 color 2
	 * @param {vec3} randColor lerp vec
	 */
	createSphere(T, A, B, C, depth, radius, col1, col2, randColor){
		let Ts = this.scaleToMagnitude(T, radius);
		let As = this.scaleToMagnitude(A, radius);
		let Bs = this.scaleToMagnitude(B, radius);
		let Cs = this.scaleToMagnitude(C, radius);
		this.subdivideTriangles(Ts, Bs, As, depth, radius, 1, col1, col2, randColor);
		this.subdivideTriangles(Ts, Cs, Bs, depth, radius, 1, col1, col2, randColor);
		this.subdivideTriangles(Ts, As, Cs, depth, radius, 1, col1, col2, randColor);
		this.subdivideTriangles(Cs, As, Bs, depth, radius, 1, col1, col2, randColor);
	}

	/**
	 * Recursive method to subdivide triangle RST with its midpoints
	 * CCW orders -> T TR ST    R RS TR    S ST RS    ST TR RS
	 * @param {vec3} R, S, and T parameters are vertices of the given triangle
	 * @param {vec3} S
	 * @param {vec3} T
	 * @param {Number} depth is the number of recursive calls to be made
	 * @param {Number} radius of sphere
	 * @param {Number} count keeps track of the current depth
	 * @param {vec3} col1 color 1
	 * @param {vec3} col2 color 2
	 * @param {vec3} randColor lerp vec
	 */
	subdivideTriangles(R, S, T, depth, radius, count, col1, col2, randColor){
		if(count == depth)
			this.triangle(R, S, T, col1, col2, randColor);
		else{
			count++;

			let RS = this.scaledMidpoint(R, S, radius);
			let ST = this.scaledMidpoint(S, T, radius);
			let TR = this.scaledMidpoint(T, R, radius);

			this.subdivideTriangles(T, TR, ST, depth, radius, count, col1, col2, randColor);
			this.subdivideTriangles(R, RS, TR, depth, radius, count, col1, col2, randColor);
			this.subdivideTriangles(S, ST, RS, depth, radius, count, col1, col2, randColor);
			this.subdivideTriangles(ST, TR, RS, depth, radius, count, col1, col2, randColor);
		}
	}

	/**
	 * Returns the midpoint of line MP and scales the midpoint so that it lies on the sphere
	 * @param M
	 * @param P
	 * @param radius
	 */
	scaledMidpoint(M, P, radius){
		let MP = vec3.create();
		let scaledMP = vec3.create();
		let sum = vec3.add(vec3.create(), M, P);
		vec3.scale(MP, sum, .5);
		return this.scaleToMagnitude(MP, radius);
	}

	scaleToMagnitude(V, radius){
		let scaledV = vec3.create();
		let length = vec3.length(V);
		let scalar = radius/length;
		vec3.scale(scaledV, V, scalar);
		return scaledV;
	}

	/**
	 * Method to push the vertices of a triangle to the data array
	 * @param {vec3} X, Y, and Z parameters are vertices of the triangle to be pushed to the data array
	 * @param {vec3} Y
	 * @param {vec3} Z
	 * @param {vec3} col1 color 1
	 * @param {vec3} col2 color 2
	 * @param {vec3} randColor lerp vec
	 */
	triangle(X, Y, Z, col1, col2, randColor){
		for(let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				switch (i) {
					case 0:
						this.vertices.push(X[j]);
						break;
					case 1:
						this.vertices.push(Y[j]);
						break;
					case 2:
						this.vertices.push(Z[j]);
				}
			}
			vec3.lerp(randColor, col1, col2, Math.random());
			this.vertices.push(randColor[0], randColor[1], randColor[2]);
		}
	}
}