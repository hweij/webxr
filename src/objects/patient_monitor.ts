import { Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, Texture } from "three";
import { ChangeDetect, createBezelGeometry } from "../util";
import { GameObject3D } from "../game_object_3d";
import { WaveCanvas } from "../wave_canvas/wave_canvas";

import * as appContext from "../app_context";

const SCREEN_WIDTH = 0.49;
const SCREEN_HEIGHT = 0.274;
const BEZEL_WIDTH = 0.02;
const WAVE_HEIGHT = 80;

const colors = ["red", "green", "blue", "yellow", "white", "cyan", "magenta"];

export class PatientMonitor extends GameObject3D {
    screen: Mesh;
    _waveCanvas: WaveCanvas[];
    _t = 0;
    _texWave: Texture;
    _change = new ChangeDetect();
    mat: Material;

    _testSampleIndex = 0;

    constructor() {
        super(new Group());

        const canvas = document.createElement("canvas");
        canvas.width = 1920;
        canvas.height = 1080;
        this._texWave =  new Texture(canvas);

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.font = "200 80px roboto";
            ctx.fillStyle = "#ff00ff";
            ctx.fillText("98", 1800, 100, 100);
            ctx.fillText("70", 1800, 180, 100);
            ctx.fillText("33", 1800, 260, 100);
        }

        this._waveCanvas = new Array(8);
        for (let i=0; i<8; i++) {
            this._waveCanvas[i] = new WaveCanvas(canvas, {
                offsetX: 20, offsetY: i * WAVE_HEIGHT + 20, width: 1760, height: WAVE_HEIGHT,
                color: colors[i % colors.length],
                gapWidth: 20, lineWidth: 2, pixPerSecond: 100});
        }

        {   // Screen
            const geo = new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 1, 1);

            this.mat = new MeshBasicMaterial({map: this._texWave});
            this.screen = new Mesh(geo, this.mat);
            this._node.add(this.screen);
        }
        {   // Casing
            const bezelGeo = createBezelGeometry(SCREEN_WIDTH + (2 * BEZEL_WIDTH), SCREEN_HEIGHT + (2 * BEZEL_WIDTH), 0.08, BEZEL_WIDTH);
            bezelGeo.translate(0, 0, -0.035);
            const bezel = new Mesh(bezelGeo, new MeshLambertMaterial({color: '#eeddcc'}));
            this._node.add(bezel);
        }

        this.rayHandler = () => { this._change.trigger(); };
    }

    override tick(dt: number): void {
        super.tick(dt);

        this._t += dt;
        for (let i=0; i<this._waveCanvas.length; i++) {
            let v: number | null = null;
            if (appContext.wfdbData) {
                const signals = appContext.wfdbData.signals;
                const samples = signals[i % signals.length];
                v = samples[this._testSampleIndex % samples.length] * 70;
            }
            if (this._waveCanvas[i].putSample(this._t, WAVE_HEIGHT - ((v !== null) ? v : dummySignalFunction(this._t, i)))) {
                this._texWave.needsUpdate = true;
            }
        }
        this._testSampleIndex++;
        switch (this._change.check()) {
            case 1:
                this._node.scale.set(1.1, 1.1, 1.1);
                break;
            case -1:
                this._node.scale.set(1, 1, 1);
                break;
        }
    }
}

function dummySignalFunction(t: number, row: number) {
    const v = (Math.sin(t * 6 + row) + 1) * 0.5;
    return (v * v * v)  * 70 + 5;
}
