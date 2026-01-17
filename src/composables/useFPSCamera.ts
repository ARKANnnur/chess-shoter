import { onMounted, onUnmounted, ref, watch } from "vue";
import { useTresContext } from "@tresjs/core";
import * as THREE from "three";

export interface FPSCameraSettings {
  /**
   * Movement speed (units per second)
   * @default 5
   */
  moveSpeed?: number;

  /**
   * Mouse sensitivity (rotation speed)
   * @default 0.002
   */
  mouseSensitivity?: number;

  /**
   * Jump force
   * @default 5
   */
  jumpForce?: number;

  /**
   * Gravity force (downward acceleration)
   * @default 20
   */
  gravity?: number;

  /**
   * Enable/disable controls
   * @default true
   */
  enabled?: boolean;
}

/**
 * FPS Camera Controller
 * - WASD / Arrow keys untuk movement
 * - Tab untuk jump
 * - Mouse untuk look around
 */
export function useFPSCamera(settings: FPSCameraSettings = {}) {
  const {
    moveSpeed = 5,
    mouseSensitivity = 0.002,
    jumpForce = 5,
    gravity = 20,
    enabled = true,
  } = settings;

  const context = useTresContext();
  const camera = context.camera as any; // Type workaround for TresJS camera ref

  // Settings refs (adjustable)
  const moveSpeedRef = ref(moveSpeed);
  const mouseSensitivityRef = ref(mouseSensitivity);
  const jumpForceRef = ref(jumpForce);
  const gravityRef = ref(gravity);
  const enabledRef = ref(enabled);

  // Camera state
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const isJumping = ref(false);

  // Keyboard state
  const keys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    " ": false, // Spacebar untuk jump
  };

  // Mouse state
  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  const isPointerLocked = ref(false);

  // Ground level (pieces sit on board at Y ~ -0.5, camera should be above)
  const GROUND_LEVEL = 0.5; // Eye level height
  const MIN_Y = -0.3; // Lowest camera can go

  /**
   * Pointer lock (mouse capture)
   */
  const lockPointer = () => {
    document.body.requestPointerLock();
  };

  const onPointerLockChange = () => {
    isPointerLocked.value = document.pointerLockElement === document.body;
    console.log(`🔒 Pointer locked: ${isPointerLocked.value}`);
  };

  const onPointerLockError = () => {
    console.error("❌ Pointer lock error");
  };

  /**
   * Keyboard handlers
   */
  const onKeyDown = (event: KeyboardEvent) => {
    if (!enabledRef.value) return;

    if (event.key in keys) {
      keys[event.key] = true;
      console.log(`🎮 Key DOWN: ${event.key === " " ? "SPACE" : event.key}`);

      // Prevent default for Spacebar (jump)
      if (event.key === " ") {
        event.preventDefault();
      }
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key in keys) {
      keys[event.key] = false;
      console.log(`🎮 Key UP: ${event.key === " " ? "SPACE" : event.key}`);
    }
  };

  /**
   * Mouse movement handler
   */
  const onMouseMove = (event: MouseEvent) => {
    if (!enabledRef.value || !isPointerLocked.value) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    if (movementX !== 0 || movementY !== 0) {
      console.log(`🖱️ Mouse move: (${movementX}, ${movementY})`);
    }

    euler.setFromQuaternion(camera.value!.quaternion);

    euler.y -= movementX * mouseSensitivityRef.value;
    euler.x -= movementY * mouseSensitivityRef.value;

    // Clamp vertical rotation (-90° to 90°)
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

    camera.value!.quaternion.setFromEuler(euler);
  };

  /**
   * Update camera position (called every frame)
   */
  const update = (delta: number) => {
    if (!enabledRef.value || !camera.value) return;

    // Get forward/right directions
    const forward = new THREE.Vector3();
    camera.value.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.value.up, forward).normalize();

    // Reset direction
    direction.set(0, 0, 0);

    // WASD / Arrow keys movement
    if (keys.w || keys.ArrowUp) direction.add(forward);
    if (keys.s || keys.ArrowDown) direction.sub(forward);
    if (keys.d || keys.ArrowRight) direction.add(right);
    if (keys.a || keys.ArrowLeft) direction.sub(right);

    // Normalize diagonal movement
    if (direction.length() > 0) {
      direction.normalize();
      console.log(`📍 Moving - Direction: (${direction.x.toFixed(2)}, ${direction.z.toFixed(2)})`);
    }

    // Apply movement
    velocity.x = direction.x * moveSpeedRef.value;
    velocity.z = direction.z * moveSpeedRef.value;

    // Jump (Spacebar)
    if (keys[" "] && !isJumping.value && camera.value.position.y <= GROUND_LEVEL + 0.1) {
      velocity.y = jumpForceRef.value;
      isJumping.value = true;
      console.log(`🦘 Jump! velocity.y = ${velocity.y}`);
    }

    // Apply gravity
    velocity.y -= gravityRef.value * delta;

    // Log velocity before applying
    if (velocity.x !== 0 || velocity.z !== 0) {
      console.log(`⚡ Velocity: (${velocity.x.toFixed(2)}, ${velocity.z.toFixed(2)}), delta: ${delta.toFixed(3)}`);
    }

    // Update position
    const oldX = camera.value.position.x;
    const oldY = camera.value.position.y;
    const oldZ = camera.value.position.z;

    camera.value.position.x += velocity.x * delta;
    camera.value.position.z += velocity.z * delta;
    camera.value.position.y += velocity.y * delta;

    // Log actual position changes
    const deltaX = camera.value.position.x - oldX;
    const deltaY = camera.value.position.y - oldY;
    const deltaZ = camera.value.position.z - oldZ;

    if (deltaX !== 0 || deltaZ !== 0 || deltaY !== 0) {
      console.log(`📍 Camera moved by: (${deltaX.toFixed(4)}, ${deltaY.toFixed(4)}, ${deltaZ.toFixed(4)})`);
      console.log(`📍 Camera pos: (${camera.value.position.x.toFixed(2)}, ${camera.value.position.y.toFixed(2)}, ${camera.value.position.z.toFixed(2)})`);
    }

    // Ground collision
    if (camera.value.position.y < GROUND_LEVEL) {
      camera.value.position.y = GROUND_LEVEL;
      velocity.y = 0;
      isJumping.value = false;
    }

    // Don't go too low
    if (camera.value.position.y < MIN_Y) {
      camera.value.position.y = MIN_Y;
    }
  };

  /**
   * Animation loop
   */
  let animationFrameId: number;
  let lastTime = performance.now();
  let frameCount = 0;

  const animate = () => {
    const currentTime = performance.now();
    const delta = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    update(delta);

    // Log every 60 frames (roughly every second)
    frameCount++;
    if (frameCount % 60 === 0) {
      console.log(`🎬 Animation running, frame: ${frameCount}, delta: ${delta.toFixed(3)}s`);
    }

    animationFrameId = requestAnimationFrame(animate);
  };

  /**
   * Setup - Split into two phases
   */
  let cameraSetupComplete = false;

  onMounted(() => {
    // Phase 1: Setup event listeners immediately (don't need camera)
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("pointerlockerror", onPointerLockError);

    console.log("✅ FPS Camera event listeners ready");

    // Phase 2: Wait for camera to become available for controls
    const stopWatch = watch(
      () => camera.value,
      (cam) => {
        if (!cam || cameraSetupComplete) return;

        console.log("✅ FPS Camera controls ready");

        // Set initial camera position
        cam.position.set(0, GROUND_LEVEL, 0);
        cam.rotation.set(0, 0, 0);

        // Start animation loop
        lastTime = performance.now();
        animate();

        cameraSetupComplete = true;
        stopWatch(); // Stop watching
      },
      { immediate: true }
    );
  });

  /**
   * Cleanup
   */
  onUnmounted(() => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("pointerlockchange", onPointerLockChange);
    document.removeEventListener("pointerlockerror", onPointerLockError);
    document.body.removeEventListener("click", lockPointer);

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // Release pointer lock
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  });

  return {
    // Settings (adjustable)
    moveSpeed: moveSpeedRef,
    mouseSensitivity: mouseSensitivityRef,
    jumpForce: jumpForceRef,
    gravity: gravityRef,
    enabled: enabledRef,

    // State
    isPointerLocked,
    isJumping,

    // Methods
    lockPointer,
  };
}
