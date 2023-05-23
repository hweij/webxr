import { WaveCanvas } from "./wave_canvas";

const startTime = performance.now();

const canvas = document.body.querySelector("canvas");
if (canvas) {
    const waveCanvas = new WaveCanvas(canvas, 2, "red");
    waveCanvas.moveTo(0,0);
    for (let i=0; i < canvas.width; i += 0.2) {
        waveCanvas.lineTo(i, Math.sin(i * 0.1) * 50 + 55);
    }
}

var endTime = performance.now()

console.log(`Test execution time: ${(endTime - startTime).toFixed(2)} ms`);
