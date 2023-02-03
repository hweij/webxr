import * as THREE from 'three';
import { Material, Scene, Vector3 } from "three";

const MAX_AGE = 5;

type Flake = {
  mesh: THREE.Mesh;
  age: number;
}
const flakes = new Array<Flake | undefined>(1000);
var numFlakes = 0;
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.02));

const down = new Vector3(0, -1, 0);

/** Snow flakes falling down **/
export class Snow {
  time = 0;

  private _add(scene: Scene, pos: Vector3) {
    const m = mesh.clone();
    m.material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true })
    m.position.set(pos.x, pos.y, pos.z);
    scene.add(m);
    flakes[numFlakes] = { mesh: m, age: 0 };
    numFlakes++;
  }

  tick(scene: Scene, dt: number) {
    this.time += dt;
    if (this.time >= 0.01) {
      this.time -= 0.01;
      if (numFlakes < (flakes.length - 1)) {
        this._add(scene, new Vector3(Math.random() * 10 - 5, 3, Math.random() * 10 - 5));
      }
    }
    let i = 0;
    while (i<numFlakes) {
      const flake = flakes[i]!;
      if (flake.age > 0) {
        (flake.mesh.material as Material).opacity = 1 - (flake.age / MAX_AGE);
        if (flake.age >= MAX_AGE) {
          scene.remove(flake.mesh);
          flakes[i] = flakes[numFlakes - 1];
          flakes[numFlakes - 1] = undefined;
          numFlakes--;
        }
        else {
          flake.age += dt;
          i++;
        }
      }
      else {
        if (flake.mesh.position.y <= 0) {
          flake.age = dt;
          flake.mesh.position.setY(0);
        }
        else {
          flake.mesh.rotateX(Math.random() - 0.5);
          flake.mesh.rotateZ(Math.random() - 0.5);
          flake.mesh.position.addScaledVector(down, dt);
        }
        i++;
      }
    }
  }
}
