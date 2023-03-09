import { Annotation, getAnnotations } from "./annotation.js";

/**
 * Describes a set of related vitals.
 * The parameters are specified on the first line, separated by spaces.
 * The format, per part, is as follows (part index, followed by spec):
 *
 * 0. name [/numSegments]
 * 1. numSignals
 * 2. [sampleFrequency [/counterFrequency] [(baseCounterValue)]]
 * 3. [numSamples]
 * 4. [baseTime]
 * 5. [baseDate]
 *
 * Example: set001 8 360/0.476 1376831
 *
 * @see https://physionet.org/physiotools/wag/header-5.htm
 */
export interface WFDBHeader {
    name: string;
    numSegments?: number;
    numSignals: number;
    samplingFrequency?: number;
    counterFrequency?: number;
    numSamples?: number;
    signals: WFDBSignal[];
    notes?: string;
}

export interface WFDBDataSet {
    header: WFDBHeader;
    signals: Float32Array[];
    signalMap?: { [id: string]: Float32Array };
    annotations?: Annotation[];
}

/**
 * Supported formats, a subset of the ones supported in the definition.
 *
 * The parameters are specified on a single line, separated by spaces.
 * The format, per part, is as follows (part index, followed by spec):
 *
 * @see https://physionet.org/physiotools/wag/signal-5.htm
 */
type WFDBFormat = 212 | 16;

export interface WFDBSignal {
    id: string; // ID, retrieved from comment
    fileName: string;
    format: WFDBFormat;
    adc?: {
        gain: number;
        baseLine?: number;
    };
    unit: string;
    name: string;
}

/**
 *
 * @param url URL of the vitals dataset header file
 */
export async function loadVitals(url: string, customDir?: string) {
    if (url.endsWith(".hea")) {
        // const qstring = customDir ? `?dir=$customDir}` : "";
        const qstring = customDir ? `?dir=${encodeURI(customDir)}` : "";
        const baseURL = url.substring(0, url.length - 4);
        const header = await readHeader(url + qstring);
        const signalValues = await getSignalData(baseURL + ".dat" + qstring, header);
        const annot = await getAnnotations(baseURL + ".ari" + qstring);
        // Create signal map from the signals and header
        const signalMap = {} as { [id:string]: Float32Array };
        for (let i=0; i< header.numSignals; i++) {
            const id = header.signals[i].id;
            if (id && signalValues) {
                signalMap[id] = signalValues[i];
            }
        }
        return { header: header, signals: signalValues, signalMap: signalMap, annotations: annot } as WFDBDataSet;
    }
    else {
        console.error(`URL ${url} does not specify a valid WFDB header file`);
        return null;
    }
}

async function readHeader(url: string) {
    const headerText = await fetch(url).then(v => v.text());
    const lines = headerText.split(/\r?\n/);

    // Parse header
    const header = parseHeader(lines?.shift() || "");
    // Parse data lines
    header.signals = [];
    const noteLines: string[] = [];
    let vid;
    for (let line of lines) {
        const trimmed = line.trim();
        if (line) {
            if (line.startsWith("#")) {
                // Check for special comment @pcof
                const comparts = line.split(/\s+/);
                if (comparts[1] === "@pcof") {
                    // Special: get vital ID
                    vid = comparts[2];  // Set vital ID for following signal def
                }
                else {
                    // Normal comment: include it in the notes
                    noteLines.push(line.substring(1));
                }
            }
            else {
                // Not a comment: signal def
                const sig = parseSignal(trimmed);
                if (vid) {
                    sig.id = vid;
                    vid = null;
                }
                else {
                    console.warn(`URL: ${url}\nNo ID specified for signal ${sig.name}.\nInsert a comment line to of the form:\n  # @pcof <id>\nbefore the signal to specify an ID.`);
                }
                header.signals.push(sig);
            }
        }
    }
    header.notes = noteLines.join("\n");

    console.log("***** DATA SET NOTES:");
    console.log(header.notes);

    return header;
}

function parseHeader(line: string) {
    const res = {} as WFDBHeader;
    const header = line.split(/\s+/);
    // 0: Name and optional number of segments
    const nameParts = header[0].split("/");
    res.name = nameParts[0];
    if (nameParts[1]) {
        res.numSegments = parseInt(nameParts[1]);
    }
    // 1: Number of signals
    res.numSignals = parseInt(header[1]);
    // 2: Sampling frequency (optional) with optional counter frequency
    const freq = header[2];
    if (freq) {
        const freqParts = freq.split("/");
        res.samplingFrequency = parseFloat(freqParts[0]);
        if (freqParts[1]) {
            res.counterFrequency = parseFloat(freqParts[1]);
        }
    }
    // 3: Number of samples
    const ns = header[3];
    if (ns) {
        res.numSamples = parseInt(ns);
    }
    return res;
}

function parseSignal(line: string) {
    const res = { adc: { gain: 200, baseLine: 0 }} as WFDBSignal;
    const parts = line.split(/\s+/);
    // 0: file name
    res.fileName = parts[0];
    // 1: format
    res.format = parseInt(parts[1]) as WFDBFormat;
    // 2: ADC parameters
    const adcText = parts[2];
    if (adcText && res.adc) {
        const adcParts = adcText.split("/");    // Split into ADC values and unit
        const adcVals = adcParts[0];
        res.adc.gain = parseFloat(adcVals);
        // Check for optional baseline: (<baseline>)
        const idx = adcVals.indexOf("(");
        if (idx >= 0) {
            const parts = adcVals.substring(idx + 1).split(")");
            res.adc.baseLine = parseInt(parts[0]);
            if (parts[2]) {
                // There's more: not doing that now though
            }
        }
        // Check for unit
        if (adcParts[1]) {
            res.unit = adcParts[1];
        }
    }
    // 8..: name
    if (parts.length >= 8) {
        res.name = parts.slice(8).join(" ");
    }
    return res;
}

