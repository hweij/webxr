import { Camera, Object3D, Vector3 } from "three";

export class MovementControl {
  _avatar: Object3D;
  _camera: Camera;
  _domElement: HTMLElement;
  _keyMap: Set<string> = new Set<string>();

  keyDownHandler = (ev: KeyboardEvent) => {
    this._keyMap.add(ev.key);
    console.log(ev.key);
  }

  keyUpHandler = (ev: KeyboardEvent) => {
    this._keyMap.delete(ev.key);
  }

  constructor(avatar: Object3D, camera: Camera, domElement: HTMLElement) {
    this._avatar = avatar;
    this._camera = camera;
    this._domElement = domElement;

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  dispose() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }

  _keyPressed(key: string) {
    return this._keyMap.has(key);
  }

  update(delta: number) {
    if (this._keyPressed("ArrowUp")) {
      const dir = this._camera.getWorldDirection(new Vector3()).multiplyScalar(delta);
      this._avatar.position.add(dir);
    }
    if (this._keyPressed("ArrowDown")) {
      const dir = this._camera.getWorldDirection(new Vector3()).multiplyScalar(delta);
      this._avatar.position.sub(dir);
    }
    if (this._keyPressed("ArrowLeft")) {
      this._avatar.rotateY(delta);
    }
    if (this._keyPressed("ArrowRight")) {
      this._avatar.rotateY(-delta);
    }
  }
}