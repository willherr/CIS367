/**
 * Created by Hans Dulimarta on 1/31/17.
 * Contributed to by William Herrmann and Vincent Ball on 3/25/2017
 */

var gl;
var glCanvas;
var orthoProjMat, persProjMat, viewMat, viewMatInverse, topViewMat,topViewMatInverse, normalMat;
var ringCF, lightCF, eyePos;
var axisBuff, tmpMat;
var globalAxes;

/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif;
var objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
var lightPos, useLightingUnif;
const IDENTITY = mat4.create();
var obj, lineBuff, normBuff, objTint, pointLight;
var shaderProg, redrawNeeded, showNormal, showLightVectors;
var lightingComponentEnabled = [true, true, true];

/* Application variables */
var currSelection = 0;
var currSelection2 = 0;
const RING_ANGULAR_SPEED = 12;
var cameraAngles, cameraAngleIndex;
var obj, shooter, court, basketball, fence, fence2, sun, lamp;
var basketballx, basketbally, basketballz, shooterx, shootery, shooterz, shooter2x, shooter2y, shooter2z;
var timestamp;

let armCFs = [];
let paramGroup;

function main() {
	glCanvas = document.getElementById("gl-canvas");

	/*let normalCheckBox = document.getElementById("shownormal");
	normalCheckBox.addEventListener('change', ev => {
		showNormal = ev.target.checked;
		redrawNeeded = true;
	}, false);
	let lightCheckBox = document.getElementById("showlightvector");
	lightCheckBox.addEventListener('change', ev => {
		showLightVectors = ev.target.checked;
		redrawNeeded = true;
	}, false);*/
	let ambientCheckBox = document.getElementById("enableAmbient");
	ambientCheckBox.addEventListener('change', ev => {
		lightingComponentEnabled[0] = ev.target.checked;
		gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
		redrawNeeded = true;
	}, false);
	let diffuseCheckBox = document.getElementById("enableDiffuse");
	diffuseCheckBox.addEventListener('change', ev => {
		lightingComponentEnabled[1] = ev.target.checked;
		gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
		redrawNeeded = true;
	}, false);
	let specularCheckBox = document.getElementById("enableSpecular");
	specularCheckBox.addEventListener('change', ev => {
		lightingComponentEnabled[2] = ev.target.checked;
		gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
		redrawNeeded = true;
	}, false);
	let ambCoeffSlider = document.getElementById("amb-coeff");
	ambCoeffSlider.addEventListener('input', ev => {
		gl.uniform1f(ambCoeffUnif, ev.target.value);
		redrawNeeded = true;
	}, false);
	ambCoeffSlider.value = Math.random() * 0.2;
	let diffCoeffSlider = document.getElementById("diff-coeff");
	diffCoeffSlider.addEventListener('input', ev => {
		gl.uniform1f(diffCoeffUnif, ev.target.value);
		redrawNeeded = true;
	}, false);
	diffCoeffSlider.value = 0.5 + 0.5 * Math.random();  // random in [0.5, 1.0]
	let specCoeffSlider = document.getElementById("spec-coeff");
	specCoeffSlider.addEventListener('input', ev => {
		gl.uniform1f(specCoeffUnif, ev.target.value);
		redrawNeeded = true;
	}, false);
	specCoeffSlider.value = Math.random();
	let shinySlider = document.getElementById("spec-shiny");
	shinySlider.addEventListener('input', ev => {
		gl.uniform1f(shininessUnif, ev.target.value);
		redrawNeeded = true;
	}, false);
	shinySlider.value = Math.floor(1 + Math.random() * shinySlider.max);
	let redSlider = document.getElementById("redslider");
	let greenSlider = document.getElementById("greenslider");
	let blueSlider = document.getElementById("blueslider");
	redSlider.addEventListener('input', colorChanged, false);
	greenSlider.addEventListener('input', colorChanged, false);
	blueSlider.addEventListener('input', colorChanged, false);

	let objxslider = document.getElementById("objx");
	let objyslider = document.getElementById("objy");
	let objzslider = document.getElementById("objz");
	objxslider.addEventListener('input', objPosChanged, false);
	objyslider.addEventListener('input', objPosChanged, false);
	objzslider.addEventListener('input', objPosChanged, false);

	let lightxslider = document.getElementById("lightx");
	let lightyslider = document.getElementById("lighty");
	let lightzslider = document.getElementById("lightz");
	lightxslider.addEventListener('input', lightPosChanged, false);
	lightyslider.addEventListener('input', lightPosChanged, false);
	lightzslider.addEventListener('input', lightPosChanged, false);

	let eyexslider = document.getElementById("eyex");
	let eyeyslider = document.getElementById("eyey");
	let eyezslider = document.getElementById("eyez");
	eyexslider.addEventListener('input', eyePosChanged, false);
	eyeyslider.addEventListener('input', eyePosChanged, false);
	eyezslider.addEventListener('input', eyePosChanged, false);

	gl = WebGLUtils.setupWebGL(glCanvas, null);
	window.addEventListener("resize", resizeHandler, false);
	window.addEventListener("keypress", keyboardHandler, false);
	ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
		.then (prog => {
			shaderProg = prog;
			gl.useProgram(prog);
			gl.clearColor(135/255, 206/255, 248/255, 1);
			gl.enable(gl.DEPTH_TEST);    /* enable hidden surface removal */
			gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
			gl.cullFace(gl.BACK);
			axisBuff = gl.createBuffer();
			lineBuff = gl.createBuffer();
			normBuff = gl.createBuffer();
			posAttr = gl.getAttribLocation(prog, "vertexPos");
			colAttr = gl.getAttribLocation(prog, "vertexCol");
			normalAttr = gl.getAttribLocation(prog, "vertexNormal");
			lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
			projUnif = gl.getUniformLocation(prog, "projection");
			viewUnif = gl.getUniformLocation(prog, "view");
			modelUnif = gl.getUniformLocation(prog, "modelCF");
			normalUnif = gl.getUniformLocation(prog, "normalMat");
			useLightingUnif = gl.getUniformLocation (prog, "useLighting");
			objTintUnif = gl.getUniformLocation(prog, "objectTint");
			ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
			diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
			specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
			shininessUnif = gl.getUniformLocation(prog, "shininess");
			isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
			/* Enable only posAttr here. In drawScene() we will selectively switch
			 * between colorAttr and normalAttr, so we don't want to enable them now */
			gl.enableVertexAttribArray(posAttr);
			// gl.enableVertexAttribArray(colAttr);
			// gl.enableVertexAttribArray(normalAttr);

			orthoProjMat = mat4.create();
			persProjMat = mat4.create();
			viewMat = mat4.create();
			viewMatInverse = mat4.create();
			topViewMat = mat4.create();
			topViewMatInverse = mat4.create();
			ringCF = mat4.create();
			normalMat = mat3.create();
			lightCF = mat4.create();
			tmpMat = mat4.create();
			eyePos = vec3.fromValues(2, 2, 2);
			mat4.lookAt(viewMat,
				eyePos,
				vec3.fromValues(0, 0, 0), /* focal point */
				vec3.fromValues(0, 0, 1)); /* up */
			mat4.invert (viewMatInverse, viewMat);
			/*mat4.lookAt(topViewMat,
				vec3.fromValues(0,0,2),
				vec3.fromValues(0,0,0),
				vec3.fromValues(0,1,0)
			);
			mat4.invert (topViewMatInverse, topViewMat);*/
			gl.uniformMatrix4fv(modelUnif, false, IDENTITY);

			cameraAngles = [vec3.fromValues(2, 2, 2),
				vec3.fromValues(-2, 2, 2),
				vec3.fromValues(-2, -2, 2),
				vec3.fromValues(2, -2, 2)];
			cameraAngleIndex = 0;

			lightPos = vec3.fromValues(0, 2, 2);
			eyexslider.value = lightPos[0];
			eyeyslider.value = lightPos[1];
			eyezslider.value = lightPos[2];
			mat4.fromTranslation(lightCF, lightPos);
			lightx.value = lightPos[0];
			lighty.value = lightPos[1];
			lightz.value = lightPos[2];
			gl.uniform3fv (lightPosUnif, lightPos);
			let vertices = [0, 0, 0, 1, 1, 1,
				lightPos[0], 0, 0, 1, 1, 1,
				lightPos[0], lightPos[1], 0, 1, 1, 1,
				lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
			gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
			gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

			redSlider.value = Math.random();
			greenSlider.value = Math.random();
			blueSlider.value = Math.random();
			objTint = vec3.fromValues(redSlider.value, greenSlider.value, blueSlider.value);
			gl.uniform3fv(objTintUnif, objTint);
			gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
			gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
			gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
			gl.uniform1f(shininessUnif, shinySlider.value);

			/* Create Objects */
			obj = new BasketballHoops(gl);
			court = new Court(gl);
			fence = new Fence(gl);
			fence2 = new Fence2(gl);
			basketball = new Basketball(gl);
			armCFs.push(mat4.create());
			timeStamp = Date.now();
			shooter = new Shooter(gl);
			armCFs.push(mat4.clone(tmpMat));
			sun = new Sun(gl);
			lamp = new Lamp(gl);

			basketballx = 0;
			basketbally = 0;
			basketballz = 0;
			shooterx = 0;
			shootery = 0;
			shooterz = 0;
			shooter2x = 0;
			shooter2y = 0;
			shooter2z = 0;

			let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
			pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);
			globalAxes = new Axes(gl);
			redrawNeeded = true;
			resizeHandler();
			render();
		});
}

