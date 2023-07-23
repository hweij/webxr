import { GameContext, GameObject } from "./game_frame";

export class Wave implements GameObject {
  /** Propagation speed of the wave */
  speed = 1.0;
  /** Wave sustain: 1.0 = forever, 0.0 = extinguish immediately */
  sustain = 1.0;

  private width: number;
  private height: number;
  private z: Float64Array[];
  private v: Float64Array[];		// velocity and potential

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.v = new Array(this.width + 2);
    for (let i = 0; i < this.v.length; i++) {
      this.v[i] = new Float64Array(this.height + 2);
    }
    this.z = new Array(this.width + 2);
    for (let i = 0; i < this.z.length; i++) {
      this.z[i] = new Float64Array(this.height + 2);
    }
  }

  /** Initiate a drop in the wave field */
  drop(jx: number, jy: number, rMax: number) {
    let wk, r;

    for (let x = 1; x <= this.width; x++) {
      for (let y = 1; y <= this.height; y++) {
        r = Math.sqrt((x - jx) * (x - jx) + (y - jy) * (y - jy));
        if (r <= rMax) {
          wk = r * 1.57 / rMax;
          this.z[x][y] += 2 * Math.cos(wk) * Math.cos(wk);
        }
      }
    }
  }

  /** Clear the wave field, with an optional level value */
  clear(level = 0) {
    for (let i = 0; i < this.width + 2; i++) {
      this.v[i].fill(0);
      this.z[i].fill(level);
      // for (let j = 0; j < this.height + 2; j++) {
      //   this.v[i][j] = 0;
      //   this.z[i][j] = level;
      // }
    }
  }

  tick(context: GameContext) {
    let i, j;
    for (i = 1; i <= this.width; i++) {
      for (j = 1; j <= this.height; j++) {
        this.v[i][j] = this.v[i][j] + ((this.z[i + 1][j] + this.z[i - 1][j] + this.z[i][j + 1] + this.z[i][j - 1]) * 0.25 - this.z[i][j]) * context.dt;
      }
    }
    for (i = 1; i <= this.width; i++) {
      for (j = 1; j <= this.height; j++) {
        this.z[i][j] = (this.z[i][j] + this.v[i][j] * this.speed * context.dt) * this.sustain;
      }
    }
  }

  get values(): Float64Array[] {
    return this.z;
  }
}
