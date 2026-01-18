// camera/FPSMovement.ts
import * as THREE from 'three';

export function createFPSMovement(settings = {}) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  const config = {
    speed: 5,
    jumpForce: 5,
    gravity: 20,
    groundY: 0.5,
    ...settings,
  };

  let isJumping = false;

  const update = (
    delta: number,
    camera: THREE.PerspectiveCamera,
    keys: Record<string, boolean>
  ) => {
    direction.set(0, 0, 0);

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    if (keys['w']) direction.add(forward);
    if (keys['s']) direction.sub(forward);
    if (keys['d']) direction.sub(right);
    if (keys['a']) direction.add(right);

    if (direction.length() > 0) direction.normalize();

    velocity.x = direction.x * config.speed;
    velocity.z = direction.z * config.speed;

    if (keys[' '] && !isJumping && camera.position.y <= config.groundY + 0.01) {
      velocity.y = config.jumpForce;
      isJumping = true;
    }

    velocity.y -= config.gravity * delta;

    camera.position.addScaledVector(velocity, delta);

    if (camera.position.y < config.groundY) {
      camera.position.y = config.groundY;
      velocity.y = 0;
      isJumping = false;
    }
  };

  return { update };
}
