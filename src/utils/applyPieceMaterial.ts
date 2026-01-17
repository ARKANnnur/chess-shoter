import * as THREE from "three";

export type PieceTeam = "white" | "black";

export interface MaterialOptions {
  team: PieceTeam;
  /**
   * Custom color override (optional)
   */
  color?: string | number;
  /**
   * Material type
   * @default "standard"
   */
  materialType?: "standard" | "phong" | "toon";
  /**
   * Metalness (0-1) for PBR materials
   * @default 0.0 (wood is non-metallic)
   */
  metalness?: number;
  /**
   * Roughness (0-1) for PBR materials
   * @default 0.9 (wood is rough/matte)
   */
  roughness?: number;
}

/**
 * Preset colors untuk chess pieces (wooden style)
 */
const TEAM_COLORS = {
  white: {
    base: 0xf5deb3, // Light wood (wheat/beige)
    accent: 0xe8e8e8, // Light gray
  },
  black: {
    base: 0x4a3728, // Dark wood (walnut brown)
    accent: 0x404040, // Medium gray
  },
} as const;

/**
 * Apply material/shader ke chess piece berdasarkan team
 * Traverse semua meshes dan replace material-nya
 *
 * @param model - Three.js Group/Object3D
 * @param options - Material options (team, color, etc)
 *
 * @example
 * ```ts
 * const pawn = cloneModel('pawn');
 * applyPieceMaterial(pawn, { team: 'white' });
 * ```
 */
export function applyPieceMaterial(
  model: THREE.Group | THREE.Object3D,
  options: MaterialOptions
): void {
  const {
    team,
    color,
    materialType = "standard",
    metalness = 0.0, // Wood is non-metallic
    roughness = 0.9, // Wood is rough/matte
  } = options;

  // Get base color
  const baseColor = color !== undefined ? color : TEAM_COLORS[team].base;

  // Create material based on type
  let material: THREE.Material;

  switch (materialType) {
    case "phong":
      material = new THREE.MeshPhongMaterial({
        color: baseColor,
        shininess: 100,
        specular: 0x444444,
      });
      break;

    case "toon":
      material = new THREE.MeshToonMaterial({
        color: baseColor,
      });
      break;

    case "standard":
    default:
      material = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness,
        roughness,
        envMapIntensity: 1.0,
      });
      break;
  }

  // Traverse all meshes and apply material
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Dispose old material to prevent memory leaks
      if (child.material instanceof THREE.Material) {
        child.material.dispose();
      }

      // Apply new material
      child.material = material;

      // Enable shadows
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Helper untuk create white piece dengan material
 */
export function createWhitePiece(
  model: THREE.Group | THREE.Object3D,
  options?: Partial<MaterialOptions>
): void {
  applyPieceMaterial(model, {
    team: "white",
    ...options,
  });
}

/**
 * Helper untuk create black piece dengan material
 */
export function createBlackPiece(
  model: THREE.Group | THREE.Object3D,
  options?: Partial<MaterialOptions>
): void {
  applyPieceMaterial(model, {
    team: "black",
    ...options,
  });
}
