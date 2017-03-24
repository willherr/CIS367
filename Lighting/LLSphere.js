/**
 * Created by willherr on 2/11/2017.
 */
class LLSphere {
	/**
	 * Create a 3D sphere made of longitudes and latitudes with equator on XY plane and poles on Z axis
	 * @param {Object} gl         the current WebGL context
	 * @param {Number} radius     the radius of the sphere from 0.1 to 0.45
	 * @param {Number} longitudes the number of vertical subdivisions around sphere from 2 to 30
	 * @param {Number} latitudes  the number of horizontal subdivisions from equator to a pole from 1 to 10
	 * @param {vec3}   col1    color #1 to use
	 * @param {vec3}   col2    color #2 to use
	 */
	constructor (gl, radius, longitudes, latitudes, col1, col2) {

		/* if colors are undefined, generate random colors */
		let col1Undefined = false, col2Undefined = false;
		if (typeof col1 === "undefined"){ col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			col1Undefined = true;}
		if (typeof col2 === "undefined"){ col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			col2Undefined = true;}
		let randColor = vec3.create();
		let vertices = [];
		this.vbuff = gl.createBuffer();

		/* Instead of allocating two separate JS arrays (one for position and one for color),
		 in the following loop we pack both position and color
		 so each tuple (x,y,z,r,g,b) describes the properties of a vertex
		 */

		let subDiv = 2*longitudes;

		/***** Create equator of sphere *****/
		for (let k = 0; k < subDiv; k++) {
			let angle = k * 2 * Math.PI / subDiv;
			let x = radius * Math.cos (angle);
			let y = radius * Math.sin (angle);

			/* the first three floats are 3D (x,y,z) position */
			vertices.push (x, y, radius); /* perimeter of equator */
			vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
			/* the next three floats are RGB */
			vertices.push(randColor[0], randColor[1], randColor[2]);
		}

		/***** Create vertical stacks of sphere to top *****/
		let latRadius = radius, latHeight = radius, degree = 0; /* latHeight from equator */
		let col3 = col1, col4 = col2, randColor2 = randColor;
		if (col1Undefined) col3 = vec3.fromValues(Math.random(), Math.random(), Math.random());
		if (col2Undefined) col4 = vec3.fromValues(Math.random(), Math.random(), Math.random());
		randColor2 = vec3.create();
		for(let i = 1; i <= latitudes - 1; i++){
			latHeight += radius/latitudes;
			degree    += Math.PI/2/latitudes;
			latRadius = radius*Math.cos (degree);
			for(let j = 0; j < subDiv; j++){
				let angle = j * 2 * Math.PI / subDiv;
				let x = latRadius * Math.cos (angle);
				let y = latRadius * Math.sin (angle);

				vertices.push(x, y, latHeight);
				vec3.lerp(randColor, col1, col2, Math.random());
				vertices.push(randColor[0], randColor[1], randColor[2]);
				vertices.push(x, y, 2*radius - latHeight);
				vec3.lerp(randColor2, col3, col4, Math.random());
				vertices.push(randColor2[0], randColor2[1], randColor2[2]);
			}
			if (col1Undefined) col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			if (col2Undefined) col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			randColor = vec3.create();
			if (col1Undefined) col3 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			if (col2Undefined) col4 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			randColor2 = vec3.create();
		}
		
		/* North Pole */
		vertices.push(0, 0, 2*radius);
		vec3.lerp(randColor, col1, col2, Math.random());
		vertices.push(randColor[0], randColor[1], randColor[2]);
		
		/*South Pole */
		vertices.push(0, 0, 0)
		vec3.lerp(randColor2, col3, col4, Math.random());
		vertices.push(randColor2[0], randColor2[1], randColor2[2]);
		

		/* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
		gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


		/***** Generate index order for top of sphere *****/
		let arctic = [];
		let northPole = subDiv*(2*latitudes - 1);
		arctic.push(northPole);
		let beginArctic = northPole - 2*subDiv;
		for (let k = beginArctic; k < northPole; k+=2)
			arctic.push(k);
		arctic.push(beginArctic);
		this.arcticBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.arcticBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(arctic), gl.STATIC_DRAW);


		/***** Generate index order for bottom of sphere *****/
		let antartica = [];
		let southPole = northPole + 1;
		antartica.push(southPole);
		let beginAntartica = southPole - 2;
		for (let k = beginAntartica; k >= southPole - 2*subDiv; k-=2)
			antartica.push(k);
		antartica.push(beginAntartica);
		this.antarticaBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.antarticaBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(antartica), gl.STATIC_DRAW);


		/***** Generate vertical subdivision index buffers *****/
		let vSubDivBufferHolder = [];
		let bottom1 = 0, top1 = 0, bottom2 = 0, top2 = 0;
		let j = 0, k = 1; //additional counters
		for(let i = 1; i < latitudes; i++, j+=2, k+=2){          // loop number of vertical subdivisions
			let index1 = [], index2 = [];

			if (i == 1){
				let bottomStart1 = 0;
				let topStart1 = subDiv;
				let bottomStart2 = subDiv + 1;
				let topStart2 = 0;
				for(bottom1 = bottomStart1, bottom2 = bottomStart2, top1 = topStart1, top2 = topStart2;
					bottom1 < topStart1; bottom1++, bottom2+=2, top1+=2, top2++){
						index1.push(top1); index1.push(bottom1);
						index2.push(top2); index2.push(bottom2);
				}
				index1.push(topStart1); index1.push(bottomStart1);
				index2.push(topStart2); index2.push(bottomStart2);

			} else {
				let bottomStart1 = (subDiv*2*(i - 2)) + subDiv;
				let topStart1 = (subDiv*2*(i - 2)) + 3*subDiv;
				let bottomStart2 = bottomStart1 + 1;
				let topStart2 = topStart1 + 1;
				for(bottom1 = bottomStart1, bottom2 = bottomStart2, top1 = topStart1, top2 = topStart2;
					bottom1 < topStart1; bottom1+=2, bottom2+=2, top1+=2, top2+=2){
					index1.push(top1); index1.push(bottom1);
					index2.push(bottom2); index2.push(top2);
				}
				index1.push(topStart1); index1.push(bottomStart1);
				index2.push(bottomStart2); index2.push(topStart2);
			}

			vSubDivBufferHolder[j] = gl.createBuffer(); vSubDivBufferHolder[k] = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vSubDivBufferHolder[j]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(index1), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vSubDivBufferHolder[k]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(index2), gl.STATIC_DRAW);
		}

		/* Put the indices as an array of objects. Each object has three attributes:
		 primitive, buffer, and numPoints */
		this.indices = [{"primitive": gl.TRIANGLE_FAN, "buffer": this.arcticBuff, "numPoints": arctic.length},
			{"primitive": gl.TRIANGLE_FAN, "buffer": this.antarticaBuff, "numPoints": antartica.length},
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