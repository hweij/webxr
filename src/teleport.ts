import * as THREE from 'three';
import { Mesh, Object3D, Scene, Vector3 } from 'three';
import { GameContext, GameObject } from './game_object';

export class Teleport implements GameObject {
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

    // Goody: turn ray such that its top stays at the top
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
        // Only teleport to surfaces that have the "teleport" userData property
        if (intersect.face && intersect.object.userData.teleport) {
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

  tick(context: GameContext) {
    this._marker.rotateY(context.dt);
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

/** Marks the teleport target */
function createMarkerMesh() {
  // Cone radius
  const R = 0.1;
  // Cone height
  const H = 0.20;
  const geometry = new THREE.ConeGeometry(R, H, 16, 2, true);
  geometry.rotateX(Math.PI);
  geometry.translate(0, H / 2, 0);

  // Texture
  const segments = 8;
  const data = new Uint8Array(4 * segments);
  for (let i = 0; i < segments; i++) {
    const c = (i % 2) * 255;
    const stride = i * 4;
    data[stride] = c;
    data[stride + 1] = c;
    data[stride + 2] = c;
    data[stride + 3] = 128;
  }

  // used the buffer to create a DataTexture
  const texture = new THREE.DataTexture(data, segments, 1);
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, map: texture, transparent: true, side: THREE.DoubleSide });
  return new THREE.Mesh(geometry, material);
}