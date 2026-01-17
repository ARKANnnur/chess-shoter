<script setup lang="ts">
import { onMounted } from "vue";
import { useTresContext } from "@tresjs/core";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import * as THREE from "three";

interface Props {
  /**
   * Path to HDR file
   * @example "/backgrounds/blinds_1k.hdr"
   */
  path: string;
}

const props = defineProps<Props>();

const { scene } = useTresContext();

onMounted(() => {
  if (!scene.value) {
    console.warn("Scene not ready yet");
    return;
  }

  const rgbeLoader = new RGBELoader();

  console.log(`🔄 Loading HDR: ${props.path}`);

  rgbeLoader.load(
    props.path,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // Set as background
      scene.value!.background = texture;

      // Set as environment (for realistic lighting & reflections)
      scene.value!.environment = texture;

      console.log("✅ HDR background loaded with environment lighting");
    },
    (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Loading HDR: ${percent.toFixed(1)}%`);
    },
    (error) => {
      console.error("❌ Error loading HDR:", error);
    }
  );
});
</script>

<template>
  <!-- This component doesn't render anything visible -->
</template>
