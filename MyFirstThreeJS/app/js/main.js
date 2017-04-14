var scene, camera, renderer;
var geometry, material, mesh;
var orangeCF, orangeTrans, orangeScale, orangeRot;
var grapeCF, grapeTrans, grapeScale, grapeRot;
var appleCF, appleTrans, appleScale, appleRot;
var translateZpos, translateZneg, rotateYpos, rotateYneg;
var myGrape, myOrange, myApple;

init();

animate();

let score = 0;
document.getElementById('score').innerHTML = "Score: " +  score;

let timeLeft = 30;
let elem = document.getElementById('timer');

function init() {
    const orangeRadius = 15;
    const grapeRadius = 8;

    translateZneg = new THREE.Matrix4().makeTranslation(0, 0, -5);
    translateZpos = new THREE.Matrix4().makeTranslation(0, 0, 5);
    rotateYneg = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(-5));
    rotateYpos = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(5));

    scene = new THREE.Scene();

    myOrange = new Orange(orangeRadius);
    scene.add(myOrange);
    myGrape = new Grape(grapeRadius);
    scene.add(myGrape);
    myApple = new Apple();
    scene.add(myApple);

    const woodTex = new THREE.TextureLoader().load("textures/wood.jpeg");
    woodTex.repeat.set(2,2);     // repeat the texture 6x in both s- and t- directions
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;
    const ground = new THREE.Mesh (
        new THREE.PlaneGeometry(3500, 4000),
        new THREE.MeshPhongMaterial({ map: woodTex})
    );
    ground.translateZ(-300);

    scene.add(ground);

    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, -50, 100);
    scene.add (lightOne); //remember to add the light to the scene

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    const eyePos = new THREE.Vector3 (0, -100, 40);
    const cameraPose = new THREE.Matrix4().lookAt (
        eyePos,
        new THREE.Vector3 (0, 0, 0),
        new THREE.Vector3 (0, 0, 1));

    /* For Development Purposes */
    cameraPose.setPosition(eyePos);
    camera.matrixAutoUpdate = false;
    camera.matrixWorld.copy (cameraPose);
    /************************************/

    /* Object Coordinate Frames */
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

    /* Placing transforming objects for development purposes */
    grapeCF.multiply(new THREE.Matrix4().makeTranslation(50, 0, 0));
    appleCF.multiply(new THREE.Matrix4().makeTranslation(-50, 0, 0));

    /* I think the apple should be twice the original size */
    appleCF.multiply(new THREE.Matrix4().makeScale(2, 2, 2));

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
    /* Going to uncomment these for object building purposes */
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

function countdown() {
    if (timeLeft == 0) {
        elem.innerHTML = "Time's up!";
        clearTimeout(timerId);
    } else if (timeLeft >= 10){
        elem.innerHTML = '0:' + timeLeft;
        timeLeft--;
    }
    else if (timeLeft < 10  && timeLeft > 0){
        elem.innerHTML = '0:0' + timeLeft;
        timeLeft--;
    }
}

function startTimer(){
    let timerId = setInterval(countdown, 1000);
}
