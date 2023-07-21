import * as THREE from 'three';
import { Scene, Vector3 } from "three";
import { GameContext, GameObject } from './game_object';

// Max age in seconds after which the ball is removed
const MAX_BALL_AGE = 3;

type Ball = {
  direction: Vector3;
  mesh: THREE.Mesh;
  age: number;
}
const balls: (Ball | undefined)[] = [];
var numBalls = 0;
const sphereMeshes = [0xffffff, 0x00ff00, 0xff0000].map(c => new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({ color: c })));
var meshIndex = 0;

/** Balls that can be shot into a direction **/
export class Balls implements GameObject {
  add(scene: Scene, pos: Vector3, direction: Vector3) {
    const sphere = sphereMeshes[meshIndex].clone();
    sphere.position.set(pos.x, pos.y, pos.z);
    scene.add(sphere);
    balls[numBalls] = { direction: direction, mesh: sphere, age: 0 };
    numBalls++;
  }

  tick(context: GameContext) {
    let i = 0;
    while (i<numBalls) {
      const ball = balls[i]!;
      ball.age += context.dt;
      if (ball.age > MAX_BALL_AGE) {
        ball.mesh.parent?.remove(ball.mesh);
        balls[i] = balls[numBalls - 1];
        balls[numBalls - 1] = undefined;
        numBalls--;
      }
      else {
        ball.mesh.position.addScaledVector(ball.direction, -context.dt * 10);
        // Gravity
        ball.direction.y += context.dt * 1;
        i++;
      }
    }
  }

  nextColor() {
    meshIndex = (meshIndex + 1) % sphereMeshes.length;
    return sphereMeshes[meshIndex].material.color;
  }
}
