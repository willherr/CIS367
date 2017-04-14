var scene, camera, renderer;
var geometry, material, mesh;
var orangeCF, orangeTrans, orangeScale, orangeRot;
var grapeCF, grapeTrans, grapeScale, grapeRot;
var appleCF, appleTrans, appleScale, appleRot;
var translateZpos, translateZneg, rotateYpos, rotateYneg;
var myGrape, myOrange, myApple;

init();

animate();

function init() {
    translateZneg = new THREE.Matrix4().makeTranslation(0, 0, -5);
    translateZpos = new THREE.Matrix4().makeTranslation(0, 0, 5);
    rotateYneg = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(-5));
    rotateYpos = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(5));

    scene = new THREE.Scene();

    myOrange = new Orange(20); //radius parameter
    scene.add(myOrange);
    myGrape = new Grape(8); //radius parameter
    scene.add(myGrape);
    myApple = new Apple(1); //scalar parameter
    scene.add(myApple);

    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(0,-50,25);
    scene.add(lightOne);

    camera = new THREE.PerspectiveCamera (75, window.innerWidth/window.innerHeight, 1, 10000);

    const eyePos = new THREE.Vector3 (0, -100, 40);
    const cameraPose = new THREE.Matrix4().lookAt (
        eyePos,
        new THREE.Vector3 (0, 0, 0),
        new THREE.Vector3 (0, 0, 1));

// lookAt() initialized only the rotational component
// we have to set the camera position using a separate call
    cameraPose.setPosition(eyePos);

    camera.matrixAutoUpdate = false;    // disable matrix auto update
    camera.matrixWorld.copy (cameraPose);
// camera.updateMatrixWorld (true);

    orangeCF = new THREE.Matrix4();
    orangeTrans = new THREE.Vector3();
    orangeScale = new THREE.Vector3();
    orangeRot = new THREE.Quaternion();

    grapeCF = new THREE.Matrix4();
    grapeTrans = new THREE.Vector3();
    grapeScale = new THREE.Vector3();
    grapeRot = new THREE.Quaternion();

    appleCF = new THREE.Matrix4();
    appleTrans = new THREE.Vector3();
    appleScale = new THREE.Vector3();
    appleRot = new THREE.Quaternion();

    grapeCF.multiply(new THREE.Matrix4().makeTranslation(50, 0, 0)); //translates the grape outside the orange
    appleCF.multiply(new THREE.Matrix4().makeTranslation(-50, 0, 0));
    appleCF.multiply(new THREE.Matrix4().makeScale(2, 2, 2)); // scales the apple slightly bigger

    window.addEventListener("keydown", keyboardHandler, false);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {
    const rotZ1 = new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(1));
    orangeCF.multiply(rotZ1);
    orangeCF.decompose(orangeTrans, orangeRot, orangeScale);

    myOrange.position.copy (orangeTrans);   /* apply the transformation */
    myOrange.quaternion.copy (orangeRot);
    myOrange.scale.copy (orangeScale);


    grapeCF.multiply(rotZ1);
    grapeCF.decompose(grapeTrans, grapeRot, grapeScale);

    myGrape.position.copy(grapeTrans);
    myGrape.quaternion.copy(grapeRot);
    myGrape.scale.copy(grapeScale);


    appleCF.multiply(rotZ1);
    appleCF.decompose(appleTrans, appleRot, appleScale);

    myApple.position.copy(appleTrans);
    myApple.quaternion.copy(appleRot);
    myApple.scale.copy(appleScale);

    requestAnimationFrame( animate );

    renderer.render( scene, camera );
}

function keyboardHandler(event){
    console.log(event.key);
    camera.matrixAutoUpdate = false;
    switch(event.key){
        case 'ArrowLeft': camera.matrixWorld.multiply(rotateYpos);
            break;
        case 'ArrowRight': camera.matrixWorld.multiply(rotateYneg);
            break;
        case 'ArrowUp': camera.matrixWorld.multiply(translateZneg);
            break;
        case 'ArrowDown': camera.matrixWorld.multiply(translateZpos);
            break;
        default:
            console.log("That key ^ does nothing...");
            break;
    }
}
