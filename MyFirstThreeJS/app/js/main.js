var scene, camera, renderer;
var geometry, material, mesh;
var orangeCF, orangeTrans, orangeScale, orangeRot;
var grapeCF, grapeTrans, grapeScale, grapeRot;
var appleCF, appleTrans, appleScale, appleRot;
var lemonCF, lemonTrans, lemonScale, lemonRot;
var watermelonCF, watermelonTrans, watermelonScale, watermelonRot;
var bombCF, bombTrans, bombScale, bombRot;
var translateZpos, translateZneg, rotateYpos, rotateYneg, translateXpos, translateXneg;
var translateYpos, translateYneg, rotateXpos, rotateXneg, rotateZneg, rotateZpos;
var myGrape, myOrange, myApple, myWatermelon, myBomb, myLemon;
var rotateCount, lastRotation;
var timerId, timerId2;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var clickedGrape, clickedApple, clickedWatermelon, clickedOrange, clickedBomb, clickedLemon;

init();

//random rotation functionality (can be used in game)
const rotateObject = [new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(1)),
    new THREE.Matrix4().makeRotationZ(-THREE.Math.degToRad(1)),
    new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(1)),
    new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(1)),
    new THREE.Matrix4().makeRotationX(-THREE.Math.degToRad(1)),
    new THREE.Matrix4().makeRotationY(-THREE.Math.degToRad(1))];

const sendBackFruit = new THREE.Matrix4().makeTranslation(0, 0, 1);

let score = 0;
let startingCountdown = 3;
document.getElementById('score').innerHTML = "Score: " +  score;

let timeLeft = 30;
animate();

let elem = document.getElementById('timer');
let begin = document.getElementById('countdown');

function init() {
    rotateCount = 0;
    lastRotation = [0, 0, 0, 0];
    const orangeRadius = 12;
    const grapeRadius = 12;
    const watermelonRadius = 15;
    const lemonRadius = 13;
    const bombRadius = 12;

    translateZneg = new THREE.Matrix4().makeTranslation(0, 0, -5);
    translateZpos = new THREE.Matrix4().makeTranslation(0, 0, 5);
    translateYpos = new THREE.Matrix4().makeTranslation(0, 5, 0);
    translateYneg = new THREE.Matrix4().makeTranslation(0, -5, 0);
    translateXpos = new THREE.Matrix4().makeTranslation(5, 0, 0);
    translateXneg = new THREE.Matrix4().makeTranslation(-5, 0, 0);

    rotateXneg = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-5));
    rotateXpos = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(5));
    rotateYneg = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(-5));
    rotateYpos = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(5));
    rotateZneg = new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(-5));
    rotateZpos = new THREE.Matrix4().makeRotationZ(THREE.Math.degToRad(5));

    scene = new THREE.Scene();

    myOrange = new Orange(orangeRadius);
    scene.add(myOrange);
    myGrape = new Grape(grapeRadius);
    scene.add(myGrape);
    myApple = new Apple();
    scene.add(myApple);
    myWatermelon = new Watermelon(watermelonRadius);
    scene.add(myWatermelon);
    myLemon = new Lemon(lemonRadius);
    scene.add(myLemon);
    myBomb = new Bomb(bombRadius);
    scene.add(myBomb);

    const woodTex = new THREE.TextureLoader().load("textures/wood.jpeg");
    woodTex.repeat.set(2,2);     // repeat the texture 6x in both s- and t- directions
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;
    const ground = new THREE.Mesh (
        new THREE.PlaneGeometry(4000, 3500),
        new THREE.MeshPhongMaterial({ map: woodTex})
    );
    ground.translateZ(-300);
    scene.add(ground); //commented for now to debug clicking on fruits

    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, -50, 100);
    scene.add (lightOne); //remember to add the light to the scene

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    const eyePos = new THREE.Vector3 (0, -140, 75);
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

    watermelonCF = new THREE.Matrix4();
    watermelonTrans = new THREE.Vector3();
    watermelonScale = new THREE.Vector3();
    watermelonRot = new THREE.Quaternion();

    lemonCF = new THREE.Matrix4();
    lemonTrans = new THREE.Vector3();
    lemonScale = new THREE.Vector3();
    lemonRot = new THREE.Quaternion();

    bombCF = new THREE.Matrix4();
    bombTrans = new THREE.Vector3();
    bombScale = new THREE.Vector3();
    bombRot = new THREE.Quaternion();

    /* Placing transforming objects for development purposes */
    let zGrapePos = Math.random() * (20 - (-50)) + (-50);
    let zApplePos = Math.random() * (20 - (-50)) + (-50);
    let zWaterPos = Math.random() * (20 - (-50)) + (-50);
    let zOrangePos = Math.random() * (20 - (-50)) + (-50);
    let zBombPos = Math.random() * (20 - (-50)) + (-50);
    let zLemonPos = Math.random() * (20 - (-50)) + (-50);
    grapeCF.multiply(new THREE.Matrix4().makeTranslation(-150, 0, zGrapePos));
    appleCF.multiply(new THREE.Matrix4().makeTranslation(-90, 0, zApplePos));
    watermelonCF.multiply(new THREE.Matrix4().makeTranslation(-25, 0, zWaterPos));
    orangeCF.multiply(new THREE.Matrix4().makeTranslation(25, 0, zOrangePos));
    bombCF.multiply(new THREE.Matrix4().makeTranslation(90, 0, zBombPos));
    lemonCF.multiply(new THREE.Matrix4().makeTranslation(150, 0, zLemonPos));

    /* I think the apple should be twice the original size */
    appleCF.multiply(new THREE.Matrix4().makeScale(1.5, 1.5, 1.5));

    window.addEventListener("keydown", keyboardHandler, false);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
}

