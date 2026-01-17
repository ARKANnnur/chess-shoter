import { onMounted } from "vue";
import { useTresContext } from "@tresjs/core";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import * as THREE from "three";

/**
 * Composable untuk load HDR/EXR background dengan realistic lighting
 * Requires RGBELoader for .hdr files
 *
 * @param hdrPath - Path to HDR file (e.g., "/backgrounds/blinds_1k.hdr")
 *
 * @example
 * ```ts
 * useHDRBackground("/backgrounds/blinds_1k.hdr");
 * ```
 */
export function useHDRBackground(hdrPath: string) {
  const { scene } = useTresContext();

  onMounted(() => {
    if (!scene.value) {
      console.warn("Scene not ready yet");
      return;
    }

    const rgbeLoader = new RGBELoader();

    console.log(`🔄 Loading HDR: ${hdrPath}`);

    rgbeLoader.load(
      hdrPath,
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
}
