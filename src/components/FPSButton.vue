<script setup lang="ts">
import { useFPSCameraController } from '@/domain/services/FPSCameraController'

const fps = useFPSCameraController()
</script>

<template>
  <button @click="fps.lockPointer()">Enter FPS</button>
</template>
