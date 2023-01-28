export class Wave {
  WIDTH: number;
  HEIGHT: number;

  z: number[][];
  v: number[][];		// velocity and Z-value
  speed: number;			// time factor
  sustain = 1.0;

  constructor(w: number, h: number) {
    this.WIDTH = w;
    this.HEIGHT = h;
    this.v = new Array(this.WIDTH + 2);
    for (let i = 0; i < this.v.length; i++) {
      this.v[i] = new Array(this.HEIGHT + 2);
      this.v[i].fill(0);
    }
    this.z = new Array(this.WIDTH + 2);
    for (let i = 0; i < this.z.length; i++) {
      this.z[i] = new Array(this.HEIGHT + 2);
      this.z[i].fill(0);
    }
    this.speed = 1.0;
  }

  initWave(jx: number, jy: number, rMax: number, clear: boolean) {
    let i: number;
    let j: number;
    let wk, px, py, r;

    for (i = 1; i <= this.WIDTH; i++) {
      for (j = 1; j <= this.HEIGHT; j++) {
        px = i;
        py = j;
        //				v[i][j] = 0;
        r = Math.sqrt((px - jx) * (px - jx) + (py - jy) * (py - jy));
        const offs = clear ? 0 : this.z[i][j];
        if (r > rMax) {
          this.z[i][j] = offs;
        } else {
          wk = r * 1.57 / rMax;
          this.z[i][j] = 2 * Math.cos(wk) * Math.cos(wk) + offs;
        }
      }
    }
  }

  clear(level: number) {
    for (let i = 0; i < this.WIDTH + 2; i++) {
      for (let j = 0; j < this.HEIGHT + 2; j++) {
        this.v[i][j] = 0;
        this.z[i][j] = level;
      }
    }
  }

  tick(dt: number) {
    let i, j;
    for (i = 1; i <= this.WIDTH; i++) {
      for (j = 1; j <= this.HEIGHT; j++) {
        this.v[i][j] = this.v[i][j] + ((this.z[i + 1][j] + this.z[i - 1][j] + this.z[i][j + 1] + this.z[i][j - 1]) * 0.25 - this.z[i][j]) * dt;
      }
    }
    for (i = 1; i <= this.WIDTH; i++) {
      for (j = 1; j <= this.HEIGHT; j++) {
        this.z[i][j] = (this.z[i][j] + this.v[i][j] * this.speed * dt) * this.sustain;
      }
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setSustain(s: number) {
    this.sustain = s;
  }

  getZValues(): number[][] {
    return this.z;
  }
}
