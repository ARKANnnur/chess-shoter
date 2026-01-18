// camera/FPSCameraController.ts
import { useLoop, useTres } from '@tresjs/core';
import * as THREE from 'three';
import { useFPSInput } from '@/infrastructure/input/FPSInput';
import { createFPSMovement } from '@/domain/rules/FPSMovement';

export function useFPSCameraController(settings = {}) {
  const { camera } = useTres();
  const input = useFPSInput();
  const movement = createFPSMovement(settings);

  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const sensitivity = settings.mouseSensitivity ?? 0.002;

  // useLoop provides `onBeforeRender`, runs each frame inside TresCanvas
  const { onBeforeRender } = useLoop();

  onBeforeRender(({ delta }) => {
    if (!camera.value) return;

    // rotation
    euler.setFromQuaternion(camera.value.quaternion);
    euler.y -= input.mouseDelta.x * sensitivity;
    euler.x -= input.mouseDelta.y * sensitivity;
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    camera.value.quaternion.setFromEuler(euler);

    input.resetMouseDelta();

    // movement
    movement.update(delta, camera.value, input.keys.value);
  });

  return {
    lockPointer: input.lockPointer,
    isPointerLocked: input.isPointerLocked,
  };
}
