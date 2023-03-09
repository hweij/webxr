// WFDB reader module
//
// See format specs at: https://physionet.org/physiotools/wag/header-5.htm

import { Annotation, getAnnotationCode, findAnnotationInterval } from "./annotation.js";
import { loadVitals } from "./wfdb.js";

async function graphTest(id: string, start = 0) {
    const vitals = await loadVitals(`/wfdb/${id}.hea`);
    if (!vitals) {
        return;
    }
    const { header, signals, signalMap, annotations } = vitals;

    console.log(header);
    console.log(`Converted to ${signals.length} values`);

    const startAnnot = findAnnotationInterval(annotations, start);

    // Create canvasses
    const divGraphs = document.getElementById("divGraphs") as HTMLElement;
    divGraphs.innerHTML = "";
    const graphWidth = divGraphs.offsetWidth;
    for (let i=0; i<header.numSignals; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = graphWidth;
        canvas.height = 100;
        divGraphs.appendChild(canvas);
    }

    // Plot for each canvas
    for (let i=0; i< header.numSignals; i++) {
        const c = divGraphs.children[i];
        if (c instanceof HTMLCanvasElement) {
            console.log(`baseLine = ${header.signals[i].adc?.baseLine}, gain = ${header.signals[i].adc?.gain}`);
            plotGraph(c, signals[i], start, annotations || [], startAnnot);
        }
    }
}

function plotGraph(c: HTMLCanvasElement, values: Float32Array, start: number, annot: Annotation[], startAnnot: number) {
    const w = c.width;
    const end = start + w;
    // Find min/max
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i=start; i<end; i++) {
        min = Math.min(min, values[i]);
        max = Math.max(max, values[i]);
    }
    console.log(`max = ${max}, min = ${min}`);
    if (max > min) {
        // All OK!
        console.log("delta = " + (max - min));
        const ctx = c.getContext("2d");
        if (ctx) {
            const h = c.height;
            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(0, 0, c.width, h);
            const scale = h / (max - min);
            ctx.fillStyle = "none";
            ctx.strokeStyle = "#2B86B2";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i=0; i<w; i++) {
                const v = (values[start + i] - min) * scale;
                ctx.lineTo(i, h - v);
            }
            ctx.stroke();
            // Annotations

            if (startAnnot >= 0) {
                ctx.lineWidth = 1;
                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = "#2B86B2";
                let ai = startAnnot;
                const n = annot.length;
                console.log(`ai = ${ai}, n = ${n}`);
                while (ai < n) {
                    const x = annot[ai].t - start;
                    const code = annot[ai].code;
                    const aux = annot[ai].aux;
                    console.log(`Annot: ${code}: ${getAnnotationCode(code)?.description} aux = ${aux??"-"}`);
                    if (x >= 0) {
                        if (x > w) {
                            break;
                        }
                        ctx.strokeStyle = (code === 1) ? "#2B86B2" : "#868686";
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, 100);
                        ctx.stroke();
                        // Annotation symbol
                        const sym = getAnnotationCode(code)?.sym;
                        if (sym) {
                            ctx.fillText(sym, x, 90);
                        }
                    }
                    ai++;
                }
            }
        }
    }
}

// test();
// graphTest("default", 360 * 15 * 60);
graphTest("bidmc01", 0);
