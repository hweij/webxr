import { Camera, Object3D, Vector3 } from "three";

export class MovementControl {
  _avatar: Object3D;
  _camera: Camera;
  _domElement: HTMLElement;
  /** Map to register which keys are pressed */
  _keyMap: Map<string, boolean> = new Map();

  /** Enable camera control (tilting, rotation). Set this to false in VR-mode. */
  enableCameraControl = true;

  readonly _keyDownHandler = (ev: KeyboardEvent) => {
    this._keyMap.set(ev.key, true);
    console.log(ev.key);
  }

  readonly _keyUpHandler = (ev: KeyboardEvent) => {
    this._keyMap.set(ev.key, false);
  }

  readonly _pointerDownHandler = (ev: PointerEvent) => {
    this._keyMap.set("mouse" + ev.button, true);
    this._domElement.setPointerCapture(ev.pointerId);
  }

  readonly _pointerUpHandler = (ev: PointerEvent) => {
    this._keyMap.set("mouse" + ev.button, false);
    this._domElement.releasePointerCapture(ev.pointerId);
  }

  readonly _pointerMoveHandler = (ev: PointerEvent) => {
    const maxTilt = Math.PI * 0.5 - 0.001;
    if (this.enableCameraControl) {
      if (this._keyMap.get("mouse0")) {
        const dx = ev.movementX;
        const dy = ev.movementY;
        this._avatar.rotateY(dx * 0.01);
        this._camera.rotation.x = Math.min(maxTilt, Math.max(-maxTilt, this._camera.rotation.x + (dy * 0.01)));
      }
    }
  }

  /**
   * Creates a new movement controller.
   *
   * @param avatar The avatar to which the (VR) camera is attached
   * @param camera Camera, attached to the avatar
   * @param domElement Dom element for the app
   */
  constructor(avatar: Object3D, camera: Camera, domElement: HTMLElement) {
    this._avatar = avatar;
    this._camera = camera;
    this._domElement = domElement;

    window.addEventListener("keydown", this._keyDownHandler);
    window.addEventListener("keyup", this._keyUpHandler);
    this._domElement.addEventListener("pointerdown", this._pointerDownHandler);
    this._domElement.addEventListener("pointerup", this._pointerUpHandler);
    this._domElement.addEventListener("pointermove", this._pointerMoveHandler);
  }

  /**
   * Dispose resources.
   */
  dispose() {
    window.removeEventListener("keydown", this._keyDownHandler);
    window.removeEventListener("keyup", this._keyUpHandler);
    this._domElement.removeEventListener("pointerdown", this._pointerDownHandler);
    this._domElement.removeEventListener("pointerup", this._pointerUpHandler);
    this._domElement.removeEventListener("pointermove", this._pointerMoveHandler);
  }

  _keyPressed(key: string) {
    return this._keyMap.get(key);
  }

  update(delta: number) {
    if (this._keyPressed("ArrowUp")) {
      const dir = new Vector3();
      this._avatar.getWorldDirection(dir);
      dir.multiplyScalar(delta)
      this._avatar.position.sub(dir);
    }
    if (this._keyPressed("ArrowDown")) {
      const dir = new Vector3();
      this._avatar.getWorldDirection(dir);
      dir.multiplyScalar(delta)
      this._avatar.position.add(dir);
    }
    if (this._keyPressed("ArrowLeft")) {
      this._avatar.rotateY(delta);
    }
    if (this._keyPressed("ArrowRight")) {
      this._avatar.rotateY(-delta);
    }
  }
}