function resizeHandler() {
	glCanvas.width = window.innerWidth;
	glCanvas.height = 0.9 * window.innerHeight;
	if (glCanvas.width > glCanvas.height) { /* landscape */
		let ratio = 2 * glCanvas.height / glCanvas.width;
		mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
		mat4.perspective(persProjMat,
			Math.PI/3,  /* 60 degrees vertical field of view */
			1/ratio,    /* must be width/height ratio */
			1,          /* near plane at Z=1 */
			20);        /* far plane at Z=20 */
		redrawNeeded = true;
	} else {
		//alert ("Window is too narrow!");     Took this out for development
	}
}

function keyboardHandler(event) {
	const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0.2, 0, 0));
	const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-0.2, 0, 0));
	const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0.2, 0));
	const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0,-0.2, 0));
	const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0, 0.2));
	const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0,-0.2));
	switch (event.key) {
		case "x":
			mat4.multiply(ringCF, transXneg, ringCF);  // ringCF = Trans * ringCF
			break;
		case "X":
			mat4.multiply(ringCF, transXpos, ringCF);  // ringCF = Trans * ringCF
			break;
		case "y":
			mat4.multiply(ringCF, transYneg, ringCF);  // ringCF = Trans * ringCF
			break;
		case "Y":
			mat4.multiply(ringCF, transYpos, ringCF);  // ringCF = Trans * ringCF
			break;
		case "z":
			mat4.multiply(ringCF, transZneg, ringCF);  // ringCF = Trans * ringCF
			break;
		case "Z":
			mat4.multiply(ringCF, transZpos, ringCF);  // ringCF = Trans * ringCF
			break;

		case "q":
			basketballx = basketballx - .05;
			break;
		case "w":
			basketballx = basketballx + .05;
			break;
		case "a":
			basketbally = basketbally - .05;
			break;
		case "s":
			basketbally = basketbally + .05;
			break;
		case "d":
			basketballz = basketballz - .05;
			break;
		case "e":
			basketballz = basketballz + .05;
			break;

		case "i":
			shooterx = shooterx - .05;
			break;
		case "o":
			shooterx = shooterx + .05;
			break;
		case "j":
			shootery = shootery - .05;
			break;
		case "k":
			shootery = shootery + .05;
			break;
		case "l":
			shooterz = shooterz - .05;
			break;
		case "p":
			shooterz = shooterz + .05;
			break;

		case "v":
			shooter2x = shooter2x - .05;
			break;
		case "b":
			shooter2x = shooter2x + .05;
			break;
		case "g":
			shooter2y = shooter2y - .05;
			break;
		case "h":
			shooter2y = shooter2y + .05;
			break;
		case "c":
			shooter2z = shooter2z - .05;
			break;
		case "f":
			shooter2z = shooter2z + .05;
			break;

		case "r": //move camera right
			cameraAngleIndex++;
			cameraAngleIndex = cameraAngleIndex % 4;
			mat4.lookAt(viewMat,
				cameraAngles[cameraAngleIndex], /* eye */
				vec3.fromValues(0, 0, 0), /* focal point */
				vec3.fromValues(0, 0, 1)); /* up */
			break;
	}
	textOut.innerHTML = "Court origin (" + ringCF[12].toFixed(1) + ", "
		+ ringCF[13].toFixed(1) + ", "
		+ ringCF[14].toFixed(1) + ")";
}