async function getSignalData(url: string, header: WFDBHeader) {
    // Check if we support the data encoding
    let errors = 0;
    let format: WFDBFormat | undefined;
    for (let signal of header.signals) {
        if (!format) {
            format = signal.format;
        }
        else {
            if (signal.format !== format) {
                // Different formats in a collection are not supported yet
                console.error(`Different formats in the same header not supported: ${signal.format} ${format}`);
                errors++;
            }
        }
    }
    if ((format !== 212) && (format !== 16)) {
        console.error(`Unsupported format: ${format}`);
        errors++;
    }
    if (errors > 0) {
        console.error("Closing..");
        return;
    }

    // Parse the values
    const buffer = await (await fetch(url)).arrayBuffer();
    const data = new Uint8Array(buffer);

    let signalValues: Float32Array[] | undefined;

    switch (format) {
        case 212:
            signalValues = decode212(data, header);
            break;
        case 16:
            signalValues = decode16(data, header);
            break;
    }
    if (signalValues) {
        scaleSignals(signalValues, header);
    }

    return signalValues;
}

function decode212(data: Uint8Array, header: WFDBHeader) {
    const signalValues = new Array<Float32Array>();
    const numBytes = data.length;
    const numValues = Math.floor(numBytes * 2 / 3);
    const numSamples = header.numSamples ?? Math.floor(numValues / header.numSignals);

    for (let i=0; i<header.numSignals; i++) {
        signalValues[i] = new Float32Array(numSamples);
    }
    let split = false;
    let index = 0;
    let outIndex = 0;
    let v:number;
    let sigIndex = 0;
    while (outIndex < numSamples) {
        if (split) {
            v = ((data[index+1] & 0xf0) << 4) | data[index+2];
            index += 3;    // Go to the (middle of) the next byte
            split = false;
        } else {
            v = ((data[index+1] & 0x0f) << 8) | data[index];
            split = true;
        }
        if (v >= 0x800) {
            // Negative: two's complement
            v = v - 0x1000;
        }
        signalValues[sigIndex][outIndex] = v;
        sigIndex++;
        if (sigIndex >= header.numSignals) {
            outIndex++;
            sigIndex = 0;
        }
    }
    return signalValues;
}

function decode16(data: Uint8Array, header: WFDBHeader) {
    const signalValues = new Array<Float32Array>();
    const numBytes = data.length;
    const numValues = Math.floor(numBytes / 2);
    const numSamples = header.numSamples ?? Math.floor(numValues / header.numSignals);

    for (let i=0; i<header.numSignals; i++) {
        signalValues[i] = new Float32Array(numSamples);
    }
    let index = 0;
    let outIndex = 0;
    let v:number;
    let sigIndex = 0;
    while (outIndex < numSamples) {
        v = (data[index+1] << 8) | data[index];
        index += 2;
        if (v >= 0x8000) {
            // Negative: two's complement
            v = v - 0x10000;
        }
        signalValues[sigIndex][outIndex] = v;
        sigIndex++;
        if (sigIndex >= header.numSignals) {
            outIndex++;
            sigIndex = 0;
        }
    }
    return signalValues;
}

/**
 * Exports a data set to wfdb format (16).
 * A textual header and matching binary data file will be returned.
 *
 * @param vset Data set to export
 */
export function encode16(vset: WFDBDataSet) {
    const header = vset.header;
    const signals = vset.signals;   // Signals (16 bit signed range)
    const numSamples = header.numSamples!;
    const numSignals = signals.length;
    const bytes = new Uint8Array(numSamples * numSignals * 2);
    let outIndex = 0;
    for (let sampleIndex = 0; sampleIndex < numSamples; sampleIndex++) {
        for (let sigIndex = 0; sigIndex < numSignals; sigIndex++) {
            const adc = header.signals[sigIndex].adc!;
            let v = signals[sigIndex][sampleIndex] * adc.gain + adc.baseLine!;
            if (v < 0) {
                v += 0x10000;   // Two's complement
            }
            v = Math.floor(v);
            if (v < 0) {
                v = 0;
            }
            else {
                if (v > 0xffff) {
                    v = 0xffff;
                }
            }
            bytes[outIndex++] = v & 0xff;  // LSB
            bytes[outIndex++] = (v >>> 8); // MSB
        }
    }
    // Write header
    const headerLines = [] as string[];
    headerLines.push(`${header.name} ${numSignals} ${header.samplingFrequency} ${numSamples}`);
    // Signals to follow
    for (let sig of header.signals) {
        headerLines.push(`# @pcof ${sig.id}`);
        headerLines.push(`${header.name}.dat 16 ${sig.adc?.gain}(${sig.adc?.baseLine})/${sig.unit}`);
    }
    return { header: headerLines.join("\n"), data: bytes };
}

/**
 * Scales a set of signals read from a WFDB file to their actual values.
 *
 * @param signalValues Array of unscaled sample values
 * @param header WFDB header info
 */
function scaleSignals(signalValues: Float32Array[], header: WFDBHeader) {
    const numSignals = signalValues.length;
    for (let i=0; i<numSignals; i++) {
        const signal = signalValues[i];
        const baseLine = header.signals[i].adc!.baseLine!;
        const gain = header.signals[i].adc!.gain;
        const n = signal.length;
        for (let i=0; i<n; i++) {
            signal[i] = (signal[i] - baseLine) / gain;
        }
    }
}
