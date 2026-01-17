<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  moveSpeed: number;
  mouseSensitivity: number;
  jumpForce: number;
  isPointerLocked: boolean;
}

const props = defineProps<Props>();

// Define emits for v-model
const emit = defineEmits<{
  "update:moveSpeed": [value: number];
  "update:mouseSensitivity": [value: number];
  "update:jumpForce": [value: number];
  lockPointer: [];
}>();

const showSettings = ref(false);

// Request pointer lock directly (must be called from user gesture)
const handleStartClick = () => {
  document.body.requestPointerLock();
};

// Toggle settings panel (press Escape to show)
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    showSettings.value = !showSettings.value;
  }
};

// Add event listener
onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <!-- Instructions overlay -->
  <div
    v-if="!isPointerLocked"
    style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      font-family: sans-serif;
      z-index: 1000;
      max-width: 400px;
    "
  >
    <h2 style="margin-top: 0">🎮 FPS Camera Controls</h2>
    <div style="text-align: left; margin: 20px 0">
      <p><strong>Move:</strong> WASD or Arrow Keys</p>
      <p><strong>Look:</strong> Mouse</p>
      <p><strong>Jump:</strong> Spacebar</p>
      <p><strong>Settings:</strong> ESC</p>
    </div>
    <button
      @click="handleStartClick"
      style="
        padding: 10px 20px;
        font-size: 16px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      "
    >
      Click to Start
    </button>
  </div>

  <!-- Settings panel (show when ESC pressed) -->
  <div
    v-if="showSettings && isPointerLocked"
    style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: sans-serif;
      z-index: 1000;
      min-width: 250px;
    "
  >
    <h3 style="margin-top: 0">⚙️ Camera Settings</h3>

    <div style="margin-bottom: 15px">
      <label style="display: block; margin-bottom: 5px">
        Move Speed: {{ props.moveSpeed.toFixed(1) }}
      </label>
      <input
        :value="props.moveSpeed"
        @input="emit('update:moveSpeed', parseFloat(($event.target as HTMLInputElement).value))"
        type="range"
        min="1"
        max="20"
        step="0.5"
        style="width: 100%"
      />
    </div>

    <div style="margin-bottom: 15px">
      <label style="display: block; margin-bottom: 5px">
        Mouse Sensitivity: {{ (props.mouseSensitivity * 1000).toFixed(1) }}
      </label>
      <input
        :value="props.mouseSensitivity"
        @input="emit('update:mouseSensitivity', parseFloat(($event.target as HTMLInputElement).value))"
        type="range"
        min="0.0005"
        max="0.005"
        step="0.0001"
        style="width: 100%"
      />
    </div>

    <div style="margin-bottom: 15px">
      <label style="display: block; margin-bottom: 5px">
        Jump Force: {{ props.jumpForce.toFixed(1) }}
      </label>
      <input
        :value="props.jumpForce"
        @input="emit('update:jumpForce', parseFloat(($event.target as HTMLInputElement).value))"
        type="range"
        min="2"
        max="15"
        step="0.5"
        style="width: 100%"
      />
    </div>

    <p style="font-size: 12px; opacity: 0.7; margin-bottom: 0">
      Press ESC to close
    </p>
  </div>

  <!-- HUD (top-left info) -->
  <div
    v-if="isPointerLocked"
    style="
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 14px;
      z-index: 999;
    "
  >
    <div>Speed: {{ props.moveSpeed.toFixed(1) }}</div>
    <div>Press ESC for settings</div>
  </div>
</template>