function ambColorChanged(ev) {
	switch (ev.target.id) {
		case 'r-amb-slider':
			objAmbient[0] = ev.target.value;
			break;
		case 'g-amb-slider':
			objAmbient[1] = ev.target.value;
			break;
		case 'b-amb-slider':
			objAmbient[2] = ev.target.value;
			break;
	}
	gl.uniform3fv(objAmbientUnif, objAmbient);
	redrawNeeded = true;
}

function colorChanged(ev) {
	switch (ev.target.id) {
		case 'redslider':
			objTint[0] = ev.target.value;
			break;
		case 'greenslider':
			objTint[1] = ev.target.value;
			break;
		case 'blueslider':
			objTint[2] = ev.target.value;
			break;
	}
	gl.uniform3fv(objTintUnif, objTint);
	redrawNeeded = true;
}

function lightPosChanged(ev) {
	switch (ev.target.id) {
		case 'lightx':
			lightPos[0] = ev.target.value;
			break;
		case 'lighty':
			lightPos[1] = ev.target.value;
			break;
		case 'lightz':
			lightPos[2] = ev.target.value;
			break;
	}
	mat4.fromTranslation(lightCF, lightPos);
	gl.uniform3fv (lightPosUnif, lightPos);
	let vertices = [
		0, 0, 0, 1, 1, 1,
		lightPos[0], 0, 0, 1, 1, 1,
		lightPos[0], lightPos[1], 0, 1, 1, 1,
		lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
	redrawNeeded = true;
}


function objPosChanged(ev) {
	switch (ev.target.id) {
		case 'objx':
			ringCF[12] = ev.target.value;
			break;
		case 'objy':
			ringCF[13] = ev.target.value;
			break;
		case 'objz':
			ringCF[14] = ev.target.value;
			break;
	}
	redrawNeeded = true;
}

function eyePosChanged(ev) {
	switch (ev.target.id) {
		case 'eyex':
			eyePos[0] = ev.target.value;
			break;
		case 'eyey':
			eyePos[1] = ev.target.value;
			break;
		case 'eyez':
			eyePos[2] = ev.target.value;
			break;
	}
	mat4.lookAt(viewMat,
		eyePos,
		vec3.fromValues(0, 0, 0), /* focal point */
		vec3.fromValues(0, 0, 1)); /* up */
	mat4.invert (viewMatInverse, viewMat);
	redrawNeeded = true;
}

function render() {
	if (redrawNeeded) {
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		draw3D();
		//drawTopView();
		/* looking at the XY plane, Z-axis points towards the viewer */
		// coneSpinAngle += 1;  /* add 1 degree */
		redrawNeeded = false;
		let now = Date.now();
		let elapse = (now - timeStamp)/1000; /* convert to second */
		timeStamp = now;
		let ringSpinAngle = elapse * (RING_ANGULAR_SPEED / 60) * Math.PI;
		mat4.rotateX (armCFs[0], armCFs[0], ringSpinAngle);
		mat4.rotateY (armCFs[0], armCFs[0], ringSpinAngle);
	}
	requestAnimationFrame(render);
}

function drawScene() {                             //Check dulimarta's code for this function if it doesn't work
	// globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);
	/*
	 let option1 = document.getElementById("option").options[0].value;
	 let option2 = document.getElementById("option").options[1].value;
	 */
	gl.disableVertexAttribArray(normalAttr);
	gl.enableVertexAttribArray(colAttr);
	gl.uniform1i(useLightingUnif, false);
	pointLight.draw(posAttr, colAttr, modelUnif, IDENTITY);

	gl.uniform1i(useLightingUnif, true);

	let yPos = 0;
	let xPos = 0;
	let zPos = 0;

	if (typeof obj !== 'undefined') {     // gl range out of bounds
		/*
		 yPos = -0.5;
		 xPos = -0.5;
		 zPos = -1;
		*/

		yPos = 0;
		xPos = 0;
		zPos = 0;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.hoop = mat4.create();
			this.tmp = mat4.create();
			let move = vec3.fromValues(1, 1, 10);
			mat4.translate(this.hoop, this.hoop, move);
			mat4.mul(this.tmp, tmpMat, this.hoop);
			this.obj.draw(posAttr, colAttr, modelUnif, this.tmp);

		}
	}
	gl.disableVertexAttribArray(normalAttr);
	gl.enableVertexAttribArray(colAttr);

	if (typeof sun !== 'undefined') {

		yPos = 0;
		xPos = 0;
		zPos = 0;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.sunMat = mat4.create();
			this.tmp = mat4.create();
			let move = vec3.fromValues(1, 1, 1);
			mat4.translate(this.sunMat, this.sunMat, move);
			mat4.mul(this.tmp, tmpMat, this.sunMat);
			this.sun.draw(posAttr, colAttr, modelUnif, this.tmp);
		}
	}

	if (typeof lamp !== 'undefined') {

		yPos = 0;
		xPos = 0;
		zPos = 0;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.lampMat = mat4.create();
			this.tmp = mat4.create();
			let move = vec3.fromValues(1, 1, 1);
			mat4.translate(this.lampMat, this.lampMat, move);
			mat4.mul(this.tmp, tmpMat, this.lampMat);
			this.lamp.draw(posAttr, colAttr, modelUnif, this.tmp);
		}
	}

	if (typeof shooter !== 'undefined') {

		switch (currSelection) {
			case 0:
				yPos = shootery;
				xPos = shooterx;
				zPos = shooterz;
				mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
				mat4.multiply(tmpMat, armCFs[1], tmpMat);   // tmp = ringCF * tmpMat
				this.person1 = mat4.create();
				this.tmp = mat4.create();
				let scalePerson1 = vec3.fromValues(4, 4, 4);

				switch(currSelection2){
					case 0:
						mat4.translate(armCFs[1], armCFs[1], vec3.fromValues(0.75/100, -0.7/100, 0));
						break;

					case 1:
						mat4.translate(armCFs[1], armCFs[1], vec3.fromValues(0/100, 0/100, 0));
						break;

				}
				//mat4.translate(armCFs[1], armCFs[1], vec3.fromValues(0.75/100, -0.7/100, 0));


				mat4.scale(this.person1, this.person1, scalePerson1);
				mat4.mul(this.tmp, tmpMat, this.person1);
				this.shooter.draw(posAttr, colAttr, modelUnif, this.tmp);
				break;
			case 1:
				yPos = shootery;
				xPos = shooterx;
				zPos = shooterz;

				for (let k = 0; k < 2; k++) {
					mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
					mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
					this.person1 = mat4.create();
					this.tmp = mat4.create();
					let scalePerson1 = vec3.fromValues(4, 4, 4);
					mat4.scale(this.person1, this.person1, scalePerson1);
					mat4.mul(this.tmp, tmpMat, this.person1);
					this.shooter.draw(posAttr, colAttr, modelUnif, this.tmp);
					yPos = shooter2y - 0.2;
					xPos = shooter2x + 0.4;
					zPos = shooter2z;
				}
				break;
		}
	}

	if (typeof basketball !== 'undefined') {
		yPos = basketbally;
		xPos = basketballx;
		zPos = basketballz;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, armCFs[0], tmpMat);   // tmp = ringCF * tmpMat

			//let sec = Date.now()/1000;
			let d = new Date(); // for now
			let seconds = d.getSeconds();
			let time = seconds + 2;

			let now = Date.now();
			let elapse = (now - timeStamp) / 1000;
			/* convert to second */
			timeStamp = now + 1;
			let ringSpinAngle = elapse * (RING_ANGULAR_SPEED / 60) * Math.PI;
			switch(currSelection2) {
				case 0:
					mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0.75 / 100, -0.7 / 100, 0));
					break;
				case 1:
					mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0 / 100, 0 / 100, 0));
					break;
			}
			//mat4.rotateX(armCFs[0], armCFs[0], ringSpinAngle);
			//mat4.rotateY(armCFs[0], armCFs[0], ringSpinAngle);
			// mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(-1/100, 0, 0));

			this.basketball_ = mat4.create();
			this.tmp = mat4.create();
			mat4.mul (this.tmp, tmpMat, this.basketball_);
			this.basketball.draw(posAttr, colAttr, modelUnif, this.tmp);
		}
	}

	if (typeof court !== 'undefined') { // gl range out of bounds
		yPos = 0;
		xPos = 0;
		zPos = -.01;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.court_ = mat4.create();
			this.tmp = mat4.create();
			mat4.mul (this.tmp, tmpMat, this.court_);
			this.court.draw(posAttr, colAttr, modelUnif, this.tmp);
		}
	}

	if (typeof fence !== 'undefined') {
		yPos = 0;
		xPos = 0;
		zPos = 0;

		for (let k = 0; k < 22; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.tmp = mat4.create();
			mat4.mul(this.tmp, tmpMat, this.fence);
			this.fence.draw(posAttr, colAttr, modelUnif, this.tmp);
			xPos = xPos + 0.07;
			yPos = yPos - 0.07;
		}

		yPos = 0;
		xPos = 0;
		zPos = 0;
		for (let k = 0; k < 22; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.tmp = mat4.create();
			mat4.mul(this.tmp, tmpMat, this.fence);
			this.fence.draw(posAttr, colAttr, modelUnif, this.tmp);
			xPos = xPos - 0.07;
			yPos = yPos + 0.07;
		}

	}

	if (typeof fence2 !== 'undefined') {

		xPos = -2.8;
		yPos = 0.15;
		zPos = 0;

		for (let k = 0; k < 29; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.tmp = mat4.create();
			mat4.mul(this.tmp, tmpMat, this.fence2);
			this.fence2.draw(posAttr, colAttr, modelUnif, this.tmp);
			xPos = xPos + 0.1;
			yPos = yPos + 0.1;
		}
	}
}

