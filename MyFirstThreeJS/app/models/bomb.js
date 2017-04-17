/**
 * Created by User on 4/16/2017.
 */
class Bomb {
    constructor (radius) { // orange radius
        const bombTex = new THREE.TextureLoader().load("textures/bomb_background.jpg");
        bombTex.repeat.set(2, 2);
        bombTex.wrapS = THREE.MirroredRepeatWrapping;
        bombTex.wrapT = THREE.MirroredRepeatWrapping;

        const sphereGeo = new THREE.SphereGeometry(radius, 20, 20); //using defaults for the rest of the constructor
        const sphereMat = new THREE.MeshPhongMaterial ({map: bombTex});
        const bomb = new THREE.Mesh (sphereGeo, sphereMat);
        bomb.scale.z = .9;

        const bombGroup = new THREE.Group();
        bombGroup.add (bomb);

        return bombGroup;   // the constructor must return the entire group
    }
}