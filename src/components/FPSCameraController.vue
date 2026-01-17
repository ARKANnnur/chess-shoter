<script setup lang="ts">
import { useFPSCamera } from "@/composables/useFPSCamera";

interface Props {
  moveSpeed: number;
  mouseSensitivity: number;
  jumpForce: number;
  enabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
});

const emit = defineEmits<{
  "update:moveSpeed": [value: number];
  "update:mouseSensitivity": [value: number];
  "update:jumpForce": [value: number];
  "update:isPointerLocked": [value: boolean];
  lockPointer: [];
}>();

// Initialize FPS camera (inside TresCanvas context)
const fpsCamera = useFPSCamera({
  moveSpeed: props.moveSpeed,
  mouseSensitivity: props.mouseSensitivity,
  jumpForce: props.jumpForce,
  enabled: props.enabled,
});

// Watch for changes and emit back to parent
import { watch } from "vue";

watch(
  () => fpsCamera.moveSpeed.value,
  (newVal) => {
    emit("update:moveSpeed", newVal);
  }
);

watch(
  () => fpsCamera.mouseSensitivity.value,
  (newVal) => {
    emit("update:mouseSensitivity", newVal);
  }
);

watch(
  () => fpsCamera.jumpForce.value,
  (newVal) => {
    emit("update:jumpForce", newVal);
  }
);

watch(
  () => fpsCamera.isPointerLocked.value,
  (newVal) => {
    emit("update:isPointerLocked", newVal);
  }
);

// Sync prop changes to composable
watch(
  () => props.moveSpeed,
  (newVal) => {
    fpsCamera.moveSpeed.value = newVal;
  }
);

watch(
  () => props.mouseSensitivity,
  (newVal) => {
    fpsCamera.mouseSensitivity.value = newVal;
  }
);

watch(
  () => props.jumpForce,
  (newVal) => {
    fpsCamera.jumpForce.value = newVal;
  }
);

// Expose lockPointer method
defineExpose({
  lockPointer: fpsCamera.lockPointer,
});
</script>

<template></template>
