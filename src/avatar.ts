import * as THREE from "three";

import { GameContext, GameObject3D } from "./game_frame";

export class Avatar extends GameObject3D {
    /** Controller associated with the left hand */
    leftHand: THREE.Group;
    /** Controller associated with the right hand */
    rightHand: THREE.Group;
    /** Innertia group */
    controllerInertia: THREE.Group;
    /** Avatar camera */
    camera: THREE.PerspectiveCamera;

    pivotMaterial!: THREE.MeshStandardMaterial;

    constructor() {
        super(new THREE.Group());

        const defaultControllerTool = this.createControllerMesh();

        this.leftHand = new THREE.Group();
        this.leftHand.add(defaultControllerTool.clone());
        this.node.add(this.leftHand);

        this.rightHand = new THREE.Group();
        this.rightHand.add(defaultControllerTool.clone());
        this.node.add(this.rightHand);

        // Add ray to controller
        const rayMesh = this.createRayMesh();
        this.rightHand.add(rayMesh);
        
        this.controllerInertia = new THREE.Group();
        this.node.add(this.controllerInertia);

        /** Camera */
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
        // Initialize at 1.8m height (only for non-VR)
        this.camera.position.set(0, 1.8, 1);
        this.node.add(this.camera);
    }

    grab (obj: GameObject3D) {
        this.controllerInertia.attach(obj.node);
    }

    override tick(context: GameContext) {
        // Controller inertia
        const tLerp = context.dt * 10;
        this.controllerInertia.position.lerp(this.rightHand.position, tLerp);
        this.controllerInertia.quaternion.slerp(this.rightHand.quaternion, tLerp);
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

      createRayMesh() {
        const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xccccff, transparent: true, opacity: 0.5 });
        const rayGeo = new THREE.CylinderGeometry(0.003, 0.003, 10.0, 8, 1, true);
        rayGeo.translate(0, 5.0, 0);
        rayGeo.rotateX(-Math.PI * 0.5);
      
        return new THREE.Mesh(rayGeo, rayMaterial);
      }
}
