import * as THREE from 'three';
import { Group, Mesh, PerspectiveCamera, Scene, Vector3, XRTargetRaySpace } from 'three';

export class Teleport {
  _raycaster = new THREE.Raycaster();
  _teleportMarker: Mesh;

  constructor(scene: Scene, camera: PerspectiveCamera) {
    const teleportMarkerGeo = new THREE.SphereGeometry(0.1);
    const teleportMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    });
    this._teleportMarker = new THREE.Mesh(teleportMarkerGeo, teleportMaterial);
    scene.add(this._teleportMarker);

    this._raycaster.camera = camera;
    this._raycaster.near = camera.near;
    this._raycaster.far = camera.far;
  }

  teleportOnThumb(thumbY: number, target: Vector3, physicalWorld: Group, controller: XRTargetRaySpace) {
    if (thumbY < -0.5) {
      // Ray intersect from right controller
      const rPos = new Vector3();
      const rDir = new Vector3();
      controller.getWorldPosition(rPos);
      controller.getWorldDirection(rDir);
      // Reverse direction, apparently it points the opposite way
      rDir.multiplyScalar(-1);
      this._raycaster.set(rPos, rDir);
      const intersects = this._raycaster.intersectObjects(physicalWorld.children);
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
      if (this._teleportMarker.visible && (thumbY > -0.1)) {
        this._teleportMarker.getWorldPosition(target);
        this._teleportMarker.visible = false;
      }
    }
  }
}
