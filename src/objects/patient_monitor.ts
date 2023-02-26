import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { GameObject } from "../game_object";

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
            const geo = new BoxGeometry(SCREEN_WIDTH + (BEZEL_WIDTH * 2), SCREEN_HEIGHT + (BEZEL_WIDTH * 2), 0.08);
            geo.translate(0, 0, -0.042);
            const mat = new MeshBasicMaterial({color: '#cccccc'});
            const casing = new Mesh(geo, mat);
            this.group.add(casing);
        }
    }

    tick(_dt: number) {
    }

    get mesh() {
        return this.group;
    }
}
