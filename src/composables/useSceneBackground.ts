import { onMounted } from "vue";
import * as THREE from "three";
import { useTresContext } from "@tresjs/core";

export type BackgroundType = "color" | "texture" | "skybox" | "equirectangular";

export interface BackgroundOptions {
  /**
   * Type background
   * - 'color': solid color
   * - 'texture': 2D image background
   * - 'skybox': 6 cube faces (px, nx, py, ny, pz, nz)
   * - 'equirectangular': 360 panorama image (HDR/EXR/JPG)
   */
  type: BackgroundType;

  /**
   * Value:
   * - color: "#ff0000" atau 0xff0000
   * - texture: "/path/to/image.jpg"
   * - skybox: [px, nx, py, ny, pz, nz] array of 6 images
   * - equirectangular: "/path/to/panorama.hdr"
   */
  value: string | string[] | number;
}

/**
 * Composable untuk set background scene
 * Support: solid color, 2D texture, skybox, equirectangular/HDRI
 *
 * @example
 * ```ts
 * // Solid color
 * useSceneBackground({ type: 'color', value: '#87CEEB' })
 *
 * // 2D Image
 * useSceneBackground({ type: 'texture', value: '/bg.jpg' })
 *
 * // Skybox (6 images)
 * useSceneBackground({
 *   type: 'skybox',
 *   value: ['/px.jpg', '/nx.jpg', '/py.jpg', '/ny.jpg', '/pz.jpg', '/nz.jpg']
 * })
 *
 * // HDRI/Panorama
 * useSceneBackground({ type: 'equirectangular', value: '/sky.hdr' })
 * ```
 */
export function useSceneBackground(options: BackgroundOptions) {
  const { scene } = useTresContext();

  onMounted(() => {
    if (!scene.value) {
      console.warn("Scene not ready yet");
      return;
    }

    const textureLoader = new THREE.TextureLoader();

    switch (options.type) {
      case "color":
        // Solid color background
        if (typeof options.value === "string") {
          scene.value.background = new THREE.Color(options.value);
        } else if (typeof options.value === "number") {
          scene.value.background = new THREE.Color(options.value);
        }
        break;

      case "texture":
        // 2D flat image background
        if (typeof options.value === "string") {
          textureLoader.load(
            options.value,
            (texture) => {
              scene.value!.background = texture;
              console.log("✅ Background texture loaded");
            },
            undefined,
            (error) => {
              console.error("❌ Error loading background texture:", error);
            }
          );
        }
        break;

      case "skybox":
        // Cube map (6 faces)
        if (Array.isArray(options.value) && options.value.length === 6) {
          const cubeTextureLoader = new THREE.CubeTextureLoader();
          cubeTextureLoader.load(
            options.value as string[],
            (texture) => {
              scene.value!.background = texture;
              console.log("✅ Skybox loaded");
            },
            undefined,
            (error) => {
              console.error("❌ Error loading skybox:", error);
            }
          );
        } else {
          console.error("Skybox requires 6 images [px, nx, py, ny, pz, nz]");
        }
        break;

      case "equirectangular":
        // 360 panorama (HDR/EXR/JPG)
        if (typeof options.value === "string") {
          textureLoader.load(
            options.value,
            (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              scene.value!.background = texture;
              scene.value!.environment = texture; // Also set as environment map
              console.log("✅ Equirectangular background loaded");
            },
            undefined,
            (error) => {
              console.error("❌ Error loading equirectangular:", error);
            }
          );
        }
        break;

      default:
        console.warn(`Unknown background type: ${options.type}`);
    }
  });
}
