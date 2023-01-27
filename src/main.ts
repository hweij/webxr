import * as THREE from 'three';
import { PerspectiveCamera, Scene, Texture, Vector3, WebGLRenderer, XRTargetRaySpace } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Balls } from './balls';

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
var controllerR: XRTargetRaySpace;
var controllerL: XRTargetRaySpace;

const balls = new Balls();

// var orbitControls: OrbitControls;
var avatar: THREE.Group;

let debugMessage = new THREE.Object3D();
let debugCanvas = document.createElement('canvas');
let debugTexture = new Texture(debugCanvas);

init();
animate();

function init() {
  initScene();

  function createBall() {
    const pivot = controllerR.getObjectByName('pivot');
    if (pivot) {
      const pos = new Vector3();
      pivot.getWorldPosition(pos);
      const direction = new Vector3();
      controllerR.getWorldDirection(direction);
      balls.add(scene, pos, direction);
    }
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

  controllerR.addEventListener( 'connected', ( event ) => {
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
    pivot.position.z = - 0.05;
    mesh.add(pivot);

    controllerR.addEventListener('selectstart', onSelectStart);
    controllerR.addEventListener('selectend', onSelectEnd);
    controllerR.addEventListener('squeezestart', onSqueezeStart);
    controllerR.addEventListener('squeezeend', onSqueezeEnd);
    controllerR.addEventListener('selectstart', createBall);
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
  } );

  window.addEventListener('resize', onWindowResize);
}

function initScene() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.set(0, 1.6, 3);

  avatar = new THREE.Group();
  avatar.add(camera);
  scene.add(avatar);

  const tableGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 1.0,
    metalness: 0.0
  });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.y = 0.35;
  table.position.z = -0.85;
  scene.add(table);

  { // DEBUGGING
    debugCanvas.width = 256;
    debugCanvas.height = 256;
    const ctx = debugCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('HELLO', 10, 10);
    }
    // Create texture from canvas
    // const tex = new Texture(debugCanvas);
    debugTexture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: debugTexture });
    const sprite = new THREE.Sprite( material );
    debugMessage = new THREE.Object3D();
    debugMessage.add(sprite);
    debugMessage.position.set(0, 1, -1);
    scene.add(debugMessage);
  }

  scene.add(debugMessage);

  const floorGometry = new THREE.PlaneGeometry(4, 4);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 1.0,
    metalness: 0.0
  });
  const floor = new THREE.Mesh(floorGometry, floorMaterial);
  floor.rotation.x = - Math.PI / 2;
  floor.position.y = 0.05;
  scene.add(floor);

  const grid = new THREE.GridHelper(10, 20, 0x111111, 0x111111);
  // grid.material.depthTest = false; // avoid z-fighting
  scene.add(grid);

  scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 4, 0);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(VRButton.createButton(renderer));
}

function setMessage(msg: string | string[]) {
  const lines = (typeof msg === 'string') ? [msg] : msg;
  const ctx = debugCanvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0,0,debugCanvas.width, debugCanvas.height);
    ctx.fillStyle = '#ff0000';
    for (let i=0; i<lines.length; i++) {
      ctx.fillText(lines[i], 4, 10 * i + 10);
    }
    debugTexture.needsUpdate = true;
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

var _lastTime = 0;
function render(time: number, frame: XRFrame) {
  if (_lastTime) {
    const dt = (time - _lastTime) * 0.001;

    // Update balls
    balls.tick(scene, dt);

    // Update inputs
    if (frame?.session) {
      for (const source of frame.session.inputSources) {
        if (source.handedness === 'right') {
          const gamepad = source.gamepad;
          if (gamepad) {
            const bTrigger = gamepad.buttons[0].pressed;
            const vTrigger = gamepad.buttons[0].value;
            const bGrab = gamepad.buttons[1].pressed;
            const vGrab = gamepad.buttons[1].value;
            const bJoy = gamepad.buttons[3].pressed;
            const bAX = gamepad.buttons[4].pressed;
            const bBY = gamepad.buttons[5].pressed;
            const joyX = gamepad.axes[2];
            const joyY = gamepad.axes[3];
            setMessage([
              `trigger: ${bTrigger} (${vTrigger.toFixed(2)})`,
              `grab: ${bGrab} (${vGrab.toFixed(2)})`,
              `A/X: ${bAX}`,
              `B/Y: ${bBY}`,
              `joystick: (${joyX.toFixed(2)}, ${joyY.toFixed(2)}) ${bJoy ? 'pressed' : ''}`
            ]);
            if (joyY) {
              if (bGrab) {
                avatar.position.addScaledVector(new Vector3(0, joyY, 0), dt);
              }
              else {
                const direction = new Vector3();
                avatar.getWorldDirection(direction);
                avatar.position.addScaledVector(direction, dt * joyY);
              }
            }
            if (joyX) {
              avatar.rotateY(-joyX * dt);
            }
          }
          else {
            setMessage('no gamepad');
          }
        }
      }
    }
  }
  _lastTime = time;

  renderer.render(scene, camera);
}
