import * as THREE from 'three';
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer, XRTargetRaySpace } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let controller1: XRTargetRaySpace;
let controller2: XRTargetRaySpace;

let controls;

init();
animate();

const balls: THREE.Mesh[] = [];

function init() {
    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x222222 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 50 );
    camera.position.set( 0, 1.6, 3 );

    controls = new OrbitControls( camera, container );
    controls.target.set( 0, 1.6, 0 );
    controls.update();

    const tableGeometry = new THREE.BoxGeometry( 0.5, 0.8, 0.5 );
    const tableMaterial = new THREE.MeshStandardMaterial( {
        color: 0x444444,
        roughness: 1.0,
        metalness: 0.0
    } );
    const table = new THREE.Mesh( tableGeometry, tableMaterial );
    table.position.y = 0.35;
    table.position.z = 0.85;
    scene.add( table );

    const floorGometry = new THREE.PlaneGeometry( 4, 4 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
        color: 0x222222,
        roughness: 1.0,
        metalness: 0.0
    } );
    const floor = new THREE.Mesh( floorGometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    scene.add( floor );

    const grid = new THREE.GridHelper( 10, 20, 0x111111, 0x111111 );
    // grid.material.depthTest = false; // avoid z-fighting
    scene.add( grid );

    scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ) );

    const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light.position.set( 0, 4, 0 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( VRButton.createButton( renderer ) );

    // controllers

    function createBall() {
        const pivot = controller1.getObjectByName( 'pivot' );
        if (pivot) {
            const pos = new Vector3();
            pivot.getWorldPosition(pos);
            const geometry = new THREE.SphereGeometry( 0.01);
            const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
            const sphere = new THREE.Mesh( geometry, material );
            sphere.userData.direction = new Vector3();
            controller1.getWorldDirection(sphere.userData.direction);
            sphere.position.set(pos.x, pos.y, pos.z);
            scene.add( sphere );
            balls.push(sphere);    
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

    const onSqueezeStart = (evt: THREE.Event) => {
        const target = evt.target as XRTargetRaySpace;
        if (target) {
            target.userData.isSqueezing = true;
            target.userData.positionAtSqueezeStart = target.position.y;
            target.userData.scaleAtSqueezeStart = target.scale.x;
        }


    }

    function onSqueezeEnd(evt: THREE.Event) {
        const target = evt.target as XRTargetRaySpace;
        if (target) {
            target.userData.isSqueezing = false;
        }
    }

    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener('select', createBall);
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );
    controller1.addEventListener( 'squeezestart', onSqueezeStart );
    controller1.addEventListener( 'squeezeend', onSqueezeEnd );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );
    controller2.addEventListener( 'squeezestart', onSqueezeStart );
    controller2.addEventListener( 'squeezeend', onSqueezeEnd );
    scene.add( controller2 );

    //

    const geometry = new THREE.CylinderGeometry( 0.01, 0.02, 0.08, 5 );
    geometry.rotateX( - Math.PI / 2 );
    const material = new THREE.MeshStandardMaterial( { flatShading: true } );
    const mesh = new THREE.Mesh( geometry, material );

    const pivot = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.01, 3 ) );
    pivot.name = 'pivot';
    pivot.position.z = - 0.05;
    mesh.add( pivot );

    controller1.add( mesh.clone() );
    controller2.add( mesh.clone() );

    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    renderer.setAnimationLoop( render );
}

var _lastTime = 0;
function render(time: number, _frame: XRFrame) {
    if (_lastTime) {
        const dt = time - _lastTime;
        for (const ball of balls) {
            ball.position.addScaledVector(ball.userData.direction, -dt * 0.005);
        }    
    }
    _lastTime = time;

    renderer.render( scene, camera );
}
