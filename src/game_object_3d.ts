import { Object3D } from "three";

import { GameObject } from "./game_object";

type InteractionsType = {
    grab?: boolean;
}

/**
 * Wraps a (three) 3D object.
 * 
 * This class is used to wrap (larger) objects and present a clean and uniform interface.
 */
export class GameObject3D implements GameObject {
    _parent: GameObject3D | null = null;
    _children: GameObject3D[] = [];
    /** Internal 3D object node, MUST be set in subclass */
    _node!: Object3D;

    interactions: InteractionsType = {};

    constructor(node: Object3D) {
        this._node = node;
        node.userData.gameObject3D = this;
    }

    get node() {
        return this._node;
    }

    /** Called when the raycaster first hits the object. */
    onRayEnter() {
        // Override in subclass
    }

    /** Called when the raycaster no longer hits the object. */
    onRayExit() {
        // Override in subclass
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
            this._node.add(c._node);
            // c._node.userData.gameObject3D = this;
        }
    }
    removeChild(c: GameObject3D) {
        if (c._parent == this) {
            const idx = this._children.indexOf(c);
            this._children.splice(idx, 1);
            // update three
            this._node.remove(c._node);
            // delete c._node.userData.gameObject3D;
            c._parent = null;
        }
    }

    // Interface GameObject
    tick(dt: number) {
        for (const c of this._children) {
            c.tick(dt);
        }
    }

    /** Cleans up resources, if needed. */
    dispose() {
        // Override this in subclass
    }
}