function animate() {
    //orange animation
    //first multiply chooses the X or Y direction the fruit should spin
    //second multiply makes the fruit spin on its Z axis either positively or negatively at the same time
    if(clickedOrange)
        //orangeCF.multiply(sendBackFruit);//Doesn't do what we want for game, used for debugging
    //orangeCF.multiply(rotateObject[randomRotation(0)]);
    orangeCF.multiply(rotateObject[lastRotation[0]%2]);
    orangeCF.decompose(orangeTrans, orangeRot, orangeScale);

    myOrange.position.copy(orangeTrans);
    myOrange.quaternion.copy(orangeRot);
    myOrange.scale.copy(orangeScale);
    //grape animation
    if(clickedGrape)
        //grapeCF.multiply(sendBackFruit);
    grapeCF.multiply(rotateObject[randomRotation(1)]);
    grapeCF.multiply(rotateObject[lastRotation[1]%2]);
    grapeCF.decompose(grapeTrans, grapeRot, grapeScale);

    myGrape.position.copy(grapeTrans);
    myGrape.quaternion.copy(grapeRot);
    myGrape.scale.copy(grapeScale);

    //apple animation
    if(clickedApple)
        //appleCF.multiply(sendBackFruit);
    appleCF.multiply(rotateObject[randomRotation(2)]);
    appleCF.multiply(rotateObject[lastRotation[2]%2]);
    appleCF.decompose(appleTrans, appleRot, appleScale);

    myApple.position.copy(appleTrans);
    myApple.quaternion.copy(appleRot);
    myApple.scale.copy(appleScale);


    if(clickedBomb)
        //bombCF.multiply(sendBackFruit);
    bombCF.multiply(rotateObject[randomRotation(2)]);
    bombCF.multiply(rotateObject[lastRotation[2]%2]);
    bombCF.decompose(bombTrans, bombRot, bombScale);

   myBomb.position.copy(bombTrans);
   myBomb.quaternion.copy(bombRot);
   myBomb.scale.copy(bombScale);

    //watermelon animation
    if(clickedWatermelon)
        //watermelonCF.multiply(sendBackFruit);
    watermelonCF.multiply(rotateObject[randomRotation(3)]);
    watermelonCF.multiply(rotateObject[lastRotation[3]%2]);
    watermelonCF.decompose(watermelonTrans, watermelonRot, watermelonScale);

    myWatermelon.position.copy(watermelonTrans);
    myWatermelon.quaternion.copy(watermelonRot);
    myWatermelon.scale.copy(watermelonScale);

    if(clickedLemon)
    //watermelonCF.multiply(sendBackFruit);
        lemonCF.multiply(rotateObject[randomRotation(3)]);
    lemonCF.multiply(rotateObject[lastRotation[3]%2]);
    lemonCF.decompose(lemonTrans, lemonRot, lemonScale);

    myLemon.position.copy(lemonTrans);
    myLemon.quaternion.copy(lemonRot);
    myLemon.scale.copy(lemonScale);

    //setting this variable to 1 ensures that the fruits do not change rotation anymore
    rotateCount = 1;
    if(timeLeft == 29 || timeLeft == 28 || timeLeft == 25 || timeLeft == 24
        || timeLeft == 21 || timeLeft == 20 || timeLeft == 17 || timeLeft == 16
        || timeLeft == 13 || timeLeft == 12 || timeLeft == 9 || timeLeft == 8
        || timeLeft == 5 || timeLeft == 4 || timeLeft == 1) {
        fruitAnimationUp();
    }
    else if(timeLeft == 27 || timeLeft == 26 || timeLeft == 23 || timeLeft == 22
        || timeLeft == 19 || timeLeft == 18 || timeLeft == 15 || timeLeft == 14
        || timeLeft == 11 || timeLeft == 10 || timeLeft == 7 || timeLeft == 6
        || timeLeft == 3 || timeLeft == 2) {
        fruitAnimationDown();
    }
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
     case 'k': camera.matrixWorld.multiply(rotateXneg);
     break;
     case 'l': camera.matrixWorld.multiply(rotateXpos);
     break;
     case 'o': camera.matrixWorld.multiply(rotateZpos);
     break;
     case 'm': camera.matrixWorld.multiply(rotateZneg);
     break;
     case 'ArrowUp': camera.matrixWorld.multiply(translateZneg);
     break;
     case 'ArrowDown': camera.matrixWorld.multiply(translateZpos);
     break;
     case 'a': camera.matrixWorld.multiply(translateXpos);
     break;
     case 's': camera.matrixWorld.multiply(translateXneg);
     break;
     case 'w': camera.matrixWorld.multiply(translateYpos);
     break;
     case 'x': camera.matrixWorld.multiply(translateYneg);
     break;
     default:
     console.log("That key ^ does nothing...");
     break;
     }
}

