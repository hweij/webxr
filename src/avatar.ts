import * as THREE from "three";

import { GameContext, GameObject3D } from "./game_frame";

export class Avatar extends GameObject3D {
    /** Controller associated with the right hand */
    controllerL: THREE.Group;
    /** Controller associated with the left hand */
    controllerR: THREE.Group;
    /** Innertia group */
    controllerInertia: THREE.Group;

    pivotMaterial!: THREE.MeshStandardMaterial;

    constructor() {
        super(new THREE.Group());

        const defaultControllerTool = this.createControllerMesh();

        this.controllerL = new THREE.Group();
        this.controllerL.add(defaultControllerTool.clone());
        this.node.add(this.controllerL);

        this.controllerR = new THREE.Group();
        this.controllerR.add(defaultControllerTool.clone());
        this.node.add(this.controllerR);

        this.controllerInertia = new THREE.Group();
        this.node.add(this.controllerInertia);
    }

    grab (obj: GameObject3D) {
        this.controllerInertia.attach(obj.node);
    }

    override tick(context: GameContext) {
        // Controller inertia
        const tLerp = context.dt * 10;
        this.controllerInertia.position.lerp(this.controllerR.position, tLerp);
        this.controllerInertia.quaternion.slerp(this.controllerR.quaternion, tLerp);
    }

    createControllerMesh() {
        const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
        geometry.rotateX(- Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({ flatShading: true });
      
        const mesh = new THREE.Mesh(geometry, material);
        this.pivotMaterial = new THREE.MeshStandardMaterial({ flatShading: true });
      
        const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3), this.pivotMaterial);
        pivot.name = 'pivot';
        pivot.position.z = -0.05;
        mesh.add(pivot);
      
        return mesh;
      }
}
