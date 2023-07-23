import * as THREE from "three";
import { Object3D, Texture } from "three";

export interface PanelOptions {
  textColor?: string;
  backgroundColor?: string;
  /** Prevent ray cast hit */
  nohit?: boolean;
}

/** Panel for showing in-scene debug messages */
export class DebugPanel {
  object3D: THREE.Object3D;
  canvas: HTMLCanvasElement;
  tex: Texture;
  textColor: string;
  background?: string;

  constructor(parent: Object3D, width: number, height: number, options?: PanelOptions) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.textColor = options?.textColor || "#ffffff";
    this.background = options?.backgroundColor;
    this.tex =  new Texture(this.canvas);
    const material = new THREE.SpriteMaterial({ map: this.tex, depthTest: false });
    const sprite = new THREE.Sprite( material );
    // Prevent ray cast hit if requested
    if (options?.nohit) {
      sprite.userData.nohit = options.nohit;
    }
    this.object3D = new THREE.Object3D();
    this.object3D.add(sprite);
    parent.add(this.object3D);
    this.setMessage('debug');
  }

  setMessage(msg: string | string[]) {
    const lines = (typeof msg === 'string') ? [msg] : msg;
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.font = "10px roboto";
      if (this.background) {
        ctx.globalCompositeOperation = "copy";
        ctx.fillStyle = "#00000033";
        ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = "source-over";  
      }
      else {
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
      }
      ctx.fillStyle = this.textColor;
      for (let i=0; i<lines.length; i++) {
        ctx.fillText(lines[i], 4, 10 * i + 10);
      }
      this.tex.needsUpdate = true;
    }
  }
}
