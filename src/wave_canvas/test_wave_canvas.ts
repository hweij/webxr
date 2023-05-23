import { WaveCanvas } from "./wave_canvas";

const lineWidth = 2;
const color = "red";
const pixPerSecond = 25;

const canvas = document.body.querySelector("canvas");
if (canvas) {
    // Set black background
    canvas.style.backgroundColor = "black";
    let tAbs = performance.now();
    let x = 0;
    let t = 0;

    const waveCanvas = new WaveCanvas(canvas, lineWidth, color);
    waveCanvas.moveTo(x,signalFunction(t));

    let timer = 0;

    const tick = () => {
        const tNext = performance.now();
        const dt = tNext - tAbs;
        tAbs = tNext;
        const dx = dt / pixPerSecond;
        t += dx;
        const newX =  (x + dx) % canvas.width;
        if (newX < x) {
            waveCanvas.moveTo(newX, signalFunction(t));
        }
        else {
            waveCanvas.lineTo(newX, signalFunction(t));
        }
        x = newX;
    }

    timer = window.setInterval(tick, 16);
}

function signalFunction(x: number) {
    const mid = canvas!.height / 2;
    const amp = mid - (lineWidth / 2)
    const v = Math.sin(x * 0.1);
    return (v * v * v) * amp + mid;
}