function drawBasketball(){
	if (typeof basketball !== 'undefined') {
		yPos = basketbally;
		xPos = basketballx;
		zPos = basketballz;

		mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
		mat4.multiply(tmpMat, armCFs[0], tmpMat);   // tmp = ringCF * tmpMat

		let now = Date.now();
		let elapse = (now - timeStamp) / 1000;
		/* convert to second */
		timeStamp = now + 1;
		let ringSpinAngle = elapse * (RING_ANGULAR_SPEED / 60) * Math.PI;

		//mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(-0.75/100, 0.7/100, 0));
		switch (currSelection2) {
			case 0:
				mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(-0.75/100, 0.7/100, 0));
				break;
			case 1:
				mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0.0 / 100, 0 / 100, 0 / 100));

		}
		//mat4.rotateX(armCFs[0], armCFs[0], -ringSpinAngle);
		//mat4.rotateY(armCFs[0], armCFs[0], -ringSpinAngle);

		this.basketball_ = mat4.create();
		this.tmp = mat4.create();
		mat4.mul (this.tmp, tmpMat, this.basketball_);
		this.basketball.draw(posAttr, colAttr, modelUnif, this.tmp);
		basketball.draw(posAttr, colAttr, modelUnif, tmpMat);
	}
}

function drawBasketballUp(){
	if (typeof basketball !== 'undefined') {
		yPos = basketbally;
		xPos = basketballx;
		zPos = basketballz;

		mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
		mat4.multiply(tmpMat, armCFs[0], tmpMat);   // tmp = ringCF * tmpMat

		let now = Date.now();
		let elapse = (now - timeStamp) / 1000;
		/* convert to second */
		timeStamp = now + 1;
		let ringSpinAngle = elapse * (RING_ANGULAR_SPEED / 60) * Math.PI * 2;

		switch(currSelection2){
			case 0:
				mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0.1 / 100, -0.1 / 100, 0.8 / 100));
				mat4.rotateX(armCFs[0], armCFs[0], ringSpinAngle);
				mat4.rotateY(armCFs[0], armCFs[0], ringSpinAngle);
				break;
			case 1:
				mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0 / 100, 0 / 100, 0 / 100));
				mat4.rotateX(armCFs[0], armCFs[0], -ringSpinAngle);
				mat4.rotateY(armCFs[0], armCFs[0], -ringSpinAngle);
		}

		//mat4.rotateX(armCFs[0], armCFs[0], ringSpinAngle);
		//mat4.rotateX(armCFs[0], armCFs[0], -ringSpinAngle);
		//mat4.rotateY(armCFs[0], armCFs[0], -ringSpinAngle);

		this.basketball_ = mat4.create();
		this.tmp = mat4.create();
		mat4.mul (this.tmp, tmpMat, this.basketball_);
		this.basketball.draw(posAttr, colAttr, modelUnif, this.tmp);
		basketball.draw(posAttr, colAttr, modelUnif, tmpMat);
	}
}

