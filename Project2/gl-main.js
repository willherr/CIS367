/**
 * Project 1 and 2
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, lightCF, ringCF;
var axisBuff, tmpMat;
var currSelection = 0;

/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, useLightingUnif, objTintUnif, ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif, isEnabledUnif;

const IDENTITY = mat4.create();
var cameraAngles, cameraAngleIndex;
var obj, shooter, court, basketball, fence, fence2, sun, lamp;
var shaderProg;
var lightingComponentEnabled = [true, true, true];

var sunLightPos, lampLightPos;

var basketballx, basketbally, basketballz, shooterx, shootery, shooterz, sunx, suny, sunz, lampx, lampy, lampz;
var shooter2x, shooter2y, shooter2z;

var lampLightCheck, sunLightCheck;

let paramGroup;

function main() {
    glCanvas = document.getElementById("gl-canvas");
    let menu = document.getElementById("menu");
    menu.addEventListener("change", menuSelected);
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);

    paramGroup = document.getElementsByClassName("param-group");
    paramGroup[0].hidden = false;

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
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");

			normalAttr = gl.getAttribLocation(prog, "vertexNormal");
			lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
			normalUnif = gl.getUniformLocation(prog, "normalMat");
			useLightingUnif = gl.getUniformLocation (prog, "useLighting");
			objTintUnif = gl.getUniformLocation(prog, "objectTint");
			ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
			diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
			specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
			shininessUnif = gl.getUniformLocation(prog, "shininess");
			isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");

            gl.enableVertexAttribArray(posAttr);
            gl.enableVertexAttribArray(colAttr);
            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            ringCF = mat4.create();
            lightCF = mat4.create();
            tmpMat = mat4.create();
            mat4.lookAt(viewMat,
                vec3.fromValues(2, 2, 2), /* eye */
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            gl.uniformMatrix4fv(modelUnif, false, ringCF);

            cameraAngles = [vec3.fromValues(2, 2, 2),
                vec3.fromValues(-2, 2, 2),
                vec3.fromValues(-2, -2, 2),
                vec3.fromValues(2, -2, 2)];
            cameraAngleIndex = 0;

			lampLightCheck = document.getElementById("lamp").checked;
			sunLightCheck  = document.getElementById("sun").checked;
			sunLightPos = vec3.fromValues(-6, -2, 1);
			lampLightPos = vec3.fromValues(1.8, -1, -.6);

			gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
			gl.uniform3fv(lightPosUnif, cameraAngles[cameraAngleIndex]);



			gl.uniform3iv(isEnabledUnif, lightingComponentEnabled);
            /*Create objects*/
			basketball = new Basketball(gl);
            obj = new BasketballHoops(gl);
            shooter = new Shooter(gl);
            court = new Court(gl);
            fence = new Fence(gl);
            fence2 = new Fence2(gl);
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
            sunx = 0;
            suny = 0;
            sunz = 0;
            lampx = 0;
            lampy = 0;
            lampz = 0;




            resizeHandler();
            render();
        });
}

function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.9 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { /* landscape */
        let ratio = 2 * glCanvas.height / glCanvas.width;
        console.log("Landscape mode, ratio is " + ratio);
        mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
        mat4.perspective(persProjMat,
            Math.PI/3,  /* 60 degrees vertical field of view */
            1/ratio,    /* must be width/height ratio */
            1,          /* near plane at Z=1 */
            20);        /* far plane at Z=20 */
    } else {
        alert ("Window is too narrow!");
    }
}

function keyboardHandler(event) {
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0.05, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-0.05, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0.05, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0,-0.05, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0, 0.05));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0,-0.05));
    const rotX      = mat4.fromXRotation(mat4.create(), Math.PI/16);
    const rotY      = mat4.fromYRotation(mat4.create(), Math.PI/16);
    const rotZ      = mat4.fromZRotation(mat4.create(), Math.PI/16);

    switch (event.key) {
        case "x":
            mat4.multiply(viewMat, transXneg, viewMat);  // viewMat = Trans * viewMat
            break;
        case "X":
            mat4.multiply(viewMat, transXpos, viewMat);  // viewMat = Trans * viewMat
            break;
        case "y":
            mat4.multiply(viewMat, transYneg, viewMat);  // viewMat = Trans * viewMat
            break;
        case "Y":
            mat4.multiply(viewMat, transYpos, viewMat);  // viewMat = Trans * viewMat
            break;
        case "z":
            mat4.multiply(viewMat, transZneg, viewMat);  // viewMat = Trans * viewMat
            break;
        case "Z":
            mat4.multiply(viewMat, transZpos, viewMat);  // viewMat = Trans * viewMat
            break;
		case "1":
			mat4.multiply(viewMat, rotX, viewMat);
			break;
		case "2":
			mat4.multiply(viewMat, rotY, viewMat);
			break;
		case "3":
			mat4.multiply(viewMat, rotZ, viewMat);
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
			gl.uniform3fv(lightPosUnif, cameraAngles[cameraAngleIndex]);
            break;

		case "4":
			lampx = lampx - .05;
			break;
		case "5":
			lampx = lampx + .05;
			break;
		case "6":
			lampy = lampy - .05;
			break;
		case "7":
			lampy = lampy + .05;
			break;
		case "8":
			lampz = lampz - .05;
			break;
		case "9":
			lampz = lampz+ .05;
			break;

		case "[":
			sunx = sunx - .05;
			break;
		case "]":
			sunx = sunx + .05;
			break;
		case ";":
			suny = suny - .05;
			break;
		case "'":
			suny = suny + .05;
			break;
		case "-":
			sunz = sunz - .05;
			break;
		case "+":
			sunz = sunz + .05;

    }
	mat4.lookAt(viewMat);
    textOut.innerHTML = "Court origin (" + ringCF[12].toFixed(1) + ", "
        + ringCF[13].toFixed(1) + ", "
        + ringCF[14].toFixed(1) + ")";
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	lampLightCheck = document.getElementById("lamp").checked;
	sunLightCheck  = document.getElementById("sun").checked;
    draw3D();
    requestAnimationFrame(render);
}

