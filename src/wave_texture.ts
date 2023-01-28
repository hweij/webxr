import * as THREE from "three";
import { Texture } from "three";

import { Wave } from "./wave";

export class WaveTexture {
  texture: Texture;

  _width: number;
  _height: number;
  _data: Uint8Array;

  wave: Wave;

  constructor(w = 64, h = 64) {
    this._width = w;
    this._height = h;
    this.wave = new Wave(this._width, this._height);
    this.wave.setSpeed(40);
    const size = this._width * this._height;
    this._data = new Uint8Array(4 * size);
    this.texture = new THREE.DataTexture(this._data, this._width, this._height);
    this.texture.magFilter = THREE.LinearFilter;

    this.wave.initWave(17, 10, 10, true);
    this.wave.initWave(37, 30, 10, false);
    this.wave.initWave(53, 45, 10, false);
  }

  tick(dt: number) {
    this.wave.tick(dt);
    // Copy wave data
    const values = this.wave.getZValues();

    let stride = 0;
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        const v = values[x+1][y+1];

        this._data[stride] = Math.min(255, Math.max(0, (v + 1) * 127));
        this._data[stride + 1] = 0;
        this._data[stride + 2] = 0;
        this._data[stride + 3] = 255;

        stride += 4;
      }
    }
    this.texture.needsUpdate = true;
  }
}