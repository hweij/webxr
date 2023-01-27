import * as THREE from 'three';
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer, XRTargetRaySpace } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { Balls } from './balls';
import { DebugPanel } from './debug_panel';
import { Inputs } from './inputs';

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
var controllerR: XRTargetRaySpace;
var controllerL: XRTargetRaySpace;

const balls = new Balls();
const inputs = new Inputs();
let debugPanel: DebugPanel | undefined;

// var orbitControls: OrbitControls;
var avatar: THREE.Group;

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

  debugPanel = new DebugPanel(scene, 256, 256);
  debugPanel.object3D.position.set(0, 1, -1);

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

    // Update inputs and show the state
    if (frame?.session?.inputSources) {
      inputs.update(frame.session.inputSources);

      const right = inputs.right;
      debugPanel?.setMessage([
        `trigger: ${right.trigger.pressed} (${right.trigger.value.toFixed(2)})`,
        `grab: ${right.grab.pressed} (${right.grab.value.toFixed(2)})`,
        `A/X: ${right.ax}`,
        `B/Y: ${right.by}`,
        `joystick: (${right.thumb.x.toFixed(2)}, ${right.thumb.y.toFixed(2)}) ${right.thumb.pressed ? 'pressed' : ''}`
      ]);
      if (right.thumb.y) {
        if (right.grab.pressed) {
          avatar.position.addScaledVector(new Vector3(0, right.thumb.y, 0), dt);
        }
        else {
          const direction = new Vector3();
          avatar.getWorldDirection(direction);
          avatar.position.addScaledVector(direction, dt * right.thumb.y);
        }
      }
      if (right.thumb.x) {
        avatar.rotateY(-right.thumb.x * dt);
      }
    }
  }
  _lastTime = time;

  renderer.render(scene, camera);
}
