import { BufferAttribute, BufferGeometry, Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, Texture } from "three";

import { GameObject3D } from "../../game_frame";
import { WaveCanvas } from "../../wave_canvas/wave_canvas";

import * as appContext from "../../app_context";
import { GameContext } from "../../game_frame";

// Helper
import { createFrame } from "./create_frame";

const SCREEN_WIDTH = 0.49;
const SCREEN_HEIGHT = 0.274;
const BEZEL_WIDTH = 0.02;
const WAVE_HEIGHT = 80;

const colors = ["red", "green", "blue", "yellow", "white", "cyan", "magenta"];

const bezelColor = '#eeddcc';

export class PatientMonitor extends GameObject3D {
    _screen: Mesh;
    _waveCanvas: WaveCanvas[];
    _t = 0;
    _texWave: Texture;
    _mat: Material;
    _bezelMat: MeshLambertMaterial;

    _testSampleIndex = 0;

    constructor() {
        super(new Group());

        this.interactions.grab = true;

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

            this._mat = new MeshBasicMaterial({map: this._texWave});
            this._screen = new Mesh(geo, this._mat);
            this.node.add(this._screen);
        }
        {   // Casing
            const wOut = SCREEN_WIDTH + (2 * BEZEL_WIDTH);
            const hOut = SCREEN_HEIGHT + (2 * BEZEL_WIDTH);

            const vertices = createFrame([
                [ 0.005, wOut - 0.01, hOut - 0.01],
                [ 0.0, wOut, hOut],
                [-0.035, wOut, hOut],
                [-0.04, wOut - 0.01, hOut - 0.01],
                [-0.04, SCREEN_WIDTH, SCREEN_HEIGHT],
                [0.005, SCREEN_WIDTH, SCREEN_HEIGHT],
            ]);
            const bezelGeo = new BufferGeometry();
            bezelGeo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
            bezelGeo.computeVertexNormals();
            this._bezelMat = new MeshLambertMaterial({color: bezelColor});
            const bezel = new Mesh(bezelGeo, this._bezelMat);
            this.node.add(bezel);
        
            // Backside
            const geo = new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 1, 1);
            geo.rotateX(Math.PI);
            geo.translate(0.0, 0.0, -0.035);
            const back = new Mesh(geo, this._bezelMat);
            this.node.add(back);
        }
    }

    override tick(context: GameContext): void {
        super.tick(context);

        this._t = context.t;
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
    }

    override onRayEnter(): void {
        this._bezelMat.color.set('#ff00ff');
    }

    override onRayExit(): void {
        this._bezelMat.color.set(bezelColor);
    }
}

function dummySignalFunction(t: number, row: number) {
    const v = (Math.sin(t * 6 + row) + 1) * 0.5;
    return (v * v * v)  * 70 + 5;
}
