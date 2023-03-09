import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial,Vector2 } from "three";

/**
 *
 * @param p Point for which line contour points are calculated
 * @param pPrev Previous point, or undefined if none. Note: pPrev and pNext can not BOTH be undefined
 * @param p Next Next point, or undefined if none
 * @param w Line width
 * @returns Left and right contour points for line
 */
function getGraphLinePoints(p: Vector2, pPrev: Vector2 | undefined, pNext: Vector2 | undefined, w: number) {
  // Result points
  let right, left;

  const w2 = w * 0.5; // Half width

  if (pPrev && pNext) {
    const v1 = (new Vector2()).copy(p).sub(pPrev).normalize();  // Direction vector 1 (normalized)
    const v2 = (new Vector2()).copy(pNext).sub(p).normalize();  // Direction vector 2
    const av = (new Vector2()).copy(v1).add(v2).normalize();  // Average vector

    const nav = new Vector2(av.y, -av.x);

    const c = v1.dot(av); // Cosine of the half angle
    const ti = 1 / c;

    right = (new Vector2()).copy(nav).multiplyScalar(w2 * ti).add(p);
    left = (new Vector2()).copy(nav).multiplyScalar(-w2 * ti).add(p);
  }
  else {
    let v;
    if (pPrev) {
      v = (new Vector2()).copy(p).sub(pPrev).normalize();  // Direction vector 1 (normalized)
    }
    else {
      v = (new Vector2()).copy(pNext!).sub(p).normalize();  // Direction vector 1 (normalized)
    }

    const nv = new Vector2(v.y, -v.x);  // Normal vectors
    right = (new Vector2()).copy(nv).multiplyScalar(w2).add(p);
    left = (new Vector2()).copy(nv).multiplyScalar(-w2).add(p);
  }

  return { right, left };
}

export function createGraphLine(dataSet?: number[], lineWidth = 0.01, dt = 0.001, maxSamples = -1) {
  /** Test points */
  const points = [];
  if (!dataSet) {
    for (let i=0; i<=1000; i++) {
      const x = i * dt;
      const y = Math.sin(x * Math.PI * 10) * 0.5 + 0.5;
      points.push(new Vector2(x, y));
    }
  }
  else {
    // Push the data set
    const n = (maxSamples > 0) ? Math.min(dataSet.length, maxSamples) : dataSet.length;
    for (let i=0; i<=n; i++) {
      const x = i * dt;
      const y = dataSet[i];
      points.push(new Vector2(x, y));
    }
    console.log(`Created graph line with ${n} values`);
  }

  const indices = [] as number[];
  const positions = new Float32Array(6 * points.length);

  const geo = new BufferGeometry();

  if (points.length >= 2) {
    let offset = 0;
    for (let i=0; i<points.length; i++) {
      const p = getGraphLinePoints(points[i], points[i-1], points[i+1], lineWidth);
      if (p) {
        positions.set([p.left.x, p.left.y, 0], offset);
        positions.set([p.right.x, p.right.y, 0], offset + 3);
        offset += 6;
        if (i > 0) {
          const offset = i * 2;
          const prev = offset - 2;
          indices.push(prev, prev + 1, offset);
          indices.push(prev + 1, offset + 1, offset);
        }
      }
    }
  }

  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setIndex(indices);

  const mat = new MeshBasicMaterial({color: "#ff00ff", wireframe: false, side: DoubleSide});
  const mesh = new Mesh(geo, mat);
  return mesh;
}