import { WaveCanvas } from "./wave_canvas";

const lineWidth = 2;
const color = "red";
const pixPerSecond = 25;

const canvas = document.body.querySelector("canvas");
if (canvas) {
    // Set black background
    canvas.style.backgroundColor = "black";
    let t = performance.now();
    let x = 0;

    const waveCanvas = new WaveCanvas(canvas, lineWidth, color);
    waveCanvas.moveTo(x,signalFunction(x));

    let timer = 0;

    const tick = () => {
        const tNext = performance.now();
        const dt = tNext - t;
        t = tNext;
        x += (dt / pixPerSecond);
        if (x < canvas.width) {
            waveCanvas.lineTo(x, signalFunction(x));
        }
        else {
            // Stop timer
            window.clearInterval(timer);
            timer = 0;
        }
    }

    timer = window.setInterval(tick, 16);
}

function signalFunction(x: number) {
    const mid = canvas!.height / 2;
    const amp = mid - (lineWidth / 2)
    const v = Math.sin(x * 0.1);
    return (v * v * v) * amp + mid;
}
