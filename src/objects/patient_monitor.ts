import { Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, Texture } from "three";
import { ChangeDetect, createBezelGeometry } from "../util";
import { GameObject3D } from "../game_object_3d";
import { WaveCanvas } from "../wave_canvas/wave_canvas";

const SCREEN_WIDTH = 0.49;
const SCREEN_HEIGHT = 0.274;
const BEZEL_WIDTH = 0.02;

const colors = ["red", "green", "blue", "yellow", "white", "cyan", "magenta"];

export class PatientMonitor extends GameObject3D {
    screen: Mesh;
    _waveCanvas: WaveCanvas[];
    _t = 0;
    _texWave: Texture;
    _texNum: Texture;
    _change = new ChangeDetect();
    mat: Material;

    constructor() {
        super(new Group());

        // Numerics canvas
        const canvasNumerics = document.createElement("canvas");
        canvasNumerics.width = 1920;
        canvasNumerics.height = 1080;
        this._texNum =  new Texture(canvasNumerics);
        // Test some numerics
        const ctx = canvasNumerics.getContext("2d")!;
        ctx.font = "200 80px roboto";
        ctx.fillStyle = "#ff00ff";
        ctx.fillText("98", 20, 100, 100);
        ctx.fillText("70", 20, 180, 100);
        ctx.fillText("33", 20, 260, 100);
        this._texNum.needsUpdate = true;

        const canvasWave = document.createElement("canvas");
        canvasWave.width = 1920;
        canvasWave.height = 1080;
        this._texWave =  new Texture(canvasWave);
        this._waveCanvas = new Array(8);
        for (let i=0; i<8; i++) {
            this._waveCanvas[i] = new WaveCanvas(canvasWave, {
                offsetX: 20, offsetY: i * 80 + 20, width: 1880, height: 80,
                color: colors[i % colors.length],
                gapWidth: 20, lineWidth: 3, pixPerSecond: 40});
        }

        {   // Screen
            const geo = new PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 1, 1);

            const matNum = new MeshBasicMaterial({map: this._texNum, alphaTest: 0.1});
            const nums = new Mesh(geo, matNum);
            nums.translateZ(0.001);
            this._node.add(nums);

            // Note: alphatest sets the thershold for the transparancy
            this.mat = new MeshBasicMaterial({map: this._texWave});
            this.screen = new Mesh(geo, this.mat);
            this._node.add(this.screen);
            // this.screen.userData.gameObject3D = this;   
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
            if (this._waveCanvas[i].putSample(this._t, signalFunction(this._t, i))) {
                this._texWave.needsUpdate = true;
            }
        }
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

function signalFunction(t: number, row: number) {
    const amp = 30;
    const mid = 40;
    const v = Math.sin(t * 2 + row);
    return (v * v * v) * amp + mid;
}