function spawnOrange(){
    scene.add(myOrange);

    scene.updateMatrixWorld(true);
    let position = new THREE.Vector3();
    position.setFromMatrixPosition( myOrange.matrixWorld );
    //alert(position.x + ',' + position.y + ',' + position.z);

    let xPos = Math.random() * (100 - (-100)) + (-100); //-150 to 150
    let zPos = Math.random() * (60 - (-30)) + (-30); //-40 to 75
    myOrange.position.set(0, 0, 0);

    if(position.x < -100 || position.x > 100){
        position.x = 10;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    if(position.z < -30 || position.z > 60){
        position.z = 15;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }

    orangeCF.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));
}

function spawnApple(){
    scene.add(myApple);

    scene.updateMatrixWorld(true);
    let position = new THREE.Vector3();
    position.setFromMatrixPosition( myApple.matrixWorld );
    //alert(position.x + ',' + position.y + ',' + position.z);

    let xPos = Math.random() * (100 - (-100)) + (-100); //-150 to 150
    let zPos = Math.random() * (60 - (-30)) + (-30); //-40 to 75
    myApple.position.set(0, 0, 0);

    if(position.x < -100 || position.x > 100){
        position.x = xPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }

    if(position.z < -30 || position.z > 60){
        position.z = 15;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    appleCF.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));
}

function spawnWatermelon(){
    scene.add(myWatermelon);
    scene.updateMatrixWorld(true);
    let position = new THREE.Vector3();
    position.setFromMatrixPosition( myWatermelon.matrixWorld );
    //alert(position.x + ',' + position.y + ',' + position.z);

    let xPos = Math.random() * (100 - (-100)) + (-100); //-150 to 150
    let zPos = Math.random() * (60 - (-30)) + (-30); //-40 to 75
    myWatermelon.position.set(0, 0, 0);

    if(position.x < -100 || position.x > 100){
        position.x = xPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }

    if(position.z < -30 || position.z > 60){
        position.z = zPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }

    watermelonCF.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));
}

