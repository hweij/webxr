import * as THREE from 'three';
import { Group, PerspectiveCamera, Scene, Vector3, WebGLRenderer, XRTargetRaySpace } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Balls } from './balls';
import { ColorBoard } from './color_board';
import { DebugPanel } from './debug_panel';
import { Inputs } from './inputs';
// import { WaveTexture } from './wave_texture';
// import { Snow } from './snow';
import { SnowGpu } from './snow_gpu';
import { GameObject } from './game_object';
import { Teleport } from './teleport';
import { Office } from './rooms/office/office';

let camera: PerspectiveCamera;
let controls: OrbitControls;
let scene: Scene;
/** Physical world contains all objects that are raycast targets. If not in this group, it will be ignored during raycasting. */
let physicalWorld: Group;
let renderer: WebGLRenderer;

var controllerR: XRTargetRaySpace;
var controllerL: XRTargetRaySpace;

var gameObjects: GameObject[] = [];

// Submodules
const inputs = new Inputs();
let debugPanel: DebugPanel;

const floorPattern = new ColorBoard(256, 256);
floorPattern.texture.generateMipmaps = true;
floorPattern.texture.minFilter = THREE.LinearMipmapLinearFilter;
floorPattern.texture.magFilter = THREE.LinearFilter;
floorPattern.texture.wrapS = THREE.RepeatWrapping;
floorPattern.texture.wrapT = THREE.RepeatWrapping;
floorPattern.texture.repeat.set(8, 8);
floorPattern.fill((_x, _y) => [0, Math.random() * 128 + 64, 0, 255]);

var avatar: THREE.Group;

var teleport: Teleport;

/** Set if running in VR mode (VRButton was pressed) */
let vrEnabled = false;

init();
animate();

function addGameObject<T extends GameObject>(obj: T) {
  gameObjects.push(obj);
  return obj;
}

function init() {
  initScene();

  const balls = addGameObject(new Balls());

  function createBall() {
    const pos = new Vector3();
    controllerR.getWorldPosition(pos);
    const direction = new Vector3();
    controllerR.getWorldDirection(direction);
    balls.add(scene, pos, direction);
  }

  function onSelectStart(evt: THREE.Event): void {
    const target = evt.target as XRTargetRaySpace;
    if (target) {
      target.userData.isSelecting = true;
    }
  }

  function onSelectEnd(evt: THREE.Event) {
    const target = evt.target as XRTargetRaySpace;
    if (target) {
      target.userData.isSelecting = false;
    }
  }

  function onSqueezeStart(evt: THREE.Event) {
    const target = evt.target as XRTargetRaySpace;
    if (target) {
      target.userData.isSqueezing = true;
    }
  }

  function onSqueezeEnd(evt: THREE.Event) {
    const target = evt.target as XRTargetRaySpace;
    if (target) {
      target.userData.isSqueezing = false;
    }
  }

  controllerR = renderer.xr.getController(0);
  controllerL = renderer.xr.getController(1);

  controllerR.addEventListener('connected', (event) => {
    if (event.data?.handedness !== 'right') {
      // Controller 0 is not the right-hand controller: swap them
      [controllerR, controllerL] = [controllerL, controllerR];
    }

    const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
    geometry.rotateX(- Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({ flatShading: true });
    const mesh = new THREE.Mesh(geometry, material);
    const pivotMaterial = new THREE.MeshStandardMaterial({ flatShading: true });

    const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3), pivotMaterial);
    pivot.name = 'pivot';
    pivot.position.z = -0.05;
    mesh.add(pivot);

    controllerR.addEventListener('selectstart', onSelectStart);
    controllerR.addEventListener('selectend', onSelectEnd);
    controllerR.addEventListener('squeezestart', onSqueezeStart);
    controllerR.addEventListener('squeezeend', onSqueezeEnd);
    controllerR.addEventListener('selectstart', createBall);
    //    controllerR.addEventListener('selectstart', teleport);
    controllerR.addEventListener('squeeze', () => {
      const color = balls.nextColor();
      pivotMaterial.color.set(color);
    });

    controllerL.addEventListener('selectstart', onSelectStart);
    controllerL.addEventListener('selectend', onSelectEnd);
    controllerL.addEventListener('squeezestart', onSqueezeStart);
    controllerL.addEventListener('squeezeend', onSqueezeEnd);

    avatar.add(controllerR);
    avatar.add(controllerL);

    controllerR.add(mesh.clone());
    controllerL.add(mesh.clone());

    teleport = new Teleport(scene);
  });

  window.addEventListener('resize', onWindowResize);
}