function drawBasketballDown(){
	if (typeof basketball !== 'undefined') {
		yPos = basketbally;
		xPos = basketballx;
		zPos = basketballz;

		mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
		mat4.multiply(tmpMat, armCFs[0], tmpMat);   // tmp = ringCF * tmpMat

		let now = Date.now();
		let elapse = (now - timeStamp) / 1000;
		/* convert to second */
		timeStamp = now + 1;
		let ringSpinAngle = elapse * (RING_ANGULAR_SPEED / 60) * Math.PI * 2;

		switch (currSelection2) {
			case 0:
				mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0.05 / 100, 0 / 100, -1.7 / 100));
				break;
			case 1:
				mat4.translate(armCFs[0], armCFs[0], vec3.fromValues(0.0 / 100, 0 / 100, 0 / 100));

		}

		this.basketball_ = mat4.create();
		this.tmp = mat4.create();
		mat4.mul (this.tmp, tmpMat, this.basketball_);
		this.basketball.draw(posAttr, colAttr, modelUnif, this.tmp);
		basketball.draw(posAttr, colAttr, modelUnif, tmpMat);
	}
}

function drawplayers() {
	if (typeof shooter !== 'undefined') {
		switch (currSelection) {
			case 0:
				yPos = shootery;
				xPos = shooterx;
				zPos = shooterz;
				mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
				mat4.multiply(tmpMat, armCFs[1], tmpMat);   // tmp = ringCF * tmpMat
				this.person1 = mat4.create();
				this.tmp = mat4.create();
				let scalePerson1 = vec3.fromValues(4, 4, 4);

				//mat4.translate(armCFs[1], armCFs[1], vec3.fromValues(-0.75 / 100, 0.7 / 100, 0));
				switch(currSelection2){
					case 0:
						mat4.translate(armCFs[1], armCFs[1], vec3.fromValues(-0.75/100, 0.7/100, 0));
						break;

					case 1:
						mat4.translate(armCFs[1], armCFs[1], vec3.fromValues(0.0/100, 0/100, 0));
						break;
				}

				mat4.scale(this.person1, this.person1, scalePerson1);
				mat4.mul(this.tmp, tmpMat, this.person1);
				this.shooter.draw(posAttr, colAttr, modelUnif, this.tmp);
				shooter.draw(posAttr, colAttr, modelUnif, tmpMat);
				break;
			case 1:
				yPos = shootery;
				xPos = shooterx;
				zPos = shooterz;

				for (let k = 0; k < 2; k++) {
					mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
					mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
					this.person1 = mat4.create();
					this.tmp = mat4.create();
					let scalePerson1 = vec3.fromValues(4, 4, 4);
					mat4.scale(this.person1, this.person1, scalePerson1);
					mat4.mul(this.tmp, tmpMat, this.person1);
					this.shooter.draw(posAttr, colAttr, modelUnif, this.tmp);
					shooter.draw(posAttr, colAttr, modelUnif, tmpMat);
					yPos = shooter2y - 0.2;
					xPos = shooter2x + 0.4;
					zPos = shooter2z;
				}
				break;
		}
	}
}

