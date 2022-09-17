import { BufferAttribute, BufferGeometry, Color, Matrix4, Mesh, MeshStandardMaterial, Vector3 } from 'three';
export declare class TubePainter {
    vector1: Vector3;
    vector2: Vector3;
    vector3: Vector3;
    vector4: Vector3;
    point1: Vector3;
    point2: Vector3;
    matrix1: Matrix4;
    matrix2: Matrix4;
    color: Color;
    size: number;
    geometry: BufferGeometry;
    positions: BufferAttribute;
    normals: BufferAttribute;
    colors: BufferAttribute;
    mesh: Mesh<BufferGeometry, MeshStandardMaterial>;
    count: number;
    constructor(pColor?: Color);
    getPoints(size: number): Vector3[];
    stroke(position1: Vector3, position2: Vector3, matrix1: Matrix4, matrix2: Matrix4): void;
    moveTo(position: Vector3): void;
    lineTo(position: Vector3): void;
    setSize(value: number): void;
    update(): void;
}
