/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, ringCF;
var axisBuff, tmpMat;
var globalAxes;
var currSelection = 0;
var currSelection2 = 0;
const RING_ANGULAR_SPEED = 12;  /* 30 RPM (revolutions/min) */

/* Vertex shader attribute variables */
var posAttr, colAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif;

const IDENTITY = mat4.create();
var coneSpinAngle, cameraAngles, cameraAngleIndex;
var obj, shooter, court, basketball, fence, fence2, sun, lamp;
var shaderProg;

var basketballx, basketbally, basketballz, shooterx, shootery, shooterz;
var shooter2x, shooter2y, shooter2z;
var timeStamp;
let armCFs = [];

let paramGroup;

function main() {
    glCanvas = document.getElementById("gl-canvas");

    let menu = document.getElementById("menu");
    menu.addEventListener("change", menuSelected);

    let menu2 = document.getElementById("menu2");
    menu2.addEventListener("change", menuSelected2);

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
            gl.enableVertexAttribArray(posAttr);
            gl.enableVertexAttribArray(colAttr);
            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            ringCF = mat4.create();
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

            /*Create object*/
            obj = new BasketballHoops(gl);
            court = new Court(gl);
            fence = new Fence(gl);
            fence2 = new Fence2(gl);

            basketball = new Basketball(gl);
            armCFs.push( mat4.create() );
            timeStamp = Date.now();

            shooter = new Shooter(gl);
            armCFs.push(mat4.clone(tmpMat)); // important to clone() so we push a new matrix cd

            sun = new Sun(gl);
            lamp = new Lamp(gl);

            globalAxes = new Axes(gl);
            coneSpinAngle = 0;

            basketballx = 0;
            basketbally = 0;
            basketballz = 0;
            shooterx = 0;
            shootery = 0;
            shooterz = 0;
            shooter2x = 0;
            shooter2y = 0;
            shooter2z = 0;

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

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    switch(currSelection2){
        case 2:
            draw3D();
            break;
    }
    //drawTopView(); /* looking at the XY plane, Z-axis points towards the viewer */
    // coneSpinAngle += 1;  /* add 1 degree */
    let now = Date.now();
    let elapse = (now - timeStamp)/1000; /* convert to second */
    timeStamp = now;
    let ringSpinAngle = elapse * (RING_ANGULAR_SPEED / 60) * Math.PI;
    mat4.rotateX (armCFs[0], armCFs[0], ringSpinAngle);
    mat4.rotateY (armCFs[0], armCFs[0], ringSpinAngle);

    requestAnimationFrame(render);
}

function drawScene() {
    globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);
    /*
     let option1 = document.getElementById("option").options[0].value;
     let option2 = document.getElementById("option").options[1].value;
     */

    let yPos = 0;
    let xPos = 0;
    let zPos = 0;

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
            this.obj.draw(posAttr, colAttr, modelUnif, this.tmp);
            obj.draw(posAttr, colAttr, modelUnif, tmpMat);

        }
    }

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
			sun.draw(posAttr, colAttr, modelUnif, tmpMat);
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
			basketball.draw(posAttr, colAttr, modelUnif, tmpMat);
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
			this.court.draw(posAttr, colAttr, modelUnif, this.tmp);
			court.draw(posAttr, colAttr, modelUnif, tmpMat);
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
            fence.draw(posAttr, colAttr, modelUnif, tmpMat);
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
            fence.draw(posAttr, colAttr, modelUnif, tmpMat);
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
            fence2.draw(posAttr, colAttr, modelUnif, tmpMat);
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
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    //gl.viewport(0, 0, glCanvas.width/2, glCanvas.height); //original
    drawScene();
    setTimeout(drawBasketball, 1200);
    setTimeout(drawplayers, 1200);
    setTimeout(drawBasketballUp, 1500);
    setTimeout(drawBasketballDown, 3500);
    //setTimeout(stopBasketball, 5300);
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

function menuSelected2(ev) {
    let sel2 = ev.currentTarget.selectedIndex;
    /*paramGroup[currSelection].hidden = true;*/
    /*paramGroup[sel].hidden = false;*/
    currSelection2 = sel2;
    console.log("New selection is ", currSelection2);
}