function spawnGrape(){
    scene.add(myGrape);

    scene.updateMatrixWorld(true);
    let position = new THREE.Vector3();
    position.setFromMatrixPosition( myGrape.matrixWorld );
    //alert(position.x + ',' + position.y + ',' + position.z);

    let xPos = Math.random() * (100 - (-100)) + (-100); //-150 to 150
    let zPos = Math.random() * (60 - (-30)) + (-30); //-40 to 75
    myGrape.position.set(50, 0, 0);

    if(position.x < -100 || position.x > 100){
        position.x = xPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    if(position.z < -30 || position.z > 60){
        position.z = zPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }

    grapeCF.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));
}


function spawnBomb(){
    scene.add(myBomb);

    scene.updateMatrixWorld(true);
    let position = new THREE.Vector3();
    position.setFromMatrixPosition( myBomb.matrixWorld );
    //alert(position.x + ',' + position.y + ',' + position.z);

    let xPos = Math.random() * (100 - (-100)) + (-100); //-150 to 150
    let zPos = Math.random() * (60 - (-30)) + (-30); //-40 to 75
    myBomb.position.set(100, 0, 0);

    if(position.x < -100 || position.x > 100){
        position.x = xPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    if(position.z < -30 || position.z > 60){
        position.z = zPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    bombCF.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));
}

function spawnLemon(){
    scene.add(myLemon);

    scene.updateMatrixWorld(true);
    let position = new THREE.Vector3();
    position.setFromMatrixPosition( myLemon.matrixWorld );
    //alert(position.x + ',' + position.y + ',' + position.z);

    let xPos = Math.random() * (100 - (-100)) + (-100); //-150 to 150
    let zPos = Math.random() * (60 - (-30)) + (-30); //-40 to 75
    myLemon.position.set(100, 0, 0);

    if(position.x < -100 || position.x > 100){
        position.x = xPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    if(position.z < -30 || position.z > 60){
        position.z = zPos;
        //alert("Changed: " + position.x + ',' + position.y + ',' + position.z);
    }
    lemonCF.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));
}

//doesn't work currently if you move camera
function clickFruitEvent(event){
    mouse.x = (event.clientX/window.innerWidth)*2 - 1;
    mouse.y = -(event.clientY/window.innerHeight)*2 + 1;

    raycaster.setFromCamera(mouse, camera);
    clickedOrange = clickedApple = clickedGrape = clickedWatermelon = clickedBomb = clickedLemon = false;

        let intersects = raycaster.intersectObjects(scene.children, true);
        let timeInterval = Math.random() * (1000 - 300) + 300;
        let appleInterval = Math.random() * (2000 - 800) + 800;

    for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.parent == myOrange) {
                clickedOrange = true;
                //can remove when clicked
                scene.remove(myOrange);
                score++;
                document.getElementById('score').innerHTML = "Score: " + score;
                setTimeout(spawnOrange, timeInterval);
            }
            if (intersects[i].object.parent == myApple) {
                clickedApple = true;
                scene.remove(myApple);
                score++;
                document.getElementById('score').innerHTML = "Score: " + score;
                setTimeout(spawnApple, appleInterval);
            }
            if (intersects[i].object.parent == myWatermelon) {
                clickedWatermelon = true;
                scene.remove(myWatermelon);
                score++;
                document.getElementById('score').innerHTML = "Score: " + score;
                setTimeout(spawnWatermelon, timeInterval);
            }
            if (intersects[i].object.parent == myGrape) {
                clickedGrape = true;
                scene.remove(myGrape);
                score++;
                document.getElementById('score').innerHTML = "Score: " + score;
                setTimeout(spawnGrape, timeInterval);
            }
            if (intersects[i].object.parent == myBomb) {
                clickedBomb = true;
                scene.remove(myBomb);
                score--;
                timeLeft = timeLeft - 5;
                document.getElementById('score').innerHTML = "Score: " + score;
                setTimeout(spawnBomb, timeInterval);
            }
            if (intersects[i].object.parent == myLemon) {
                clickedLemon = true;
                scene.remove(myLemon);
                score++;
                document.getElementById('score').innerHTML = "Score: " + score;
                setTimeout(spawnLemon, timeInterval);
            }
        }
}
function fruitAnimationUp(){
    let speedX = Math.random() * (1000 - 300) + 300;
    let speedZ = Math.random() * (1000 - 300) + 300;

    const sendUpFruit = new THREE.Matrix4().makeTranslation(0.4, 0, 0.9);
    orangeCF.multiply(sendUpFruit);//Doesn't do what we want for game, used for debugging
    bombCF.multiply(sendUpFruit);//Doesn't do what we want for game, used for debugging
    appleCF.multiply(sendUpFruit);//Doesn't do what we want for game, used for debugging
    grapeCF.multiply(sendUpFruit);//Doesn't do what we want for game, used for debugging
    watermelonCF.multiply(sendUpFruit);//Doesn't do what we want for game, used for debugging
    lemonCF.multiply(sendUpFruit);//Doesn't do what we want for game, used for debugging
}

