import * as THREE from "three";
import { Object3D, Scene, Texture } from "three";

/** Panel for showing in-scene debug messages */
export class DebugPanel {
  object3D = new THREE.Object3D();
  canvas = document.createElement('canvas');
  tex: Texture;

  constructor(parent: Object3D, width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.tex =  new Texture(this.canvas);
    const material = new THREE.SpriteMaterial({ map: this.tex });
    const sprite = new THREE.Sprite( material );
    this.object3D = new THREE.Object3D();
    this.object3D.add(sprite);
    parent.add(this.object3D);
    this.setMessage('debug');
  }

  setMessage(msg: string | string[], color = '#ffffff') {
    const lines = (typeof msg === 'string') ? [msg] : msg;
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
      ctx.fillStyle = color;
      for (let i=0; i<lines.length; i++) {
        ctx.fillText(lines[i], 4, 10 * i + 10);
      }
      this.tex.needsUpdate = true;
    }
  }
}
