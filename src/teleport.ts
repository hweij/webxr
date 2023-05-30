import * as THREE from 'three';
import { Mesh, Object3D, Scene, Vector3 } from 'three';

export class Teleport {
  _marker: Mesh;

  constructor(scene: Scene) {
    // Create the teleport target marker
    this._marker = createMarkerMesh();
    scene.add(this._marker);
  }

  /** Call this to detect and teleport based on the thumb stick position (push forward) */
  teleportOnThumb(thumbY: number, target: Vector3, intersects: THREE.Intersection[], controller: Object3D) {
    let rayLength = 10;

    // Ray intersect from right controller
    const rPos = controller.getWorldPosition(new Vector3());
    const rDir = controller.getWorldDirection(new Vector3());

    // Goody: turn ray such that it's top stays at the top
    // controller.getWorldPosition(this._ray.position);
    // const mm = new Matrix4();
    // mm.lookAt(new Vector3(), rDir, new Vector3(0,1,0));
    // const q = new Quaternion().setFromRotationMatrix(mm);
    // this._ray.setRotationFromQuaternion(q);

    // Reverse direction, apparently it points the opposite way
    rDir.multiplyScalar(-1);

    if (thumbY < -0.5) {
      if (intersects.length) {
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
            rayLength = p.distanceTo(rPos);
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
        // this._rayMaterial.opacity = OPACITY_INACTIVE;
      }
    }
    // this._ray.scale.z = rayLength;
  }

  // _createRayMesh() {
  //   const S = 1;
  //   const W = 0.005;
  //   const Z = 0.0;
  //   const geometry = new THREE.BufferGeometry();
  //   const vertices = new Float32Array( [
  //     -W, Z, S,
  //      W, Z, S,
  //      W, Z, 0,
  //      W, Z, 0,
  //     -W, Z, 0,
  //     -W, Z, S
  //   ] );
  
  //   geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  //   this._rayMaterial = new THREE.MeshBasicMaterial( { color: 0xcccccc, side: DoubleSide, transparent: true, opacity: 0.5 } );
  //   return new THREE.Mesh( geometry, this._rayMaterial );
  // }
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
  const material = new THREE.MeshBasicMaterial( { color: 0xcccccc } );
  return new THREE.Mesh( geometry, material );
}