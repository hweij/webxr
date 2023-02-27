import { Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry } from "three";
import { GameObject } from "../game_object";
import { createBezelGeometry } from "../util";

const SCREEN_WIDTH = 0.49;
const SCREEN_HEIGHT = 0.274;
const BEZEL_WIDTH = 0.02;

export class PatientMonitor implements GameObject {
    group: Group;
    screen: Mesh;

    constructor() {
        this.group = new Group();
        {   // Screen
            const geo = new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 1, 1);
            const mat = new MeshBasicMaterial({color: '#000000'});
            this.screen = new Mesh(geo, mat);
            this.group.add(this.screen);
        }
        {   // Casing
            const bezelGeo = createBezelGeometry(SCREEN_WIDTH + (2 * BEZEL_WIDTH), SCREEN_HEIGHT + (2 * BEZEL_WIDTH), 0.08, BEZEL_WIDTH);
            bezelGeo.translate(0, 0, -0.035);
            const bezel = new Mesh(bezelGeo, new MeshLambertMaterial({color: '#eeddcc'}));
            this.group.add(bezel);
        }
    }

    tick(_dt: number) {
    }

    get mesh() {
        return this.group;
    }
}
