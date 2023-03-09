export interface Annotation {
    t: number;
    code: number;
    aux?: string;
}

/**
 * Annotation codes
 */
const annotationCodes = [
    { sym: "", code: "NOTQRS", description: "not-QRS (not a getann/putann code)" }, // 0
    { sym: "N", beat: true, code: "NORMAL", description: "normal beat" }, // 1
    { sym: "L", beat: true, code: "LBBB", description: "left bundle branch block beat" }, // 2
    { sym: "R", beat: true, code: "RBBB", description: "right bundle branch block beat" }, // 3
    { sym: "a", beat: true, code: "ABERR", description: "aberrated atrial premature beat" }, // 4
    { sym: "V", beat: true, code: "PVC", description: "premature ventricular contraction" }, // 5
    { sym: "F", beat: true, code: "FUSION", description: "fusion of ventricular and normal beat" }, // 6
    { sym: "J", beat: true, code: "NPC", description: "nodal (junctional) premature beat" }, // 7
    { sym: "A", beat: true, code: "APC", description: "atrial premature contraction" }, // 8
    { sym: "S", beat: true, code: "SVPB", description: "premature or ectopic supraventricular beat" }, // 9
    { sym: "E", beat: true, code: "VESC", description: "ventricular escape beat" }, // 10
    { sym: "j", beat: true, code: "NESC", description: "nodal (junctional) escape beat" }, // 11
    { sym: "/", beat: true, code: "PACE", description: "paced beat" }, // 12
    { sym: "Q", beat: true, code: "UNKNOWN", description: "unclassifiable beat" }, // 13
    { sym: "~", code: "NOISE", description: "signal quality change" }, // 14
    { sym: "", code: "15", description: "?" }, // 15
    { sym: "|", code: "ARFCT", description: "isolated QRS-like artifact" }, // 16
    { sym: "", code: "17", description: "?" }, // 17
    { sym: "s", code: "STCH", description: "ST change" }, // 18
    { sym: "T", code: "TCH", description: "T-wave change" }, // 19
    { sym: "*", code: "SYSTOLE", description: "systole" }, // 20
    { sym: "D", code: "DIASTOLE", description: "diastole" }, // 21
    { sym: "\"", code: "NOTE", description: "comment annotation" }, // 22
    { sym: "=", code: "MEASURE", description: "measurement annotation" }, // 23
    { sym: "p", code: "PWAVE", description: "P-wave peak" }, // 24
    { sym: "B", beat: true, code: "BBB", description: "left or right bundle branch block" }, // 25
    { sym: "^", code: "PACESP", description: "non-conducted pacer spike" }, // 26
    { sym: "t", code: "TWAVE", description: "T-wave peak" }, // 27
    { sym: "+", code: "RHYTHM", description: "rhythm change" }, // 28
    { sym: "u", code: "UWAVE", description: "U-wave peak" }, // 29
    { sym: "?", beat: true, code: "LEARN", description: "learning" }, // 30
    { sym: "!", code: "FLWAV", description: "ventricular flutter wave" }, // 31
    { sym: "[", code: "VFON", description: "start of ventricular flutter/fibrillation" }, // 32
    { sym: "]", code: "VFOFF", description: "end of ventricular flutter/fibrillation" }, // 33
    { sym: "e", beat: true, code: "AESC", description: "atrial escape beat" }, // 34
    { sym: "n", beat: true, code: "SVESC", description: "supraventricular escape beat" }, // 35
    { sym: "@", code: "LINK", description: "link to external data (aux contains URL)" }, //    36
    { sym: "x", code: "NAPC", description: "non-conducted P-wave (blocked APB)" }, // 37
    { sym: "f", beat: true, code: "PFUS", description: "fusion of paced and normal beat" }, // 38
    { sym: "`", code: "WFON/PQ", description: "WFON / PQ junction (beginning of QRS)" }, // 39
    { sym: "'", code: "WFOFF/JPT", description: "WFOFF / J point (end of QRS)" }, // 40
    { sym: "r", beat: true, code: "RONT", description: "R-on-T premature ventricular contraction" }, // 41
];

export function getAnnotationCode(code: number) {
    return annotationCodes[code];
}

export async function getAnnotations(url: string) {
    const res = [] as Annotation[];
    // Parse the values
    try {
        let fdata = await fetch(url);
        if (fdata.status < 200 || fdata.status >= 300) {
            console.error("Error loading annotations: response code = " + fdata.status);
            return res;
        }
        console.log("NEXT?");
        const buffer = await fdata.arrayBuffer();

        const data = new Uint8Array(buffer);

        let numField = 0;
        let chanField = 0;

        const numBytes = data.length;
        console.log("Number of annotation bytes = " + data.length);
        let absTime = 0;
        for (let i = 0; i < numBytes; i += 2) {
            const lsb = data[i];
            const msb = data[i + 1];
            // Annotation code (A) is in the 6 MSB bits from MSByte
            const A = msb >>> 2;
            const I = ((msb & 0x3) << 8) | lsb;
            switch (A) {
                case 59:    // SKIP I = 0; the next four bytes are the interval in PDP-11 long integer format (the high 16 bits first, then the low 16 bits, with the low byte first in each pair).
                    const interval = (((data[i + 3] << 8) | data[i + 2]) << 16) | ((data[i + 5] << 8) | data[i + 4]);
                    absTime += interval;
                    console.log("***** SKIP");
                    i += 4; // Skip the 4 data bytes
                    break;
                case 60:    // NUM I = annotation num field for current and subsequent annotations; otherwise, assume previous annotation num (initially 0).
                    // console.log("***** NUM = " + d);
                    numField = I;
                    break;
                case 61:    // SUB I = annotation subtyp field for current annotation only; otherwise, assume subtyp = 0.
                    // console.log("***** SUB = " + d);
                    break;
                case 62:    // CHN I = annotation chan field for current and subsequent annotations; otherwise, assume previous chan (initially 0).
                    chanField = I;
                    // console.log("***** CHN = " + d);
                    break;
                case 63:    // AUX I = number of bytes of auxiliary information (which is contained in the next I bytes); an extra null, not included in the byte count, is appended if I is odd.
                    const aux = String.fromCharCode.apply(null, Array.from(data.slice(i + 2, i + 2 + I)));
                    // console.log(`***** AUX: "${aux}" (${d} bytes) channel = ${chanField}`);
                    const skipBytes = ((I + 1) >>> 1) << 1;
                    i += skipBytes;
                    if (res.length > 0) {
                        res[res.length - 1].aux = aux;
                    }
                    break;
                default:
                    absTime += I;
                    res.push({ t: absTime, code: A });
                    break;
            }
        }
    }
    catch (err) {
        console.error("Error loading annotations: " + err);
    }

    return res;
}

export function findAnnotationInterval(annot: { t: number, code: number }[] | undefined, t: number) {
    if (annot && (annot.length > 1)) {
        let start = 0;
        let end = annot.length - 1;
        if ((t >= annot[start].t) && (t < annot[end].t)) {
            while ((end - start) > 1) {
                const index = Math.floor((start + end) / 2);
                if (annot[index].t > t) {
                    end = index;
                }
                else {
                    start = index;
                }
            }
            // The interval should be correct now, return it
            return start;
        }
    }
    // No valid interval: return -1
    return -1;
}
