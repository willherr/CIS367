/**
 * Created by Hans Dulimarta.
 */
let modelMat = mat4.create();
let canvas, paramGroup;
var currSelection = 0;
var currRotationAxis = "rotx";
let posAttr, colAttr, modelUnif;
let gl;
let obj;

function main() {
    canvas = document.getElementById("gl-canvas");

  /* setup event listener for drop-down menu */
    let menu = document.getElementById("menu");
    menu.addEventListener("change", menuSelected);

  /* setup click listener for th "insert" button */
    let button = document.getElementById("insert");
    button.addEventListener("click", createObject);

  /* setup click listener for the radio buttons (axis of rotation) */
    let radioGroup = document.getElementsByName("rotateGroup");
    for (let r of radioGroup) {
        r.addEventListener('click', rbClicked);
    }

    paramGroup = document.getElementsByClassName("param-group");
    paramGroup[0].hidden = false;

  /* setup window resize listener */
    window.addEventListener('resize', resizeWindow);

    gl = WebGLUtils.create3DContext(canvas, null);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then (prog => {

          /* put all one-time initialization logic here */
            gl.useProgram (prog);
            gl.clearColor (0, 0, 0, 1);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.enable(gl.DEPTH_TEST);

            /* the vertex shader defines TWO attribute vars and ONE uniform var */
            posAttr = gl.getAttribLocation (prog, "vertexPos");
            colAttr = gl.getAttribLocation (prog, "vertexCol");
            modelUnif = gl.getUniformLocation (prog, "modelCF");
            gl.enableVertexAttribArray (posAttr);
            gl.enableVertexAttribArray (colAttr);

          /* calculate viewport */
            resizeWindow();

          /* initiate the render loop */
            render();
        });
}

function drawScene() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  /* in the following three cases we rotate the coordinate frame by 1 degree */
    switch (currRotationAxis) {
        case "rotx":
            mat4.rotateX(modelMat, modelMat, Math.PI / 180);
            break;
        case "roty":
            mat4.rotateY(modelMat, modelMat, Math.PI / 180);
            break;
        case "rotz":
            mat4.rotateZ(modelMat, modelMat, Math.PI / 180);
    }

    if (obj) {
        obj.draw(posAttr, colAttr, modelUnif, modelMat);
    }
}

function render() {
    drawScene();
    requestAnimationFrame(render);
}

function createObject() {
    obj = null;
    mat4.identity(modelMat);
    switch (currSelection) {
        case 0:
            let height = document.getElementById("cone-height").valueAsNumber;
            let radius = document.getElementById("cone-radius").valueAsNumber;
            let subDiv = document.getElementById("cone-subdiv").valueAsNumber;
            let vSubDiv = document.getElementById("cone-vsubdiv").valueAsNumber;
            console.log ("Cone radius: " + radius + " height: " + height + " sub division: " + subDiv + " vsubdiv: " + vSubDiv);
            obj = new Cone(gl, radius, height, subDiv, vSubDiv);
            break;
        case 1:
            let cubelength = document.getElementById("cube-length").valueAsNumber;
            let cubesubDiv = document.getElementById("cube-subdiv").valueAsNumber;
            console.log ("Cube height: " + cubelength + " sub division: " + cubesubDiv);
            obj = new Cube(gl, cubelength, cubesubDiv);
            break;
        case 2:
            let llSphereRadius = document.getElementById("lat-long-sphere-radius").valueAsNumber;
            let longitudes = document.getElementById("lat-long-sphere-longitudes").valueAsNumber;
            let latitudes = document.getElementById("lat-long-sphere-latitudes").valueAsNumber;
            console.log("Lat/Long Sphere radius: " +llSphereRadius+ " longitudes: " +longitudes+ " latitudes: " +latitudes);
            obj = new LLSphere(gl, llSphereRadius, longitudes, latitudes);
            break;
        case 3:
            let rSphereRadius = document.getElementById("sphere-radius").valueAsNumber;
            let depth = document.getElementById("sphere-recursive-calls").valueAsNumber;
            console.log("Recursive Sphere radius: " +rSphereRadius+ "recursive depth: " +depth);
            obj = new RecursiveSphere(gl, rSphereRadius, depth);
            break;
        case 4:
            let TorusLargeRadius = document.getElementById("torus-large-radius").valueAsNumber;
            let TorusSmallRadius = document.getElementById("torus-small-radius").valueAsNumber;
            let TorusSubDiv = document.getElementById("torus-subdiv").valueAsNumber;
            let TorusVSubDiv = document.getElementById("torus-vsubdiv").valueAsNumber;
            console.log("Torus Large-radius: " + TorusLargeRadius + " small-radius: "
                + TorusSmallRadius + "subdiv" + TorusSubDiv + "vsubdiv" + TorusVSubDiv);
            obj = new Torus(gl, TorusLargeRadius, TorusSmallRadius, TorusSubDiv, TorusVSubDiv);
            break;
            break;
        case 5:
            let Ringheight = document.getElementById("ring-height").valueAsNumber;
            let RingOuterRadius = document.getElementById("ring-outer-radius").valueAsNumber;
            let RingInnerRadius = document.getElementById("ring-inner-radius").valueAsNumber;
            let RingsubDiv = document.getElementById("ring-subdiv").valueAsNumber;
            console.log("Cyclindrical Ring height: " + Ringheight + " Outer-radius: " + RingOuterRadius + " Inner-radius: "
                + RingInnerRadius + " sub divisions: " + RingsubDiv);
            obj = new CylindricalRing(gl, RingOuterRadius, RingInnerRadius, Ringheight, RingsubDiv);
            break;
        case 6:
            let tcheight = document.getElementById("truncated-cone-height").valueAsNumber;
            let tcbottomRadius = document.getElementById("truncated-cone-bottom-radius").valueAsNumber;
            let tctopRadius = document.getElementById("truncated-cone-top-radius").valueAsNumber;
            let tcsubDiv = document.getElementById("truncated-cone-subdiv").valueAsNumber;
            let tcvSubDiv = document.getElementById("truncated-cone-vsubdiv").valueAsNumber;
            console.log("Truncated Cone height: " +tcheight+ " top-radius: " +tctopRadius+ " bottom-radius: "
                +tcbottomRadius+ " sub divisions: " +tcsubDiv+ " vertical sub divisions: " +tcvSubDiv);
            obj = new TruncatedCone(gl, tcbottomRadius, tctopRadius, tcheight, tcsubDiv, tcvSubDiv);
            break;
    }
}

function resizeWindow() {
    let w = 0.98 * window.innerWidth;
    let h = 0.6 * window.innerHeight;
    let size = Math.min(0.98 * window.innerWidth, 0.65 * window.innerHeight);
  /* keep a square viewport */
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, size, size);
}

function menuSelected(ev) {
    let sel = ev.currentTarget.selectedIndex;
    paramGroup[currSelection].hidden = true;
    paramGroup[sel].hidden = false;
    currSelection = sel;
    console.log("New selection is ", currSelection);
}

function rbClicked(ev) {
    currRotationAxis = ev.currentTarget.value;
    console.log(ev);
}