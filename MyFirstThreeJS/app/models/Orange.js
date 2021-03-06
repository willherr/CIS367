/**
 * Created by willherr on 4/13/2017.
 */
class Orange {
    constructor (radius) { // orange radius
        const orangeTex = new THREE.TextureLoader().load("textures/orange_texture.jpg");
        orangeTex.repeat.set(2, 2);
        orangeTex.wrapS = THREE.MirroredRepeatWrapping;
        orangeTex.wrapT = THREE.MirroredRepeatWrapping;

        const sphereGeo = new THREE.SphereGeometry(radius, 20, 20); //using defaults for the rest of the constructor
        const sphereMat = new THREE.MeshPhongMaterial ({map: orangeTex});
        const orange_fruit = new THREE.Mesh (sphereGeo, sphereMat);
        orange_fruit.scale.z = .9;

        const orangeGroup = new THREE.Group();
        orangeGroup.add (orange_fruit);

        return orangeGroup;   // the constructor must return the entire group
    }
}
