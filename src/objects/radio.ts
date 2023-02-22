import * as THREE from "three";
import { Camera, Scene } from "three";

export class Radio {
    constructor(scene: Scene, camera: Camera) {
        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add( listener );

        // create a global audio source
        const sound = new THREE.PositionalAudio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( '/music/Laurent Garnier - Man with the Red Face.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setRefDistance( 1 );
            sound.setRolloffFactor(4);
            sound.setLoop( true );
            sound.setVolume( 0.5 );
            sound.play();
        });

        // create an object for the sound to play from
        const sphere = new THREE.SphereGeometry( 0.2, 32, 16 );
        const material = new THREE.MeshPhongMaterial( { color: 0xff2200 } );
        const mesh = new THREE.Mesh( sphere, material );
        mesh.position.set(1, 1, -1);
        scene.add( mesh );

        // finally add the sound to the mesh
        mesh.add( sound );
    }
}
