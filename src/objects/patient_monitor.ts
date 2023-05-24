import { Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, Texture } from "three";
import { createBezelGeometry } from "../util";
import { GameObject3D } from "../game_object_3d";
import { WaveCanvas } from "../wave_canvas/wave_canvas";

const SCREEN_WIDTH = 0.49;
const SCREEN_HEIGHT = 0.274;
const BEZEL_WIDTH = 0.02;

export class PatientMonitor extends GameObject3D {
    screen: Mesh;
    _waveCanvas: WaveCanvas;
    _t = 0;
    _tex: Texture;

    constructor() {
        super();
        this._node = new Group();

        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;
        this._waveCanvas = new WaveCanvas(canvas, {offsetX: 20, offsetY: 20, width: 600, height: 80, color: "red", gapWidth: 20, lineWidth: 2, pixPerSecond: 40});
        this._tex =  new Texture(this._waveCanvas.canvas);

        {   // Screen
            const geo = new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 1, 1);
            const mat = new MeshBasicMaterial({map: this._tex});
            this.screen = new Mesh(geo, mat);
            this._node.add(this.screen);
        }
        {   // Casing
            const bezelGeo = createBezelGeometry(SCREEN_WIDTH + (2 * BEZEL_WIDTH), SCREEN_HEIGHT + (2 * BEZEL_WIDTH), 0.08, BEZEL_WIDTH);
            bezelGeo.translate(0, 0, -0.035);
            const bezel = new Mesh(bezelGeo, new MeshLambertMaterial({color: '#eeddcc'}));
            this._node.add(bezel);
        }
    }

    override tick(dt: number): void {
        super.tick(dt);
        this._t += dt;
        if (this._waveCanvas.putSample(this._t, signalFunction(this._t))) {
            this._tex.needsUpdate = true;
        }
    }
}

function signalFunction(t: number) {
    const amp = 30;
    const mid = 40;
    const v = Math.sin(t * 2);
    return (v * v * v) * amp + mid;
}