function drawScene() {
    gl.uniform1i(useLightingUnif, true);
	gl.disableVertexAttribArray(colAttr);
	gl.enableVertexAttribArray(normalAttr);

    let yPos = 0;
    let xPos = 0;
    let zPos = 0;

	if (typeof basketball !== 'undefined') {
		yPos = basketbally;
		xPos = basketballx;
		zPos = basketballz;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.basketball_ = mat4.create();
			this.tmp = mat4.create();
			mat4.mul (this.tmp, tmpMat, this.basketball_);
			this.basketball.draw(posAttr, normalAttr, modelUnif, this.tmp);
			basketball.draw(posAttr, normalAttr, modelUnif, tmpMat);
		}
	}

    if (typeof obj !== 'undefined') {
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
            //mat4.rotateZ(this.hoop, this.hoop, Math.PI/16);
            mat4.translate(this.hoop, this.hoop, move);
            mat4.mul(this.tmp, tmpMat, this.hoop);
            this.obj.draw(posAttr, normalAttr, modelUnif, this.tmp);
            obj.draw(posAttr, normalAttr, modelUnif, tmpMat);

        }
    }


    if (typeof shooter !== 'undefined') {
        switch (currSelection) {
            case 0:
                yPos = shootery;
                xPos = shooterx;
                zPos = shooterz;
                mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
                mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
                this.person1 = mat4.create();
                this.tmp = mat4.create();
                let scalePerson1 = vec3.fromValues(4, 4, 4);
                mat4.scale(this.person1, this.person1, scalePerson1);
                mat4.mul(this.tmp, tmpMat, this.person1);
                this.shooter.draw(posAttr, normalAttr, modelUnif, this.tmp);
                shooter.draw(posAttr, normalAttr, modelUnif, tmpMat);
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
                    this.shooter.draw(posAttr, normalAttr, modelUnif, this.tmp);
                    shooter.draw(posAttr, normalAttr, modelUnif, tmpMat);
                    yPos = shooter2y - 0.2;
                    xPos = shooter2x + 0.4;
                    zPos = shooter2z;
                }
                    break;
    }
}



	if (typeof court !== 'undefined') {
		yPos = 0;
		xPos = 0;
		zPos = -.01;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.court_ = mat4.create();
			this.tmp = mat4.create();
			mat4.mul (this.tmp, tmpMat, this.court_);
			this.court.draw(posAttr, normalAttr, modelUnif, this.tmp);
			court.draw(posAttr, normalAttr, modelUnif, tmpMat);
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
            this.fence.draw(posAttr, normalAttr, modelUnif, this.tmp);
            fence.draw(posAttr, normalAttr, modelUnif, tmpMat);
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
            this.fence.draw(posAttr, normalAttr, modelUnif, this.tmp);
            fence.draw(posAttr, normalAttr, modelUnif, tmpMat);
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
            this.fence2.draw(posAttr, normalAttr, modelUnif, this.tmp);
            fence2.draw(posAttr, normalAttr, modelUnif, tmpMat);
            xPos = xPos + 0.1;
            yPos = yPos + 0.1;
        }
    }

	if (typeof lamp !== 'undefined') {

		yPos = lampy;
		xPos = lampx;
		zPos = lampz;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.lampMat = mat4.create();
			this.tmp = mat4.create();
			let move = vec3.fromValues(1, 1, 1);
			mat4.translate(this.lampMat, this.lampMat, move);
			mat4.mul(this.tmp, tmpMat, this.lampMat);
			this.lamp.draw(posAttr, normalAttr, modelUnif, this.tmp);
		}
	}

	if (typeof sun !== 'undefined') {

		yPos = suny;
		xPos = sunx;
		zPos = sunz;

		for (let k = 0; k < 1; k++) {
			mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, yPos, zPos));
			mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
			this.sunMat = mat4.create();
			this.tmp = mat4.create();
			let move = vec3.fromValues(1, 1, 1);
			mat4.translate(this.sunMat, this.sunMat, move);
			mat4.mul(this.tmp, tmpMat, this.sunMat);
			sun.draw(posAttr, colAttr, modelUnif, tmpMat);
		}
	}

}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    //gl.viewport(0, 0, glCanvas.width/2, glCanvas.height); //original
    drawScene();
}

function drawTopView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    //gl.uniformMatrix4fv(viewUnif, false, topViewMat);
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