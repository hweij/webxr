import * as THREE from 'three';
import { Object3D, Vector3 } from 'three';
import { GameObject3D } from './game_frame';

export class RaycastHelper {
    // Raycaster, reused by all instances
    _rc = new THREE.Raycaster(undefined, undefined, 0.1, 10.0);
    _rPos = new Vector3();
    _rDir = new Vector3();

    getIntersections(objects: Object3D[], obj: Object3D) {
        obj.getWorldPosition(this._rPos);
        obj.getWorldDirection(this._rDir);
        // Reverse direction, apparently it points the opposite way
        this._rDir.multiplyScalar(-1);
        this._rc.set(this._rPos, this._rDir);
        const intersects = this._rc.intersectObjects(objects);
        return intersects;
    }

    getMouseIntersections(objects: Object3D[], camera: THREE.Camera, x: number, y: number) {
        this._rc.setFromCamera( {x, y}, camera );
        const intersects = this._rc.intersectObjects( objects );
        return intersects;
    }

    findGameObject(intersections: THREE.Intersection[]) {
        if (intersections.length) {
            const intersection = intersections[0];
            let node: Object3D | null = intersection.object;
            // Check node and parents to see if associated with a game object
            while (node) {
                const obj = node.userData['gameObject3D'] as GameObject3D;
                if (obj) {
                    return obj;
                }
                node = node.parent;
            }
        }
        return null;
    }
}