function fruitAnimationDown(){
    let speedX = Math.random() * (1000 - 300) + 300;
    let speedZ = Math.random() * (1000 - 300) + 300;

    const sendDownFruit = new THREE.Matrix4().makeTranslation(-0.55, 0, -1.07);
    orangeCF.multiply(sendDownFruit);//Doesn't do what we want for game, used for debugging
    appleCF.multiply(sendDownFruit);//Doesn't do what we want for game, used for debugging
    lemonCF.multiply(sendDownFruit);//Doesn't do what we want for game, used for debugging
    bombCF.multiply(sendDownFruit);//Doesn't do what we want for game, used for debugging
    watermelonCF.multiply(sendDownFruit);//Doesn't do what we want for game, used for debugging
    grapeCF.multiply(sendDownFruit);//Doesn't do what we want for game, used for debugging
}

function startTimer(){
    timerId2 = setInterval(beginCountdown, 1000);
    window.addEventListener("click", clickFruitEvent, false);
}

function resetTimer(){
    timeLeft = 30;
    startingCountdown = 3;
    score = 0;
    timerId2 = setInterval(beginCountdown, 1000);

    document.getElementById('score').innerHTML = "Score: " + score;
    scene.remove(myGrape);
    scene.remove(myOrange);
    scene.remove(myWatermelon);
    scene.remove(myApple);
    scene.remove(myBomb);
    scene.remove(myLemon);

    setTimeout(spawnOrange, 1000);
    setTimeout(spawnBomb, 1000);
    setTimeout(spawnGrape, 1000);
    setTimeout(spawnApple, 1000);
    setTimeout(spawnLemon, 1000);
    setTimeout(spawnWatermelon, 1000);
    window.addEventListener("click", clickFruitEvent, false);
}


function countdown() {
    if (timeLeft <= 0) {
        elem.innerHTML = "Time's up!";
        try {
            clearTimeout(timerId);
            window.removeEventListener("click", clickFruitEvent, false);
            displayModal();
        } catch (Exception) {
            //remove from logger the exception when time is up
        }
    } else if (timeLeft >= 10){
        elem.innerHTML = '0:' + timeLeft;
        timeLeft--;
    }
    else if (timeLeft < 10  && timeLeft > 0){
        elem.innerHTML = '0:0' + timeLeft;
        timeLeft--;
    }
}

function beginCountdown() {
    window.removeEventListener("click", clickFruitEvent, false);
    if (startingCountdown == 0) {
        begin.innerHTML = "";
        try {
            clearTimeout(timerId2);
            timerId = setInterval(countdown, 1000);
            window.addEventListener("click", clickFruitEvent, false);
        } catch (Exception) {
            //remove from logger the exception when time is up
        }
    } else if (timeLeft > 0){
        begin.innerHTML = startingCountdown;
        startingCountdown--;
    }

}
//function to choose initial X or Y direction of spin on fruit
function randomRotation(index){
    if(rotateCount == 0) {
        lastRotation[index] = Math.floor((Math.random() * 4)) + 2;
    }
    return lastRotation[index];
}

var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
function displayModal() {
    modal.style.display = "block";
    document.getElementById('score_final').innerHTML = "Your score was: " + score;
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}