function initScene() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  physicalWorld = new THREE.Group();
  scene.add(physicalWorld);

  /** Camera */
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  // Initialize at 1.8m height (only for non-VR)
  camera.position.set(0, 1.8, 3);

  /** Avatar, for VR use */
  avatar = new THREE.Group();
  avatar.add(camera);
  scene.add(avatar);

  /** Animated lava texture */
  // const waveTexture = addGameObject(new WaveTexture(64, 64));

  /** Lava box, uses wave texture */
  // const lavaBox = createBox(waveTexture.texture);
  // lavaBox.position.y = 0.35;
  // lavaBox.position.z = -0.85;
  // physicalWorld.add(lavaBox);

  /** Office room */
  const office = new Office();
  office.setParent(physicalWorld);
  addGameObject(office);

  debugPanel = new DebugPanel(camera, 256, 256);
  debugPanel.object3D.position.set(0, 0, -2);

  /** Floor with a pattern */
  const floor = createFloor(floorPattern.texture);
  physicalWorld.add(floor);

  { // Lighting
    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0.5, 1, 0.5);
    scene.add(light);
  }

  /** Snow (GPU-version) */
  const snow = addGameObject(new SnowGpu());
  snow.setParent(scene);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  /** For non-VR control */
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  { // Button to switch to VR mode
    const vrButton = VRButton.createButton(renderer);
    vrButton.addEventListener('click', () => vrEnabled = true);
    document.body.appendChild(vrButton);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function tick(dt: number) {
  for (const obj of gameObjects) {
    obj.tick(dt);
  }
}

var _lastTime = 0;
function render(time: number, frame: XRFrame) {
  if (_lastTime) {
    const dt = (time - _lastTime) * 0.001;

    // Update inputs and show the state
    if (frame?.session?.inputSources) {
      inputs.update(frame.session.inputSources);

      const right = inputs.right;
      const dir = controllerR.getWorldDirection(new THREE.Vector3());
      debugPanel?.setMessage([
        `trigger: ${right.trigger.pressed} (${right.trigger.value.toFixed(2)})`,
        `grab: ${right.grab.pressed} (${right.grab.value.toFixed(2)})`,
        `A/X: ${right.ax}`,
        `B/Y: ${right.by}`,
        `joystick: (${right.thumb.x.toFixed(2)}, ${right.thumb.y.toFixed(2)}) ${right.thumb.pressed ? 'pressed' : ''}`,
        `direction: ${dir.x.toFixed(1)}, ${dir.y.toFixed(1)}, ${dir.z.toFixed(1)}`
      ]);
    }

    tick(dt);

    teleport?.teleportOnThumb(inputs.right.thumb.y, avatar.position, physicalWorld, controllerR);
  }
  _lastTime = time;

  if (!vrEnabled) {
    controls.update();
  }

  renderer.render(scene, camera);
}

// function createBox(tex: THREE.Texture) {
//   const geo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
//   const mat = new THREE.MeshBasicMaterial({
//     color: 0x777777,
//     map: tex
//   });
//   return new THREE.Mesh(geo, mat);
// }

function createFloor(tex: THREE.Texture) {
  const geo = new THREE.PlaneGeometry(10, 10);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x222222,
    map: tex
  });
  const floor = new THREE.Mesh(geo, mat);
  floor.rotation.x = - Math.PI / 2;
  floor.position.y = 0;
  return floor;
}