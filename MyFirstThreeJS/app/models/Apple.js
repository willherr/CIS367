/**
 * Created by willherr on 4/13/2017.
 */
class Apple {
    constructor (scalar) { // scales apple
        const appleTex = new THREE.TextureLoader().load("textures/apple_fruit.jpg")
        //grapeTex.repeat.set(6,6);
        appleTex.wrapS = THREE.RepeatWrapping;
        appleTex.wrapT = THREE.RepeatWrapping;

        const sphereGeo = new THREE.SphereGeometry(5, 20, 20); //using defaults for the rest of the constructor
        const appleMat = new THREE.MeshPhongMaterial ({map: appleTex});
        const cylinderGeo = new THREE.CylinderGeometry(6.5, 5, 10, 20, 10);
        const appleBody = new THREE.Mesh(cylinderGeo, appleMat);
        const applePiece = new THREE.Mesh (sphereGeo, appleMat);

        applePiece.scale.z = 1.5;
        applePiece.translateZ(-2);

        appleBody.rotateX(Math.PI/2);

        const appleGroup = new THREE.Group();
        appleGroup.add(appleBody);

        const appleTops = new THREE.Group();

        const rot = Math.PI/7;
        const rotArray = [1, -1, 1, -1];
        const trans = -2;
        for (let k = 0; k < 4; k++) {
            const piece = applePiece.clone();
            let top;
            if(k < 2) {
                piece.rotateY(rotArray[k]*rot);
                top = piece.clone();
                top.translateX(rotArray[k]*trans);
                top.rotateY(rotArray[k]*rot/1.7);
            }
            else {
                piece.rotateX(rotArray[k]*rot);
                top = piece.clone();
                top.translateY(-rotArray[k]*trans);
                top.rotateX(rotArray[k]*rot/1.7);
            }
            top.translateZ(5.5);
            top.scale.x = top.scale.y = .75;
            top.scale.z = 1.3;

            appleTops.add(top);
            appleGroup.add (piece);
        }
        const tops = appleTops.clone();
        tops.rotateZ(Math.PI/4);

        appleGroup.add(tops);
        appleGroup.add(appleTops);

        appleGroup.scale.copy(new THREE.Vector3 (scalar, scalar, scalar));
        return appleGroup;   // the constructor must return the entire group
    }
}
