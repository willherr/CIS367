/**
 * Created by willherr on 2/10/2017.
 */
class TruncatedCone extends GeometricObject {
	/**
	 * Create a 3D cone with tip at the Z+ axis and base on the XY plane
	 * @param {Object} gl      the current WebGL context
	 * @param {Number} bottomRadius  radius of the cone base
	 * @param {Number} topRadius radius of the cone top
	 * @param {Number} height  height of the cone
	 * @param {Number} subDiv  number of radial subdivision of the cone base
	 * @param {Number} vSubDiv number of vertical subdivisions of the cone (base to tip)
	 * @param {vec3}   col1    color #1 to use
	 * @param {vec3}   col2    color #2 to use
	 */
	constructor (gl, bottomRadius, topRadius, height, subDiv, vSubDiv, col1, col2) {
		super(gl);
		/* if colors are undefined, generate random colors */
		let col1Undefined, col2Undefined = false;
		if (typeof col1 === "undefined"){ col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			col1Undefined = true;}
		if (typeof col2 === "undefined"){ col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			col2Undefined = true;}
		//let randColor = vec3.create();
		let vertices = [];
		this.vbuff = gl.createBuffer();

		let bigRadius = bottomRadius > topRadius ? bottomRadius: topRadius;
		let smallRadius = bigRadius == bottomRadius ? topRadius: bottomRadius;
		/* Instead of allocating two separate JS arrays (one for position and one for color),
		 in the following loop we pack both position and color
		 so each tuple (x,y,z,r,g,b) describes the properties of a vertex
		 */

		/***** Create 'base' of cone *****/       //NOTE: base is always the bigger radius supplied
		vertices.push(0,0,0); /* center of base */
		//vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        vertices.push(16/255, 21/255, 25/255);
        for (let k = 0; k < subDiv; k++) {
			let angle = k * 2 * Math.PI / subDiv;
			let x = bigRadius * Math.cos (angle);
			let y = bigRadius * Math.sin (angle);

			/* the first three floats are 3D (x,y,z) position */
			vertices.push (x, y, 0); /* perimeter of base */
			//vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
			/* the next three floats are RGB */
            vertices.push(16/255, 21/255, 25/255);
		}

		/***** Create vertical stacks of cone *****/
		let subDivRadius = 0, subDivHeight = 0, subDivSlant = 0;
		let slant = Math.sqrt(Math.pow(height, 2) + Math.pow(bigRadius-smallRadius, 2)); /* slant length equation */
		for(let i = 0; i < vSubDiv - 1; i++){
			subDivHeight += height/vSubDiv;
			subDivSlant += slant/vSubDiv;
			subDivRadius = bigRadius - Math.sqrt(Math.pow(subDivSlant, 2) - Math.pow(subDivHeight, 2));
			for(let j = 0; j < subDiv; j++){
				let angle = j * 2 * Math.PI / subDiv;
				let x = subDivRadius * Math.cos (angle);
				let y = subDivRadius * Math.sin (angle);

				vertices.push(x, y, subDivHeight);
				//vec3.lerp(randColor, col1, col2, Math.random());
                vertices.push(16/255, 21/255, 25/255);
			}
			if (col1Undefined) col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			if (col2Undefined) col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
			//randColor = vec3.create();
		}

		/***** Create 'top' of cone *****/
		for (let k = 0; k < subDiv; k++) {
			let angle = k * 2 * Math.PI / subDiv;
			let x = smallRadius * Math.cos (angle);
			let y = smallRadius * Math.sin (angle);

			/* the first three floats are 3D (x,y,z) position */
			vertices.push (x, y, height); /* perimeter of base */
			//vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
			/* the next three floats are RGB */
            vertices.push(16/255, 21/255, 25/255);
		}
		vertices.push(0,0,height); /* center of top */
		//vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        vertices.push(16/255, 21/255, 25/255);

		/* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
		gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


		/***** Generate index order for top of cone *****/
		let topIndex = [];
		let topCenter = (1 + vSubDiv)*subDiv + 1;
		topIndex.push(topCenter);
		let beginTop = topCenter - subDiv;///////////////////////////////////////////////
		for (let k = beginTop; k <= topCenter - 1; k++)
			topIndex.push(k);
		topIndex.push(beginTop);
		this.topIdxBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(topIndex), gl.STATIC_DRAW);


		/***** Generate index order for base of cone *****/
		let botIndex = [];
		let bottomCenter = 0;
		botIndex.push(bottomCenter);
		for (let k = subDiv; k > 0; k--)
			botIndex.push(k);
		botIndex.push(subDiv);
		this.botIdxBuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botIdxBuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(botIndex), gl.STATIC_DRAW);


		/***** Generate vertical subdivision index buffers *****/
		let vSubDivBufferHolder = [];
		let bottom = 0, top = 0;
		for(let i = 0; i < vSubDiv; i++){          // loop number of vertical subdivisions
			let tempIndex = [];
			let bottomStart = i*subDiv + 1;
			let topStart = bottomStart + subDiv;
			for(bottom = bottomStart, top = topStart; bottom < topStart; bottom++, top++) {   // loop number of points on subdivision
				tempIndex.push(top);
				tempIndex.push(bottom);
			}
			tempIndex.push(topStart);
			tempIndex.push(bottomStart);
			vSubDivBufferHolder[i] = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vSubDivBufferHolder[i]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(tempIndex), gl.STATIC_DRAW);
		}

		/* Put the indices as an array of objects. Each object has three attributes:
		 primitive, buffer, and numPoints */
		this.indices = [{"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length},
			{"primitive": gl.TRIANGLE_FAN, "buffer": this.botIdxBuff, "numPoints": botIndex.length},
			{"primitive": gl.TRIANGLE_STRIP, "buffer": vSubDivBufferHolder, "numPoints": 2 * (subDiv + 1)}];
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
	// 	/* copy the coordinate frame matrix to the uniform memory in shader */
	// 	gl.uniformMatrix4fv(modelUniform, false, coordFrame);
	//
	// 	/* binder the (vertex+color) buffer */
	// 	gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
	//
	// 	/* with the "packed layout"  (x,y,z,r,g,b),
	// 	 the stride distance between one group to the next is 24 bytes */
	// 	gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
	// 	gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */
	//
	// 	//draw top and bottom
	// 	for (let k = 0; k < 2; k++) {
	// 		let obj = this.indices[k];
	// 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
	// 		gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
	// 	}
	//
	// 	let obj = this.indices[2];
	// 	//draw vertical subdivisions
	// 	for (let k = 0; k < obj.vSubDivBufferHolder.length; k++){
	// 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.vSubDivBufferHolder[k]);
	// 		gl.drawElements(gl.TRIANGLE_STRIP, obj.numPoints, gl.UNSIGNED_BYTE, 0);
	// 	}
	// }
}