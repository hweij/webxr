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
import { GameContext, GameObject, GameObject3D } from './game_frame';
import { Teleport } from './teleport';
import { Office } from './rooms/office/office';
import { Radio } from './objects/radio';
// import { Graph } from './objects/graph';
import { createGraphLine } from './graphline/graphline';
import { MovementControl } from './movement_control';
import { RaycastHelper } from './raycast_helper';

import * as appContext from "./app_context";

// import { createGraphLine, getGraphLinePoints } from './graphline/graphline';

/** Button to start the VR session */
var bStartSession: HTMLElement;
/** Text to explain use of the program before starting VR */
var vrText: HTMLElement;

let camera: PerspectiveCamera;
let scene: Scene;

let movementControl: MovementControl;

let renderer: WebGLRenderer;

/** Controller associated with the right hand */
var controllerL: THREE.Group;
/** Controller associated with the left hand */
var controllerR: THREE.Group;
/** Innertia group */
var controllerInertia: THREE.Group;

var gameObjects: GameObject[] = [];

// Submodules
const inputs = new Inputs();
/** Registers if joystick is positioned at the left */
var joyLeft = false;
/** Registers if joystick is positioned at the right */
var joyRight = false;
let debugPanel: DebugPanel;

const floorPattern = new ColorBoard(256, 256);
floorPattern.texture.generateMipmaps = true;
floorPattern.texture.minFilter = THREE.LinearMipmapLinearFilter;
floorPattern.texture.magFilter = THREE.LinearFilter;
floorPattern.texture.wrapS = THREE.RepeatWrapping;
floorPattern.texture.wrapT = THREE.RepeatWrapping;
floorPattern.texture.repeat.set(8, 8);
floorPattern.fill((_x, _y) => [0, Math.random() * 128 + 64, 0, 255]);

var vrSupported = false;
var vrMode = false;

var avatar: THREE.Group;

var teleport: Teleport;

var raycastHelper: RaycastHelper = new RaycastHelper();
var raycastTargetList: THREE.Object3D[] = [];

var balls: Balls;
var pivotMaterial: THREE.MeshStandardMaterial;

init().then(() => animate());

function addGameObject<T extends GameObject>(obj: T) {
  gameObjects.push(obj);
  return obj;
}

