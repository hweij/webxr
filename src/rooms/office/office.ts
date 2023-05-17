import * as THREE from 'three';
import { Vector3 } from 'three';

import { PatientMonitor } from '../../objects/patient_monitor';
import { WallClock } from '../../objects/wall_clock';
import { createWall } from '../util';
import { Desk } from './desk';
import { GameObject3D } from '../../game_object_3d';

const WIDTH = 6;
const DEPTH = 4;
const HEIGHT = 2.4;

/** Outside wall default material */
const matOutside = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.FrontSide });
/** Inside wall, default material */
const matInside = new THREE.MeshLambertMaterial({ color: 0xdddddd, side: THREE.FrontSide });

export class Office extends GameObject3D {
    clock: WallClock;
    patientMonitor: PatientMonitor;

    constructor() {
        super();
        this._node = new THREE.Group();
        const desk = new Desk();
        desk.mesh.position.set(1.5, 0, -0.9);
        this._node.add(desk.mesh);

        this.clock = new WallClock();
        this.clock.node!.position.set(1, 2, -1.99);
        this.addChild(this.clock);

        this.patientMonitor = new PatientMonitor();
        this.patientMonitor.node?.position.set(1.6, 1.0, -0.9);
        this.addChild(this.patientMonitor);

        this._createWalls();
    }

    _createWalls() {
        const obj = this._node!;
        // Front
        obj.add(createWall([
            0, 0, 0, HEIGHT, WIDTH, HEIGHT, WIDTH, 0,
            1.9, 0, 1.9, 2, 1, 2, 1, 0],
            [[3, 1, 4, 1, 4, 2, 3, 2]],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0, DEPTH / 2)));
        // Back
        obj.add(createWall([
            0, 0, 0, HEIGHT, WIDTH, HEIGHT, WIDTH, 0],
            [[3, 1, 4, 1, 4, 2, 3, 2]],
            matOutside, matInside,
            new Vector3(WIDTH / 2, 0, -DEPTH / 2),
            new Vector3(0, 180, 0)));
        // Left
        obj.add(createWall([
            0, 0, 0, HEIGHT, DEPTH, HEIGHT, DEPTH, 0],
            [[1, 1, 2, 1, 2, 2, 1, 2]],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0, -DEPTH / 2),
            new Vector3(0, -90, 0)));
        // Right
        obj.add(createWall([
            0, 0, 0, HEIGHT, DEPTH, HEIGHT, DEPTH, 0],
            [[1, 1, 2, 1, 2, 2, 1, 2]],
            matOutside, matInside,
            new Vector3(WIDTH / 2, 0, DEPTH / 2),
            new Vector3(0, 90, 0)));
        // Roof
        const roof = createWall([
            0, 0, 0, DEPTH, WIDTH, DEPTH, WIDTH, 0],
            [],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, HEIGHT, DEPTH / 2),
            new Vector3(-90, 0, 0));
        obj.add(roof);
        // Floor
        const floor = createWall([
            0, 0, 0, DEPTH, WIDTH, DEPTH, WIDTH, 0],
            [],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0.00, -DEPTH / 2),
            new Vector3(90, 0, 0));
        obj.add(floor);
    }

    // textureTest() {
    //     const loader = new THREE.TextureLoader();

    //     // load a resource
    //     loader.load(
    //         // resource URL
    //         '/textures/shopping_mall.jpg',
        
    //         // onLoad callback
    //         function ( texture ) {
    //             // in this example we create the material when the texture is loaded
    //             matInside.map = texture;
    //             matInside.needsUpdate = true;
    //        },
        
    //         // onProgress callback currently not supported
    //         undefined,
        
    //         // onError callback
    //         function ( _err ) {
    //             console.error( 'An error happened.' );
    //         }
    //     );}
}
