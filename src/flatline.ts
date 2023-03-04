import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Vector2, Vector3 } from "three";

export function getOutlinePoints(p1: Vector2, p2: Vector2, p3: Vector2, w: number) {
  const w2 = w * 0.5; // Half width
  const v1 = (new Vector2()).copy(p2).sub(p1).normalize();  // Direction vector 1 (normalized)
  const v2 = (new Vector2()).copy(p3).sub(p2).normalize();  // Direction vector 2
  const av = (new Vector2()).copy(v1).add(v2).normalize();  // Average vector

  const n1 = new Vector2(v1.y, -v1.x);  // Normal vectors
  const n2 = new Vector2(v2.y, -v2.x);
  const nav = new Vector2(av.y, -av.x);

  const c = v1.dot(av); // Cosine of the half angle
  const c2 = Math.sqrt(1 - (c * c));
  const ti = 1 / c;
  const tj = 1 / c2;

  const inner = (new Vector2()).copy(nav).multiplyScalar(ti * w2).add(p2);
  const outer = (new Vector2()).copy(nav).multiplyScalar(-w2).add(p2);
  const pa = (new Vector2()).copy(av).multiplyScalar(-tj * w2).add(p2);
  const pb = (new Vector2()).copy(av).multiplyScalar(tj * w2).add(p2);

  console.log(`c = ${c.toFixed(3)} ti = ${ti.toFixed(3)} pInner = (${inner.x.toFixed(3)}, ${inner.y.toFixed(3)}) pOuter = (${outer.x.toFixed(3)}, ${outer.y.toFixed(3)}), pa = (${pa.x.toFixed(3)}, ${pa.y.toFixed(3)}), pb = (${pb.x.toFixed(3)}, ${pb.y.toFixed(3)})`);

  return { inner, outer, pa, pb };
  // Find the inner crossing
  //
  // p - n1 + v1 * t1 = p - n2 + v2 * t2
  //
  // v1 * t1 - n1 = v2 * t2 - n2
  //
  // v1x * t1 - v1y = v2x * t2 - v2y
  // v1y * t1 + v1x = v2y * t2 + v2x
  //
  // v1x + v1y = (v2y - v2x) * t2 + v2x + v2y
  //
  // (v1x + v1y) - (v2x + v2y) = (v2y - v2x) * t2
  //
  // t2 = (v1x + v1y - v2x - v2y) / (v2y - v2x)
  //
  // vy1 + v2x * t2 - v2y + v1x = v2y * t2 + v2x
  //
  // t2 = ((v2x + v2y) - (v1x - v1y)) / (v2x - v2y);
}

export function createFlatLine() {
  const indices = [] as number[];
  const positions = [] as number[];

  const points = [
    new Vector2(0.0, 0.0),
    new Vector2(0.1, 0.4),
    new Vector2(0.2, 0.7),
    new Vector2(0.3, 0.9),
    new Vector2(0.4, 1.0),
    new Vector2(0.5, 0.9),
    new Vector2(0.6, 0.7),
    new Vector2(0.7, 0.4),
    new Vector2(0.8, 0.0),
  ];

  const geo = new BufferGeometry();

  for (let i=1; i<points.length - 1; i++) {
    const p1 = getOutlinePoints(points[i-1], points[i], points[i+1], 0.04);
    const offset = (i - 1) * 4;
    positions.push(p1.pa.x,    p1.pa.y, 0);       // 0 pa
    positions.push(p1.outer.x, p1.outer.y, 0);    // 1 outer
    positions.push(p1.pb.x,    p1.pb.y, 0);       // 2 pb
    positions.push(p1.inner.x, p1.inner.y, 0);    // 3 inner
    indices.push(offset, offset + 1, offset + 2 );
    indices.push(offset + 2, offset + 3, offset );
    if (i > 1) {
      const prev = offset - 4;
      indices.push(prev + 2, offset + 1, prev + 3);
      indices.push(prev + 3, offset + 1, offset);
    }
  }

  geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(indices);

  const mat = new MeshBasicMaterial({color: "#ff0000", wireframe: true, side: DoubleSide});
  const mesh = new Mesh(geo, mat);
  return mesh;
}