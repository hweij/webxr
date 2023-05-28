import * as THREE from 'three';
import { Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { startSession, updateControllers } from './webxr/webxr_helper';

import { Balls } from './balls';
import { ColorBoard } from './color_board';
import { DebugPanel } from './debug_panel';
import { Inputs } from './inputs';
// import { WaveTexture } from './wave_texture';
// import { Snow } from './snow';
// import { NUM_FLAKES, SnowGpu } from './snow/snow_gpu';
import { GameObject } from './game_object';
import { Teleport } from './teleport';
import { Office } from './rooms/office/office';
import { Radio } from './objects/radio';
import { Graph } from './objects/graph';
import { createGraphLine } from './graphline/graphline';
import { loadVitals } from './wfdb/wfdb';
import { MovementControl } from './movement_control';
import { RaycastHelper } from './raycast_helper';
// import { createGraphLine, getGraphLinePoints } from './graphline/graphline';

let camera: PerspectiveCamera;
let scene: Scene;

let movementControl: MovementControl;

let renderer: WebGLRenderer;

/** Controller associated with the right hand */
var controllerL: Object3D;
/** Controller associated with the left hand */
var controllerR: Object3D;

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

var raycastHelper: RaycastHelper = new RaycastHelper();
var raycastTargetList: THREE.Object3D[] = [];

var balls: Balls;
var pivotMaterial: THREE.MeshStandardMaterial;

init();
animate();

function addGameObject<T extends GameObject>(obj: T) {
  gameObjects.push(obj);
  return obj;
}

function init() {
  initScene();

  balls = addGameObject(new Balls());

  const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
  geometry.rotateX(- Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  pivotMaterial = new THREE.MeshStandardMaterial({ flatShading: true });

  const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3), pivotMaterial);
  pivot.name = 'pivot';
  pivot.position.z = -0.05;
  mesh.add(pivot);

  controllerL = mesh.clone();
  avatar.add(controllerL);

  controllerR = mesh.clone();
  avatar.add(controllerR);

  teleport = new Teleport(scene);
  
  window.addEventListener('resize', onWindowResize);
}

function addToScene(obj: Object3D, raycast: boolean) {
  scene.add(obj);
  if (raycast && (raycastTargetList.indexOf(obj) < 0)) {
    raycastTargetList.push(obj);
  }
}

