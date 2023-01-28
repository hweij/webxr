import * as THREE from "three";
import { Texture } from "three";

export class ColorBoard {
  texture: Texture;

  _width: number;
  _height: number;
  _data: Uint8Array;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    const size = width * height;
    this._data = new Uint8Array(4 * size);

    this.texture = new THREE.DataTexture(this._data, width, height);
  }

  testFill() {
    const size = this._width * this._height;

    for (let i = 0; i < size; i++) {
      const stride = i * 4;

      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);

      this._data[stride] = r;
      this._data[stride + 1] = g;
      this._data[stride + 2] = b;
      this._data[stride + 3] = 255;
    }
    this.texture.needsUpdate = true;
  }

  fill(f: (x: number, y: number) => [number, number, number, number]) {
    let stride = 0;
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        const rgba = f(x, y);

        this._data[stride] = rgba[0];
        this._data[stride + 1] = rgba[1];
        this._data[stride + 2] = rgba[2];
        this._data[stride + 3] = rgba[3];

        stride += 4;
      }
    }
    this.texture.needsUpdate = true;
  }

  tick(_dt: number) {
    this.testFill();
  }
}
