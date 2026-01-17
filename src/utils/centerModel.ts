import * as THREE from "three";

export interface CenterModelOptions {
  /**
   * Reset rotation ke (0, 0, 0)
   * @default true
   */
  resetRotation?: boolean;

  /**
   * Reset position ke (0, 0, 0)
   * @default true
   */
  resetPosition?: boolean;

  /**
   * Center geometry (adjust vertices)
   * @default true
   */
  centerGeometry?: boolean;

  /**
   * Enable console logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Helper untuk center model GLB/GLTF supaya perfect center di origin
 * Fix common Blender export issues (rotation & position offset)
 *
 * @param scene - Scene dari GLTF loader
 * @param options - Options untuk customize behavior
 *
 * @example
 * ```ts
 * const { scene } = await useGLTF('/models/pawn.glb')
 * centerModel(scene, { resetRotation: true, resetPosition: true })
 * ```
 */
export function centerModel(
  scene: THREE.Group | THREE.Scene,
  options: CenterModelOptions = {}
): void {
  const {
    resetRotation = true,
    resetPosition = true,
    centerGeometry = true,
    debug = false,
  } = options;

  scene.traverse((child) => {
    // Type guard: check if it's a Mesh
    if (child instanceof THREE.Mesh && child.geometry) {
      if (debug) {
        console.log(`🔧 Processing mesh: ${child.name}`);
      }

      // Reset rotation
      if (resetRotation) {
        child.rotation.set(0, 0, 0);
        if (debug) console.log(`  ✓ Rotation reset to (0, 0, 0)`);
      }

      // Center geometry
      if (centerGeometry) {
        if (debug) {
          child.geometry.computeBoundingBox();
          console.log("  Bounding box BEFORE center:", child.geometry.boundingBox);
        }

        child.geometry.center();

        if (debug) {
          child.geometry.computeBoundingBox();
          console.log("  Bounding box AFTER center:", child.geometry.boundingBox);
          console.log(`  ✓ Geometry centered`);
        }
      }

      // Reset position
      if (resetPosition) {
        child.position.set(0, 0, 0);
        if (debug) console.log(`  ✓ Position reset to (0, 0, 0)`);
      }
    }
  });

  if (debug) {
    console.log("✅ Model centering complete!");
  }
}
