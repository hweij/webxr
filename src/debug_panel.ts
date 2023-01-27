import * as THREE from "three";
import { Scene, Texture } from "three";

export class DebugPanel {
  object3D = new THREE.Object3D();
  debugCanvas = document.createElement('canvas');
  debugTexture: Texture;

  constructor(scene: Scene, width: number, height: number) {
    this.debugTexture =  new Texture(this.debugCanvas);
    this.debugCanvas.width = width;
    this.debugCanvas.height = height;
    const ctx = this.debugCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('HELLO', 10, 10);
    }
    // Create texture from canvas
    // const tex = new Texture(debugCanvas);
    this.debugTexture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: this.debugTexture });
    const sprite = new THREE.Sprite( material );
    this.object3D = new THREE.Object3D();
    this.object3D.add(sprite);
    scene.add(this.object3D);
  }

  setMessage(msg: string | string[]) {
    const lines = (typeof msg === 'string') ? [msg] : msg;
    const ctx = this.debugCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0,0,this.debugCanvas.width, this.debugCanvas.height);
      ctx.fillStyle = '#ff0000';
      for (let i=0; i<lines.length; i++) {
        ctx.fillText(lines[i], 4, 10 * i + 10);
      }
      this.debugTexture.needsUpdate = true;
    }
  }
}
