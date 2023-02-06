import * as THREE from 'three';
import { DoubleSide, Euler, Group, Mesh, Scene, Vector3, XRTargetRaySpace } from 'three';

export class Teleport {
  _raycaster = new THREE.Raycaster();
  _marker: Mesh;
  _ray: Mesh;

  constructor(scene: Scene) {
    this._ray = createRayMesh();
    this._ray.visible = false;
    scene.add(this._ray);

    // Create the teleport target marker
    this._marker = createMarkerMesh();
    scene.add(this._marker);

    // Ray caster init
    this._raycaster.near = 0.1;
    this._raycaster.far = 10.0;
  }

  /** Call this to detect and teleport based on the thumb stick position (push forward) */
  teleportOnThumb(thumbY: number, target: Vector3, physicalWorld: Group, controller: XRTargetRaySpace) {
    if (thumbY < -0.5) {
      this._ray.visible = true;
      controller.getWorldPosition(this._ray.position);
      // Ray intersect from right controller
      const rPos = controller.getWorldPosition(new Vector3());
      const rDir = controller.getWorldDirection(new Vector3());
      this._ray.setRotationFromEuler(new Euler(controller.rotation.x, controller.rotation.y, 0));
      // Reverse direction, apparently it points the opposite way
      rDir.multiplyScalar(-1);
      this._raycaster.set(rPos, rDir);
      const intersects = this._raycaster.intersectObjects(physicalWorld.children);
      if (intersects?.length) {
        const intersect = intersects[0];
        if (intersect.face) {
          // This can be optimized later
          const nv = intersect.face.normal;
          var normalMatrix = new THREE.Matrix3(); // create once and reuse
          var worldNormal = new THREE.Vector3(); // create once and reuse
          normalMatrix.getNormalMatrix( intersect.object.matrixWorld );
          worldNormal.copy( nv ).applyMatrix3( normalMatrix );
          if (worldNormal.angleTo(new Vector3(0, 1, 0)) < 0.4) {
            const p = intersect.point;
            this._marker.position.set(p.x, p.y, p.z);
            this._marker.visible = true;
          }
          else {
            this._marker.visible = false;
          }
        }
      }
      else {
        this._marker.visible = false;
      }
    }
    else {
      if (thumbY > -0.1) {
        if (this._marker.visible) {
          this._marker.getWorldPosition(target);
          this._marker.visible = false;
        }
        this._ray.visible = false;
      }
    }
  }
}

function createRayMesh() {
  /** Length of the cross "legs" */
  const S = -10;
  const W = 0.02;
  const Z = 0.0;
  const geometry = new THREE.BufferGeometry();
  // X marks the spot
  const vertices = new Float32Array( [
    -W, Z, S,
     W, Z, S,
     W, Z, 0,
     W, Z, 0,
    -W, Z, 0,
    -W, Z, S
  ] );

  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  const material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: DoubleSide } );
  return new THREE.Mesh( geometry, material );
}

function createMarkerMesh() {
  /** Length of the cross "legs" */
  const S = 0.1;
  const W = 0.02;
  const Z = 0.01;
  const geometry = new THREE.BufferGeometry();
  // X marks the spot
  const vertices = new Float32Array( [
    // Horizontal
    -S, Z,  W,
     S, Z,  W,
     S, Z, -W,
     S, Z, -W,
    -S, Z, -W,
    -S, Z,  W,
    // Vertical
    -W, Z,  S,
     W, Z,  S,
     W, Z, -S,
     W, Z, -S,
    -W, Z, -S,
    -W, Z,  S
  ] );

  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
  return new THREE.Mesh( geometry, material );
}