function initScene() {
  const container = document.getElementById("webgl-container");
  if (!container) {
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  /** Camera */
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  // Initialize at 1.8m height (only for non-VR)
  camera.position.set(0, 1.8, 1);
  // Layer 3 is used for objects that should be visible, but not raycasted
  // camera.layers.enable(3);

  /** Avatar, for VR use */
  avatar = new THREE.Group();
  avatar.add(camera);
  scene.add(avatar);

  // TEST TEST: audio
  let radio: Radio;

  /** Animated lava texture */
  // const waveTexture = addGameObject(new WaveTexture(64, 64));

  /** Lava box, uses wave texture */
  // const lavaBox = createBox(waveTexture.texture);
  // lavaBox.position.y = 0.35;
  // lavaBox.position.z = -0.85;
  // physicalWorld.add(lavaBox);

  /** Office room */
  const office = new Office();
  addToScene(office.node, true);
  office.node!.position.set(0, 0.01, 0);
  addGameObject(office);

  // TEST LINES
  // getOutlinePoints(new Vector2(0, 0), new Vector2(1, -3), new Vector2(2, 0), 1);
  // const flatLine = createFlatLine();
  // flatLine.position.set(0, 1.0, -1.5)
  // scene.add(flatLine);

  // getGraphLinePoints(new Vector2(0, 0), new Vector2(1, -3), new Vector2(2, 0), 1);
  {
    // const graphLine = createGraphLine();
    async function loadData() {
      const vitals = await loadVitals(`/wfdb/bidmc01.hea`);
      if (!vitals) {
        return;
      }
      const { header, signals } = vitals;

      console.log(header);
      console.log(`Converted to ${signals.length} values`);

      for (let i = 0; i < signals.length; i++) {
        const data = Array.from(signals[i].map(v => v * 0.1));
        const graphLine = createGraphLine(data, 0.005, 0.005, 1000);
        graphLine.position.set(0, i * 0.3 + 0.5, -1.5)
        scene.add(graphLine);
      }
    }
    loadData();
  }

  debugPanel = new DebugPanel(camera, 256, 256);
  debugPanel.object3D.position.set(0, 0, -2);

  /** Floor with a pattern */
  const floor = createFloor(floorPattern.texture);
  addToScene(floor, true);

  // let landscape;
  // { // LANDSCAPE TEST
  //   const geo = createLandscape(10, 10, 40);
  //   landscape = new Mesh(geo, new MeshLambertMaterial({color: "#ffcccc", flatShading: true }));
  //   landscape.rotation.x = -Math.PI/2;
  //   landscape.position.set(0, 1, -1);
  //   // Note: when adding this to the physical world, the calculation of the
  //   // snow drop positions takes very long (1 raycast per flake).
  //   // physicalWorld.add(landscape);
  //   scene.add(landscape);
  //   // landscape.updateMatrixWorld();
  // }

  { // Graph test
    const graph = new Graph(0.01, 0xff0000);
    graph.mesh.position.set(0, 1, -1.5);
    scene.add(graph.mesh);

    const graph2 = new Graph(0.01, 0x00ff00);
    graph2.mesh.position.set(0, 1.6, -1.5);
    scene.add(graph2.mesh);
  }

  { // Lighting
    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0.5, 1, 0.3);
    scene.add(light);
  }

  // /** Snow (GPU-version) */
  // const snow = addGameObject(new SnowGpu());
  // snow.setParent(scene);
  // // Set snow targets by using raycasting to the ground
  // {
  //   const instancepos = new Float32Array(NUM_FLAKES * 3);
  //   const rc = new Raycaster();
  //   rc.near = 0.1;
  //   rc.far = 10.0;
  //   const rdir = new Vector3(0, -1, 0);
  //   for (let i = 0; i < NUM_FLAKES; i++) {
  //     const rpos = new Vector3(Math.random() * 10 - 5, 10, Math.random() * 10 - 5);
  //     rc.set(rpos, rdir);
  //     const intersects = rc.intersectObjects(raycastTargetList);
  //     let y = 0;
  //     if (intersects.length) {
  //       y = intersects[0].point.y;
  //     }
  //     const offs = i * 3;
  //     instancepos[offs] = rpos.x;
  //     instancepos[offs + 1] = y + 0.01;
  //     instancepos[offs + 2] = rpos.z;
  //   }
  //   snow.setTargetPositions(instancepos);
  // }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  /** For non-VR control */
  movementControl = new MovementControl(avatar, camera, renderer.domElement);

  { // Button to enable VR
    const bStartSession = document.getElementById("bStartSession")!;
    bStartSession.onclick = () => {
      startSession(
        renderer,
        () => {
          const session = renderer.xr.getSession();
          if (session) {
            session.onselectstart = (evt: XRInputSourceEvent) => {
              if (evt.inputSource.handedness === "right") {
                const pos = new Vector3();
                controllerR.getWorldPosition(pos);
                const direction = new Vector3();
                controllerR.getWorldDirection(direction);
                balls.add(scene, pos, direction);
              }
            };
            session.onsqueezestart = (evt: XRInputSourceEvent) => {
              if (evt.inputSource.handedness === "right") {
                const color = balls.nextColor();
                pivotMaterial.color.set(color);
              }
            }
          }
        },
        () => { });
    }
    const bNoVR = document.getElementById("bNoVR")!;
    bNoVR.onclick = () => {
      container.removeChild(bNoVR);
      container.removeChild(bStartSession);
    }
  }

  {
    const play = document.createElement("button");
    play.innerText = "Play";
    play.style.cssText = "position: absolute; bottom: 20px; left: 200px;";
    play.onclick = () => {
      if (!radio) {
        radio = new Radio(scene, camera);
      }
      debugPanel?.setMessage('Playing radio');
    };
    document.body.appendChild(play);
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
      const dir = new THREE.Vector3();
      controllerR.getWorldDirection(dir);
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

    movementControl.update(dt);

    teleport?.teleportOnThumb(inputs.right.thumb.y, avatar.position, raycastTargetList, controllerR);

    // TEST: trigger handlers with raycast
    raycastHelper.triggerHandlers(raycastTargetList, controllerR);
  }

  _lastTime = time;

  // Update WebXR controllers for this frame
  updateControllers(renderer, frame, controllerL, controllerR);

  renderer.render(scene, camera);
}

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
