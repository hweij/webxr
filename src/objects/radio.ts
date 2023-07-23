import * as THREE from "three";
import { Camera } from "three";

import { GameObject3D } from "../game_frame";

// Some radio URLs
// https://garfnet.org.uk/cms/tables/radio-frequencies/internet-radio-player/
// const soundUrl = 'https://stream.live.vc.bbcmedia.co.uk/bbc_1xtra';
const soundUrl = 'http://media-ice.musicradio.com/CapitalMP3';

// const soundUrl = '/music/Laurent Garnier - Man with the Red Face.mp3';

export class Radio extends GameObject3D {
    constructor(camera: Camera) {
        super(createMesh());

        this.interactions.grab = true;

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        const sound = new THREE.PositionalAudio(listener);

        this.connectViaElement(sound, soundUrl);

        // finally add the sound to the mesh
        this.node.add(sound);
    }

    get mesh() {
        return this.node as THREE.Mesh;
    }

    connectViaLoader(sound: THREE.PositionalAudio) {
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(soundUrl, function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(1);
            sound.setRolloffFactor(4);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
    }

    connectViaElement(audio: THREE.PositionalAudio, url: string) {
        const mediaElement = new Audio(url);
        // To allow cross-origin source
        mediaElement.crossOrigin = "anonymous";
        // mediaElement.crossOrigin = "anonymous";
        mediaElement.play();

        audio.setMediaElementSource(mediaElement);
    }
}

function createMesh() {
    // create an object for the sound to play from
    const sphere = new THREE.SphereGeometry(0.2, 32, 16);
    const material = new THREE.MeshPhongMaterial({ color: 0xff2200 });

    const mesh = new THREE.Mesh(sphere, material);

    return mesh;
}
