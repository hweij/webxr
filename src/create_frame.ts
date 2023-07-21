type ZWH = [ z: number, w: number, h: number];
type XYZ = [ x: number, y: number, z: number];

/**
 * Creates a frame vertex array that connects specified rectangles (z-coordinate, width, and height).
 * 
 * Each entry in the array specifies z-coordinate, width, and height of the rectangle.
 * 
 * Example: const vertices = createFrame([-0.1, 2, 1], [0, 2, 1], [0.1, 1.8, 0.8]);
 */
export function createFrame(p: ZWH[]) {
    let vertices: number[] = [];
    // Vertices: 24 per stage, 6 for back/front
    for (let i=0; i<p.length; i++) {
        connectRectangles(p[i], p[(i+1) % p.length], vertices);
    }
    return vertices;
}

/** Connects two rectangles of the frame */
function connectRectangles(r1: ZWH, r2: ZWH, vertices: number[]) {
    const v1 = getVertices(r1);
    const v2 = getVertices(r2);
    for (let i=0; i<4; i++) {
        const i2 = (i + 1) % 4;
        createQuad(v1[i], v1[i2], v2[i2], v2[i], vertices);
    }
}

/** Returns the vertices of a given rectangle */
function getVertices(r: ZWH): XYZ[] {
    const z = r[0];
    const w2 = r[1] * 0.5;
    const h2 = r[2] * 0.5;
    return[[-w2, h2, z], [w2, h2, z], [w2, -h2, z], [-w2, -h2, z]];
}

/** Creates vertices for a quad */
function createQuad(p1: XYZ, p2: XYZ, p3: XYZ, p4: XYZ, vertices: number[]) {
    vertices.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
}
