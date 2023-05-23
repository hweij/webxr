import { WaveCanvas } from "./wave_canvas";

const lineWidth = 2;
const colors = ["red", "green", "blue", "yellow", "white", "cyan", "magenta"];
const pixPerSecond = 25;

const canvasList = document.body.querySelectorAll("canvas");
if (canvasList && canvasList.length) {
    // Set black background
    for (const c of canvasList) {
        c.style.backgroundColor = "black";
    }
    let tAbs = performance.now();
    let x: number[];
    let t = 0;

    const waveCanvasList: WaveCanvas[] = new Array(canvasList.length);
    x = new Array(canvasList.length);
    for (let i=0; i<canvasList.length; i++) {
        x[i] = 0;
        waveCanvasList[i] = new WaveCanvas(canvasList[i], lineWidth, colors[i % colors.length]);
        waveCanvasList[i].moveTo(x[i],signalFunction(t, i));
    }

    let timer = 0;

    const tick = () => {
        const tNext = performance.now();
        const dt = tNext - tAbs;
        tAbs = tNext;
        const dx = dt / pixPerSecond;
        t += dx;
        for (let i=0; i<waveCanvasList.length; i++) {
            const xi = x[i];
            const newX =  (xi + dx) % canvasList[i].width;
            if (newX < xi) {
                waveCanvasList[i].moveTo(newX, signalFunction(t, i));
            }
            else {
                waveCanvasList[i].lineTo(newX, signalFunction(t, i));
            }
            x[i] = newX;    
        }
        // console.log("Ex speed = " + (performance.now() - tNext).toFixed(2));
    }

    timer = window.setInterval(tick, 16);
}

function signalFunction(x: number, rowIndex: number) {
    const mid = canvasList[rowIndex]!.height / 2;
    const amp = mid - (lineWidth / 2)
    const v = Math.sin(x * 0.1 + rowIndex);
    return (v * v * v) * amp + mid;
}
