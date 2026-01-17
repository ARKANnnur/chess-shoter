import * as THREE from "three";

/**
 * Board surface height (where pieces should sit)
 * Adjust this if your board model has different height
 */
const BOARD_SURFACE_Y = -0.5;

/**
 * Small gap to prevent z-fighting
 */
const Z_FIGHTING_GAP = 0.04;

/**
 * Get base height offset for chess piece supaya gak overlap dengan board
 * Calculate dari bounding box piece
 *
 * @param model - Chess piece model
 * @returns Y offset untuk position piece di atas board
 */
export function getPieceBaseHeight(
  model: THREE.Group | THREE.Object3D
): number {
  // Create bounding box
  const box = new THREE.Box3().setFromObject(model);

  // Get bottom offset (how much below origin the piece extends)
  const bottomOffset = -box.min.y;

  // Return Y position: board surface + gap + bottom offset
  return BOARD_SURFACE_Y + Z_FIGHTING_GAP + bottomOffset;
}

/**
 * Adjust piece position supaya duduk perfect di board surface
 *
 * @param model - Chess piece model
 * @param basePosition - Base XZ position [x, y, z]
 * @returns Adjusted position dengan proper Y height
 */
export function adjustPiecePosition(
  model: THREE.Group | THREE.Object3D,
  basePosition: [number, number, number]
): [number, number, number] {
  const [x, _y, z] = basePosition;

  // Calculate proper Y based on bounding box + board surface
  const properY = getPieceBaseHeight(model);

  return [x, properY, z];
}
