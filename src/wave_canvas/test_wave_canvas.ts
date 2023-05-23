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
    let t = 0;

    const waveCanvasList: WaveCanvas[] = new Array(canvasList.length);
    for (let i=0; i<canvasList.length; i++) {
        waveCanvasList[i] = new WaveCanvas(canvasList[i], lineWidth, colors[i % colors.length]);
        waveCanvasList[i].moveTo(0,signalFunction(t, i));
    }

    let timer = 0;

    const tick = () => {
        const tNext = performance.now();
        const dt = tNext - tAbs;
        tAbs = tNext;
        const dx = dt / pixPerSecond;
        t += dx;
        for (let i=0; i<waveCanvasList.length; i++) {
            const wc = waveCanvasList[i];
            wc.putSample(dx, signalFunction(t, i)); 
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
