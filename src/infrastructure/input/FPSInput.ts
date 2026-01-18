// camera/FPSInput.ts
import { ref } from 'vue';

export function useFPSInput() {
  const keys = ref<Record<string, boolean>>({});
  const isPointerLocked = ref(false);
  const mouseDelta = { x: 0, y: 0 };

  const onKeyDown = (e: KeyboardEvent) => {
    keys.value[e.key] = true;
  };

  const onKeyUp = (e: KeyboardEvent) => {
    keys.value[e.key] = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isPointerLocked.value) return;
    mouseDelta.x += e.movementX;
    mouseDelta.y += e.movementY;
  };

  const lockPointer = () => {
    document.body.requestPointerLock();
  };

  const onPointerLockChange = () => {
    isPointerLocked.value = document.pointerLockElement === document.body;
  };

  const resetMouseDelta = () => {
    mouseDelta.x = 0;
    mouseDelta.y = 0;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  return {
    keys,
    mouseDelta,
    isPointerLocked,
    lockPointer,
    resetMouseDelta,
  };
}