function draw3D() {
	/* We must update the projection and view matrices in the shader */
	gl.uniformMatrix4fv(projUnif, false, persProjMat);
	gl.uniformMatrix4fv(viewUnif, false, viewMat);
	mat4.mul (tmpMat, viewMat, ringCF);
	mat3.normalFromMat4 (normalMat, tmpMat);
	gl.uniformMatrix3fv (normalUnif, false, normalMat);
	gl.viewport(0, 0, glCanvas.width, glCanvas.height);
	drawScene();
	setTimeout(drawBasketball, 1200);
	setTimeout(drawplayers, 1200);
	setTimeout(drawBasketballUp, 1500);
	setTimeout(drawBasketballDown, 3500);
	//setTimeout(stopBasketball, 5300);
	// if (typeof obj !== 'undefined') {
	// 	gl.uniform1i(useLightingUnif, false);
	// 	gl.disableVertexAttribArray(normalAttr);
	// 	gl.enableVertexAttribArray(colAttr);
	// 	if (showNormal)
	// 		obj.drawNormal(posAttr, colAttr, modelUnif, ringCF);
	// 	if (showLightVectors)
	// 		obj.drawVectorsTo(gl, lightPos, posAttr, colAttr, modelUnif, ringCF);
	// }
}

function drawTopView() {
	/* We must update the projection and view matrices in the shader */
	gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
	gl.uniformMatrix4fv(viewUnif, false, topViewMat);
	mat4.mul (tmpMat, topViewMat, ringCF);
	mat3.normalFromMat4 (normalMat, tmpMat);
	gl.uniformMatrix3fv (normalUnif, false, normalMat);
	gl.viewport(glCanvas.width/2, 0, glCanvas.width/2, glCanvas.height);
	drawScene();
}

function menuSelected(ev) {
	let sel = ev.currentTarget.selectedIndex;
	/*paramGroup[currSelection].hidden = true;*/
	/*paramGroup[sel].hidden = false;*/
	currSelection = sel;
	console.log("New selection is ", currSelection);
}

function menuSelected2(ev) {
	let sel2 = ev.currentTarget.selectedIndex;
	/*paramGroup[currSelection].hidden = true;*/
	/*paramGroup[sel].hidden = false;*/
	currSelection2 = sel2;
	console.log("New selection is ", currSelection2);
}