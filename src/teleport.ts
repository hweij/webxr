import * as THREE from 'three';
import { Group, Mesh, PerspectiveCamera, Scene, Vector3, XRTargetRaySpace } from 'three';

export class Teleport {
  _raycaster = new THREE.Raycaster();
  _teleportMarker: Mesh;
  _rayMesh: Mesh;

  constructor(scene: Scene, camera: PerspectiveCamera, rayBase: Group) {
    const rayLength = 10.0;
    const teleportMarkerGeo = new THREE.SphereGeometry(0.1);
    const teleportMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff
    });
    this._teleportMarker = new THREE.Mesh(teleportMarkerGeo, teleportMaterial);
    scene.add(this._teleportMarker);

    const rayMeshGeo = new THREE.CylinderGeometry(0.005, 0.005, rayLength);
    const rayMeshMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc
    });
    this._rayMesh = new THREE.Mesh(rayMeshGeo, rayMeshMaterial);
    this._rayMesh.rotateX(Math.PI / 2);
    this._rayMesh.translateY(-rayLength * 0.5);
    this._rayMesh.visible = false;
    rayBase.add(this._rayMesh);

    this._raycaster.camera = camera;
    this._raycaster.near = camera.near;
    this._raycaster.far = camera.far;
  }

  teleportOnThumb(thumbY: number, target: Vector3, physicalWorld: Group, controller: XRTargetRaySpace) {
    if (thumbY < -0.5) {
      this._rayMesh.visible = true;
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
      if (thumbY > -0.1) {
        if (this._teleportMarker.visible) {
          this._teleportMarker.getWorldPosition(target);
          this._teleportMarker.visible = false;
        }
        this._rayMesh.visible = false;
      }
    }
  }
}
