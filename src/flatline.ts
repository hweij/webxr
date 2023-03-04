import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial,Vector2 } from "three";

export function getOutlinePoints(p1: Vector2, p2: Vector2, p3: Vector2, w: number) {
  const w2 = w * 0.5; // Half width
  const v1 = (new Vector2()).copy(p2).sub(p1).normalize();  // Direction vector 1 (normalized)
  const v2 = (new Vector2()).copy(p3).sub(p2).normalize();  // Direction vector 2
  const av = (new Vector2()).copy(v1).add(v2).normalize();  // Average vector

  const n1 = new Vector2(v1.y, -v1.x);  // Normal vectors
  const n2 = new Vector2(v2.y, -v2.x);
  const nav = new Vector2(av.y, -av.x);

  const c = v1.dot(av); // Cosine of the half angle
  const ti = 1 / c;

  const s = v1.dot(n2); // To check bend direction and decide which is inner and which is outer

  let inner, outer, pa, pb;

  if (s <= 0) {
    inner = (new Vector2()).copy(nav).multiplyScalar(ti * w2).add(p2);
    outer = (new Vector2()).copy(nav).multiplyScalar(-w2).add(p2);
    pa = (new Vector2()).copy(n1).multiplyScalar(-w2).add(p2);
    pb = (new Vector2()).copy(n2).multiplyScalar(-w2).add(p2);
  }
  else {
    // Not correct yet, we need to more clearly distinguish the two situations
    inner = (new Vector2()).copy(nav).multiplyScalar(-w2 * ti).add(p2);
    outer = (new Vector2()).copy(nav).multiplyScalar(w2).add(p2);
    pa = (new Vector2()).copy(n1).multiplyScalar(w2).add(p2);
    pb = (new Vector2()).copy(n2).multiplyScalar(w2).add(p2);
  }

  console.log(`c = ${c.toFixed(3)} s = ${s.toFixed(3)} ti = ${ti.toFixed(3)} pInner = (${inner.x.toFixed(3)}, ${inner.y.toFixed(3)}) pOuter = (${outer.x.toFixed(3)}, ${outer.y.toFixed(3)}), pa = (${pa.x.toFixed(3)}, ${pa.y.toFixed(3)}), pb = (${pb.x.toFixed(3)}, ${pb.y.toFixed(3)})`);

  return { inner, outer, pa, pb };
}

export function createFlatLine() {
  const indices = [] as number[];
  const positions = [] as number[];

  /** Test points */
  const points = [
    new Vector2(0.0, 0.0),
    new Vector2(0.1, 0.4),
    new Vector2(0.2, 0.7),
    new Vector2(0.3, 0.9),
    new Vector2(0.4, 1.0),
    new Vector2(0.5, 0.95),
    new Vector2(0.6, 0.7),
    new Vector2(0.7, 0.4),
    new Vector2(0.8, 0.0),
    new Vector2(0.9, 0.4),
    new Vector2(1.0, 0.7),
    new Vector2(1.0, 0.9),
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
      indices.push(prev + 2, offset, offset + 3);
      indices.push(prev + 2, offset + 3, prev + 3);
    }
  }

  geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(indices);

  const mat = new MeshBasicMaterial({color: "#ff0000", wireframe: false, side: DoubleSide});
  const mesh = new Mesh(geo, mat);
  return mesh;
}