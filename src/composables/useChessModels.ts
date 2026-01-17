import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { shallowRef, ref } from "vue";
import { centerModel } from "@/utils/centerModel";
import type * as THREE from "three";

export type ChessPiece = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | "board";

interface ModelCache {
  [key: string]: THREE.Group;
}

/**
 * Composable untuk load semua chess models secara efficient
 * Features:
 * - Parallel loading (semua model load sekaligus)
 * - Progress tracking
 * - Error handling
 * - Model caching (load 1x, clone berkali-kali)
 * - Centralized model management
 */
export function useChessModels() {
  const models = shallowRef<ModelCache>({});
  const isLoading = ref(true);
  const progress = ref(0);
  const errors = ref<string[]>([]);

  const modelPaths: Record<ChessPiece, string> = {
    pawn: "/models/pawn.glb",
    rook: "/models/rock.glb",
    knight: "/models/knight.glb",
    bishop: "/models/bishop.glb",
    queen: "/models/queen.glb",
    king: "/models/king.glb",
    board: "/models/board.glb",
  };

  /**
   * Load single model dengan error handling
   */
  const loadModel = (name: ChessPiece, path: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      loader.load(
        path,
        (gltf) => {
          // Center model
          centerModel(gltf.scene, {
            resetRotation: false,
            resetPosition: true,
            centerGeometry: true,
            debug: false,
          });

          console.log(`✅ ${name} loaded`);
          resolve(gltf.scene);
        },
        undefined,
        (error) => {
          console.error(`❌ Error loading ${name}:`, error);
          reject(error);
        }
      );
    });
  };

  /**
   * Load semua models secara parallel
   */
  const loadAllModels = async () => {
    isLoading.value = true;
    progress.value = 0;
    errors.value = [];

    const entries = Object.entries(modelPaths) as [ChessPiece, string][];
    const total = entries.length;
    let completed = 0;

    // Load semua models parallel dengan Promise.all
    const promises = entries.map(async ([name, path]) => {
      try {
        const model = await loadModel(name, path);

        // Update progress
        completed++;
        progress.value = Math.round((completed / total) * 100);

        return { name, model };
      } catch (error) {
        errors.value.push(`Failed to load ${name}`);
        return { name, model: null };
      }
    });

    const results = await Promise.all(promises);

    // Store loaded models
    const cache: ModelCache = {};
    results.forEach(({ name, model }) => {
      if (model) {
        cache[name] = model;
      }
    });

    models.value = cache;
    isLoading.value = false;

    console.log(`✅ All models loaded! (${completed}/${total})`);
    if (errors.value.length > 0) {
      console.warn("⚠️ Some models failed:", errors.value);
    }
  };

  /**
   * Clone model untuk create multiple instances
   * Lebih efficient daripada load ulang
   */
  const cloneModel = (piece: ChessPiece): THREE.Group | null => {
    const original = models.value[piece];
    if (!original) {
      console.warn(`Model ${piece} not loaded yet`);
      return null;
    }
    return original.clone();
  };

  /**
   * Get model reference (untuk render 1x)
   */
  const getModel = (piece: ChessPiece): THREE.Group | null => {
    return models.value[piece] || null;
  };

  return {
    models,
    isLoading,
    progress,
    errors,
    loadAllModels,
    cloneModel,
    getModel,
  };
}
