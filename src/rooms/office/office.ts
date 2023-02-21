import * as THREE from 'three';
import { Vector3 } from 'three';

import { GameObject } from "../../game_object";
import { WallClock } from '../../objects/wall_clock';
import { createWall } from '../util';
import { Desk } from './desk';

const WIDTH = 6;
const DEPTH = 4;
const HEIGHT = 2.4;

/** Outside wall default material */
const matOutside = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.FrontSide });
/** Inside wall, default material */
const matInside = new THREE.MeshLambertMaterial({ color: 0xeeddcc, side: THREE.FrontSide });

// const boxGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
// boxGeo.translate(0, HEIGHT / 2, 0);
// const referenceMaterial = new THREE.MeshBasicMaterial({
//     color: 0xff00ff,
//     wireframe: true
// });

export class Office implements GameObject {
    group = new THREE.Group;
    clock: WallClock;

    constructor() {
        // const boxMesh = new THREE.Mesh(boxGeo, referenceMaterial);
        // this.group.add(boxMesh);

        const desk = new Desk();
        desk.setParent(this.group);

        this.clock = new WallClock();
        this.clock.mesh.position.set(0, 2, -1.99);
        this.group.add(this.clock.mesh);

        this._createWalls();

        // this.textureTest();
    }

    tick(_dt: number) {
        this.clock.tick(_dt);
    }

    setParent(p: THREE.Group | THREE.Scene) {
        p.add(this.group);
    }

    _createWalls() {
        // Front
        this.group.add(createWall([
            0, 0, 0, HEIGHT, WIDTH, HEIGHT, WIDTH, 0,
            1.9, 0, 1.9, 2, 1, 2, 1, 0],
            [[3, 1, 4, 1, 4, 2, 3, 2]],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0, DEPTH / 2)));
        // Back
        this.group.add(createWall([
            0, 0, 0, HEIGHT, WIDTH, HEIGHT, WIDTH, 0],
            [[3, 1, 4, 1, 4, 2, 3, 2]],
            matOutside, matInside,
            new Vector3(WIDTH / 2, 0, -DEPTH / 2),
            new Vector3(0, 180, 0)));
        // Left
        this.group.add(createWall([
            0, 0, 0, HEIGHT, DEPTH, HEIGHT, DEPTH, 0],
            [[1, 1, 2, 1, 2, 2, 1, 2]],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0, -DEPTH / 2),
            new Vector3(0, -90, 0)));
        // Right
        this.group.add(createWall([
            0, 0, 0, HEIGHT, DEPTH, HEIGHT, DEPTH, 0],
            [[1, 1, 2, 1, 2, 2, 1, 2]],
            matOutside, matInside,
            new Vector3(WIDTH / 2, 0, DEPTH / 2),
            new Vector3(0, 90, 0)));
        // Roof
        this.group.add(createWall([
            0, 0, 0, DEPTH, WIDTH, DEPTH, WIDTH, 0],
            [],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, HEIGHT, DEPTH / 2),
            new Vector3(-90, 0, 0)));
        // Floor
        this.group.add(createWall([
            0, 0, 0, DEPTH, WIDTH, DEPTH, WIDTH, 0],
            [],
            matOutside, matInside,
            new Vector3(-WIDTH / 2, 0.01, -DEPTH / 2),
            new Vector3(90, 0, 0)));
    }

    textureTest() {
        const loader = new THREE.TextureLoader();

        // load a resource
        loader.load(
            // resource URL
            '/textures/shopping_mall.jpg',
        
            // onLoad callback
            function ( texture ) {
                // in this example we create the material when the texture is loaded
                matInside.map = texture;
                matInside.needsUpdate = true;
           },
        
            // onProgress callback currently not supported
            undefined,
        
            // onError callback
            function ( _err ) {
                console.error( 'An error happened.' );
            }
        );}
}
