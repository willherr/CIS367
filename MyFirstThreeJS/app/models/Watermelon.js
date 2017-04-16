/**
 * Created by willherr on 4/13/2017.
 */
class Watermelon {
    constructor (radius, objectName) { // orange radius
        const watermelonTex = new THREE.TextureLoader().load("textures/watermelon_fruit.jpg")
        watermelonTex.repeat.set(4, 4);
        watermelonTex.wrapS = THREE.MirroredRepeatWrapping;
        watermelonTex.wrapT = THREE.MirroredRepeatWrapping;

        const sphereGeo = new THREE.SphereGeometry(radius, 25, 25); //using defaults for the rest of the constructor
        const sphereMat = new THREE.MeshPhongMaterial ({map: watermelonTex});
        const watermelon = new THREE.Mesh (sphereGeo, sphereMat);

        watermelon.scale.y = 1.2;

        const watermelonGroup = new THREE.Group();
        watermelonGroup.add (watermelon);

        return watermelonGroup;
    }
}
