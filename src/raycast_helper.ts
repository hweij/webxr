import * as THREE from 'three';
import { Object3D, Vector3 } from 'three';
import { GameObject3D } from './game_object_3d';

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

    triggerHandlers(objList: Object3D[], controllerR: Object3D) {
        const intersections = this.getIntersections(objList, controllerR);
        if (intersections.length) {
            const intersection = intersections[0];
            let node: Object3D | null = intersection.object;
            // Check node and parents to see if associated with a game object
            while (node) {
                const obj = node.userData['gameObject3D'] as GameObject3D;
                if (obj && obj.rayHandler) {
                    obj.rayHandler();
                }
                node = node.parent;
            }
        }
    }
}