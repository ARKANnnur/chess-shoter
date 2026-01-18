<script setup lang="ts">
import { onMounted } from 'vue';
import { useTresContext } from '@tresjs/core';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import * as THREE from 'three';

interface Props {
  path: string;
}

const props = defineProps<Props>();

const { scene } = useTresContext();

onMounted(() => {
  if (!scene.value) {
    console.warn('Scene not ready yet');
    return;
  }

  const rgbeLoader = new HDRLoader();

  console.log(`🔄 Loading HDR: ${props.path}`);

  rgbeLoader.load(
    props.path,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // Set as background
      scene.value!.background = texture;

      // Set as environment (for realistic lighting & reflections)
      scene.value!.environment = texture;

      console.log('✅ HDR background loaded with environment lighting');
    },
    (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Loading HDR: ${percent.toFixed(1)}%`);
    },
    (error) => {
      console.error('❌ Error loading HDR:', error);
    }
  );
});
</script>

<template>
  <!-- This component doesn't render anything visible -->
</template>
