import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';

export class Graph {
    line: Line2;

    constructor(width: number, color: number) {
        const N = 40;
        const positions = new Float32Array((N + 1)*3);
        let offset = 0;
        for (let i=0; i<=N; i++) {
            const x = i/N;
            const y = Math.random() * 0.4;
            positions[offset] = x;
            positions[offset+1] = y;
            positions[offset + 2] = 0;
            offset += 3;
        }
        const mat = new LineMaterial( {
            color: color,
            linewidth: width, // in world units with size attenuation, pixels otherwise
            vertexColors: false,

            //resolution:  // to be set by renderer, eventually
            dashed: false,
            // alphaToCoverage: true,
            worldUnits: true
        } );
        const geo = new LineGeometry();
        geo.setPositions(positions);
        this.line = new Line2( geo, mat );
    }

    get mesh() {
        return this.line;
    }
}