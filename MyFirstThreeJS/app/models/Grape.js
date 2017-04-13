/**
 * Created by willherr on 4/13/2017.
 */
class Grape {
    constructor (radius) { // orange radius
        const grapeTex = new THREE.TextureLoader().load("textures/grape_fruit.jpg")
        //grapeTex.repeat.set(6,6);
        grapeTex.wrapS = THREE.RepeatWrapping;
        grapeTex.wrapT = THREE.RepeatWrapping;

        const sphereGeo = new THREE.SphereGeometry(radius, 20, 20); //using defaults for the rest of the constructor
        const sphereMat = new THREE.MeshPhongMaterial ({map: grapeTex});
        const grape = new THREE.Mesh (sphereGeo, sphereMat);

        grape.scale.z = 1.2;
        grape.scale.x = grape.scale.y = .8;

        const grapeGroup = new THREE.Group();
        grapeGroup.add (grape);  // place the torus in the group

        return grapeGroup;   // the constructor must return the entire group
    }
}
