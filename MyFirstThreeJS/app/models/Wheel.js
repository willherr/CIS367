class Wheel {
    constructor (numSpokes) { // number of spokes on the wheel
        const WHEEL_RADIUS = 200;
        const TIRE_THICKNESS = 20;
        const tubeGeo = new THREE.TorusGeometry (WHEEL_RADIUS, TIRE_THICKNESS, 6, 30);
        const tubeMat = new THREE.MeshPhongMaterial ({color: 0x82332a});
        const tube = new THREE.Mesh (tubeGeo, tubeMat);

        const wheelGroup = new THREE.Group();
        wheelGroup.add (tube);  // place the torus in the group

        for (let k = 0; k < numSpokes; k++) {
            const spGeo = new THREE.CylinderGeometry (0.7 * TIRE_THICKNESS, 0.7 * TIRE_THICKNESS,
                WHEEL_RADIUS, 10, 10);
            const spMat = new THREE.MeshPhongMaterial({color: 0x001199});
            const sp = new THREE.Mesh (spGeo, spMat);
            sp.rotateZ (k * 2 * Math.PI / numSpokes);
            sp.translateY (WHEEL_RADIUS / 2);
            wheelGroup.add (sp);   // place the cylinder in the group
        }

        return wheelGroup;   // the constructor must return the entire group
    }
}
