import * as THREE from 'three';
import { Group, Mesh, PerspectiveCamera, Scene, Vector3, XRTargetRaySpace } from 'three';
import { GameObject } from './game_object';
import { Inputs } from './inputs';

export class Teleport implements GameObject {
  _controller: XRTargetRaySpace;
  _raycaster = new THREE.Raycaster();
  _camera: PerspectiveCamera;
  _inputs: Inputs;
  _teleportMarker: Mesh;
  _physicalWorld: Group;

  constructor(scene: Scene, physicalWorld: Group, inputs: Inputs, controller: XRTargetRaySpace, camera: PerspectiveCamera) {
    this._physicalWorld = physicalWorld;
    const teleportMarkerGeo = new THREE.SphereGeometry(0.1);
    const teleportMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      roughness: 1.0,
      metalness: 0.0
    });
    this._teleportMarker = new THREE.Mesh(teleportMarkerGeo, teleportMaterial);
    scene.add(this._teleportMarker);

    this._inputs = inputs;

    this._controller = controller;
    this._camera = camera;
    this._raycaster.camera = camera;
    this._raycaster.near = camera.near;
    this._raycaster.far = camera.far;
  }

  tick(_dt: number) {
    this.checkTeleport();
  }

  checkTeleport() {
    if (this._inputs.right.thumb.y < -0.5) {
      // Ray intersect from right controller
      const rPos = new Vector3();
      const rDir = new Vector3();
      this._controller.getWorldPosition(rPos);
      this._controller.getWorldDirection(rDir);
      // Reverse direction, apparently it points the opposite way
      rDir.multiplyScalar(-1);
      this._raycaster.set(rPos, rDir);
      const intersects = this._raycaster.intersectObjects(this._physicalWorld.children);
      if (intersects?.length) {
        const p = intersects[0].point;
        this._teleportMarker.position.set(p.x, p.y, p.z);
        this._teleportMarker.visible = true;
      }
      else {
        this._teleportMarker.visible = false;
      }
    }
    else {
      if (this._teleportMarker.visible && (this._inputs.right.thumb.y > -0.1)) {
        this.teleport();
        this._teleportMarker.visible = false;
      }
    }
  }

  teleport() {
    if (this._teleportMarker.visible) {
      const avatar = this._camera.parent;
      if (avatar) {
        this._teleportMarker.getWorldPosition(avatar.position);
      }
    }
  }
}
