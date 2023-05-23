import { WaveCanvas } from "./wave_canvas";

const canvas = document.body.querySelector("canvas");
if (canvas) {
    let t = performance.now();
    let x = 0;

    const waveCanvas = new WaveCanvas(canvas, 2, "red");
    waveCanvas.moveTo(x,signalFunction(x));

    let timer = 0;

    const tick = () => {
        const tNext = performance.now();
        const dt = tNext - t;
        t = tNext;
        x += (dt * 0.04);
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
    const v = Math.sin(x * 0.1);
    return (v * v * v) * 50 + 55;
}