async function init() {
  vrSupported = await navigator.xr?.isSessionSupported("immersive-vr") || false;
  await appContext.init();

  initScene();

  // TEST LINES
  {
    const vitals = appContext.wfdbData;
    if (vitals) {
      const signals = vitals.signals;
      for (let i = 0; i < signals.length; i++) {
        const data = Array.from(signals[i].map(v => v * 0.1));
        const graphLine = createGraphLine(data, 0.005, 0.005, 1000);
        graphLine.position.set(0, i * 0.3 + 0.5, -1.5)
        scene.add(graphLine);
      }
    }
  }

  balls = addGameObject(new Balls());

  const defaultControllerTool = createControllerMesh();

  controllerL = new THREE.Group();
  controllerL.add(defaultControllerTool.clone());
  avatar.add(controllerL);

  controllerR = new THREE.Group();
  controllerR.add(defaultControllerTool.clone());
  avatar.add(controllerR);

  teleport = addGameObject(new Teleport(scene));

  // Add ray to controller
  const rayMesh = createRayMesh();
  controllerR.add(rayMesh);

  // Add inertia group to controller
  controllerInertia = new THREE.Group();
  avatar.add(controllerInertia);

  window.addEventListener('resize', onWindowResize);

  window.onmousemove = (evt: MouseEvent) => {
    if (!vrMode) {
      const intersections = raycastHelper.getMouseIntersections(raycastTargetList, camera, (evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
      const obj = raycastHelper.findGameObject(intersections);
      if (obj != hitObject) {
        if (hitObject) {
          hitObject.onRayExit();
        }
        hitObject = obj;
        if (hitObject) {
          hitObject.onRayEnter();
        }
      }  
    }
  }

  if (vrSupported) {
    vrText.innerText = "VR-capable browser and hardware detected.";
    bStartSession.innerText = "Click here to start VR session";
  }
  else {
    vrText.innerText = "No VR-capable browser and hardware detected.";
    bStartSession.innerText = "Click here to run anyway";
  }
  bStartSession.onclick = () => {
    vrMode = true;
    startSession(
      renderer,
      () => {
        const session = renderer.xr.getSession();
        if (session) {
          document.getElementById("ui-overlay")!.style.display = "none";
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
}

function createControllerMesh() {
  const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
  geometry.rotateX(- Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ flatShading: true });

  const mesh = new THREE.Mesh(geometry, material);
  pivotMaterial = new THREE.MeshStandardMaterial({ flatShading: true });

  const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.01, 3), pivotMaterial);
  pivot.name = 'pivot';
  pivot.position.z = -0.05;
  mesh.add(pivot);

  return mesh;
}

function createRayMesh() {
  const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xccccff, transparent: true, opacity: 0.5 });
  const rayGeo = new THREE.CylinderGeometry(0.003, 0.003, 10.0, 8, 1, true);
  rayGeo.translate(0, 5.0, 0);
  rayGeo.rotateX(-Math.PI * 0.5);

  return new THREE.Mesh(rayGeo, rayMaterial);
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
  scene.background = new THREE.Color(0xc3e9ff);
  // {
  //   const loader = new THREE.CubeTextureLoader();
  //   const texture = loader.load([
  //     'textures/sb_sun/px.jpg',
  //     'textures/sb_sun/nx.jpg',
  //     'textures/sb_sun/py.jpg',
  //     'textures/sb_sun/ny.jpg',
  //     'textures/sb_sun/pz.jpg',
  //     'textures/sb_sun/nz.jpg'
  //   ]);
  //   scene.background = texture;
  // }

  /** Camera */
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  // Initialize at 1.8m height (only for non-VR)
  camera.position.set(0, 1.8, 1);

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

  // debugPanel = new DebugPanel(camera, 256, 256, { textColor: "#7777ff", backgroundColor: "#00000011"});
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

  vrText = document.getElementById("vrText")!;
  bStartSession = document.getElementById("bStartSession")!;

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

function tick(context: GameContext) {
  for (const obj of gameObjects) {
    obj.tick(context);
  }
}

var hitObject: GameObject3D | null = null;

// GRABBING
const grabDistance = 0.2;
var grabObject: GameObject3D | null = null;
var grabObjectParent: Object3D | null = null;
var grabbed = false;
var mixer: THREE.AnimationMixer;
var clipAction: THREE.AnimationAction;

var _lastTime = 0;

function render(millis: number, frame: XRFrame) {
  if (_lastTime) {
    const dt = (millis - _lastTime) * 0.001;

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
        `joystick: (${right.thumb.x.toFixed(2)} (${right.thumb.left} - ${right.thumb.right}), ${right.thumb.y.toFixed(2)}) ${right.thumb.pressed ? 'pressed' : ''}`,
        `direction: ${dir.x.toFixed(1)}, ${dir.y.toFixed(1)}, ${dir.z.toFixed(1)}`
      ]);
    }

    tick({ t: millis * 0.001, dt: dt });

    movementControl.update(dt);

    // Raycast, object selection
    let intersections: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];
    if (vrMode) {
      intersections = raycastHelper.getIntersections(raycastTargetList, controllerR);
      const obj = raycastHelper.findGameObject(intersections);
      if (obj != hitObject) {
        if (hitObject) {
          hitObject.onRayExit();
        }
        hitObject = obj;
        if (hitObject) {
          hitObject.onRayEnter();
        }
      }
    }

    { // Turning
      const STEP = Math.PI * 0.25;
      if (joyLeft !== inputs.right.thumb.left) {
        if (joyLeft) {
          // Rotate left
          avatar.rotateY(STEP);
        }
        joyLeft = inputs.right.thumb.left;
      }
      if (joyRight !== inputs.right.thumb.right) {
        if (joyRight) {
          // Rotate right
          avatar.rotateY(-STEP);
        }
        joyRight = inputs.right.thumb.right;
      }
    }

    // Grabbing
    if (inputs.right.grab.pressed !== grabbed) {
      if (inputs.right.grab.pressed) {
        // Only handle grabbable objects
        if (!hitObject || hitObject.interactions.grab) {
          grabObject = hitObject;
        }
        if (grabObject) {
          grabObjectParent = grabObject.node.parent;
          controllerInertia.attach(grabObject.node);
          // Reduce distance to controller. This should be animated.
          const from = grabObject.node.position;
          if (from.length() > grabDistance) {
            // Pull it near
            const target = (grabObject.node.position.clone()).normalize().multiplyScalar(grabDistance);
            const positionKF = new THREE.VectorKeyframeTrack('.position', [0, 0.5], [from.x, from.y, from.z, target.x, target.y, target.z], THREE.InterpolateSmooth);
            const clip = new THREE.AnimationClip('Action', 0.5, [positionKF]);
            mixer = new THREE.AnimationMixer(grabObject.node);
            clipAction = mixer.clipAction(clip);
            clipAction.setLoop(THREE.LoopOnce, 1);
            clipAction.clampWhenFinished = true;
            clipAction.play();
          }
        }
      }
      else {
        // Release grabbed object
        if (clipAction && !clipAction.paused && (clipAction.timeScale > 0)) {
          clipAction.timeScale = -1;
        }
        else {
          if (grabObjectParent && grabObject) {
            grabObjectParent.attach(grabObject.node);
          }
          grabObject = null;
          grabObjectParent = null;
        }
      }
      grabbed = inputs.right.grab.pressed;
    }

    mixer?.update(dt);

    // Restore original position if grab canceled
    if (clipAction && (clipAction.timeScale < 0) && clipAction.paused && grabObjectParent && grabObject) {
      grabObjectParent.attach(grabObject.node);
      grabObject = null;
      grabObjectParent = null;
    }

    // Controller inertia
    const tLerp = dt * 10;
    controllerInertia.position.lerp(controllerR.position, tLerp);
    controllerInertia.quaternion.slerp(controllerR.quaternion, tLerp);

    // TODO: lift teleport function to higher level and detect thumb-forward motion here
    teleport?.teleport(inputs.right.thumb.forward, avatar.position, intersections, controllerR);
  }

  _lastTime = millis;

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
  floor.userData.teleport = true;
  return floor;
}
