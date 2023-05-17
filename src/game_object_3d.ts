import { Object3D } from "three";

import { GameObject } from "./game_object";

/**
 * Wraps a (three) 3D object.
 * 
 * This class is used to wrap (larger) objects and present a clean and uniform interface.
 */
export class GameObject3D implements GameObject {
    _parent: GameObject3D | null = null;
    _children: GameObject3D[] = [];
    _object3D: Object3D | null = null;

    get object3D() {
        return this._object3D;
    }

    addChild(c: GameObject3D) {
        const cp = c._parent;
        if (cp && (cp != this)) {
            // Remove from old parent
            cp.removeChild(c);
        }
        if (cp != this) {
            this._children.push(c);
            // Update three
            if (c._object3D) {
                this._object3D?.add(c._object3D);
                c._object3D.userData.gameObject3D = this;
            }
        }
    }
    removeChild(c: GameObject3D) {
        if (c._parent == this) {
            const idx = this._children.indexOf(c);
            this._children.splice(idx, 1);
            // update three
            if (c._object3D) {
                this._object3D?.remove(c._object3D);
                delete c._object3D.userData.gameObject3D;
            }
            c._parent = null;
        }
    }

    // Interface GameObject
    tick(_dt: number) {
        // Override this in subclass
    }

    /** Cleans up resources, if needed. */
    dispose() {
        // Override this in subclass
    }
}
