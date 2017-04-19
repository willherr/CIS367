/**
 * Created by User on 4/18/2017.
 */
/**
 * Created by willherr on 4/13/2017.
 */
class Lemon {
    constructor (radius) { // orange radius
        const lemonTex = new THREE.TextureLoader().load("textures/lemon_texture.jpg");
        //lemonTex.repeat.set(2,2);
        lemonTex.wrapS = THREE.RepeatWrapping;
        lemonTex.wrapT = THREE.RepeatWrapping;

        const sphereGeo = new THREE.SphereGeometry(radius, 20, 20); //using defaults for the rest of the constructor
        const sphereMat = new THREE.MeshPhongMaterial ({map: lemonTex});
        const lemon = new THREE.Mesh (sphereGeo, sphereMat);

        lemon.scale.z = 1.2;
        lemon.scale.x = lemon.scale.y = .8;

        const lemonGroup = new THREE.Group();
        lemonGroup.add (lemon);

        return lemonGroup;
    }
}
