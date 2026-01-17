<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { onMounted, computed, ref } from "vue";
import { useChessModels } from "@/composables/useChessModels";
import HDRBackground from "@/components/HDRBackground.vue";
import CameraSettings from "@/components/CameraSettings.vue";
import FPSCameraController from "@/components/FPSCameraController.vue";
import { applyPieceMaterial, type PieceTeam } from "@/utils/applyPieceMaterial";
import { adjustPiecePosition } from "@/utils/getPieceBaseHeight";
import type * as THREE from "three";

// Use chess models composable
const { isLoading, progress, loadAllModels, getModel, cloneModel } =
  useChessModels();

// FPS Camera state (managed at parent level)
const moveSpeed = ref(5);
const mouseSensitivity = ref(0.002);
const jumpForce = ref(5);
const isPointerLocked = ref(false);
const cameraControllerRef = ref<InstanceType<typeof FPSCameraController>>();

const lockPointer = () => {
  cameraControllerRef.value?.lockPointer();
};

// Chess pieces positions (data-driven approach)
interface ChessPieceInstance {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  team: PieceTeam;
  position: [number, number, number];
  rotation?: [number, number, number]; // [x, y, z] in radians
  model?: THREE.Group | null;
}

/**
 * Helper untuk create piece dengan material + auto-adjust Y position
 * Fixes z-fighting by calculating proper height from bounding box
 */
const createPieceInstance = (
  type: ChessPieceInstance["type"],
  team: PieceTeam,
  basePosition: [number, number, number],
  rotation?: [number, number, number]
): ChessPieceInstance => {
  const model = cloneModel(type);

  if (model) {
    // Apply wooden material based on team (rough matte finish)
    applyPieceMaterial(model, { team });
  }

  // Auto-adjust Y position supaya gak overlap dengan board (fix z-fighting)
  const adjustedPosition = model
    ? adjustPiecePosition(model, basePosition)
    : basePosition;

  return {
    type,
    team,
    position: adjustedPosition,
    rotation,
    model,
  };
};

// Used in template (v-for loop)
const chessPieces = computed<ChessPieceInstance[]>(() => {
  if (isLoading.value) return [];

  return [
    // === WHITE PIECES ===
    // Pawns (Y auto-calculated untuk prevent z-fighting)
    createPieceInstance("pawn", "white", [-1.4, 0, 2]),
    createPieceInstance("pawn", "white", [-1.4, 0, 1.4]),
    createPieceInstance("pawn", "white", [-1.4, 0, 0.8]),
    createPieceInstance("pawn", "white", [-1.4, 0, 0.3]),
    createPieceInstance("pawn", "white", [-1.4, 0, -0.3]),
    createPieceInstance("pawn", "white", [-1.4, 0, -0.85]),
    createPieceInstance("pawn", "white", [-1.4, 0, -1.4]),
    createPieceInstance("pawn", "white", [-1.4, 0, -2]),

    // Major pieces (Y auto-calculated)
    createPieceInstance("rook", "white", [-2, 0, 2]),
    createPieceInstance("knight", "white", [-2, 0, 1.4]),
    createPieceInstance("bishop", "white", [-2, 0, 0.8]),
    createPieceInstance("queen", "white", [-2, 0, 0.3]),
    createPieceInstance("king", "white", [-2, 0, -0.3]),
    createPieceInstance("bishop", "white", [-2, 0, -0.85]),
    createPieceInstance("knight", "white", [-2, 0, -1.4]),
    createPieceInstance("rook", "white", [-2, 0, -2]),

    // === BLACK PIECES (180° rotation) ===
    // Pawns (Y auto-calculated)
    createPieceInstance("pawn", "black", [1.42, 0, 2], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, 1.4], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, 0.8], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, 0.3], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, -0.3], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, -0.85], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, -1.4], [0, Math.PI, 0]),
    createPieceInstance("pawn", "black", [1.42, 0, -2], [0, Math.PI, 0]),

    // Major pieces (Y auto-calculated)
    createPieceInstance("rook", "black", [2, 0, 2], [0, Math.PI, 0]),
    createPieceInstance("knight", "black", [2, 0, 1.4], [0, Math.PI, 0]),
    createPieceInstance("bishop", "black", [2, 0, 0.8], [0, Math.PI, 0]),
    createPieceInstance("queen", "black", [2, 0, 0.3], [0, Math.PI, 0]),
    createPieceInstance("king", "black", [2, 0, -0.3], [0, Math.PI, 0]),
    createPieceInstance("bishop", "black", [2, 0, -0.85], [0, Math.PI, 0]),
    createPieceInstance("knight", "black", [2, 0, -1.4], [0, Math.PI, 0]),
    createPieceInstance("rook", "black", [2, 0, -2], [0, Math.PI, 0]),
  ];
});

// Load all models on mount (parallel loading)
onMounted(async () => {
  await loadAllModels();
});
</script>

<template>
  <!-- Loading overlay -->
  <div
    v-if="isLoading"
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-family: sans-serif;
      z-index: 1000;
    "
  >
    <h2>Loading Chess Models...</h2>
    <div style="margin-top: 20px; font-size: 24px; font-weight: bold">
      {{ progress }}%
    </div>
    <div
      style="
        width: 300px;
        height: 10px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        margin-top: 20px;
        overflow: hidden;
      "
    >
      <div
        :style="{
          width: progress + '%',
          height: '100%',
          background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
          transition: 'width 0.3s ease',
        }"
      ></div>
    </div>
  </div>

  <!-- FPS Camera Settings UI -->
  <CameraSettings
    v-model:moveSpeed="moveSpeed"
    v-model:mouseSensitivity="mouseSensitivity"
    v-model:jumpForce="jumpForce"
    :isPointerLocked="isPointerLocked"
    @lockPointer="lockPointer"
  />

  <TresCanvas window-size>
    <!-- HDR Background (realistic lighting & reflections) -->
    <HDRBackground path="/backgrounds/blinds_1k.hdr" />

    <!-- FPS Camera (controlled by useFPSCamera composable) -->
    <TresPerspectiveCamera :position="[0, 0, 0]" />

    <!-- FPS Camera Controller (handles movement, must be inside TresCanvas) -->
    <FPSCameraController
      ref="cameraControllerRef"
      v-model:moveSpeed="moveSpeed"
      v-model:mouseSensitivity="mouseSensitivity"
      v-model:jumpForce="jumpForce"
      v-model:isPointerLocked="isPointerLocked"
    />

    <TresAmbientLight :intensity="1" />
    <TresDirectionalLight :position="[3, 3, 3]" :intensity="2" />

    <!-- Chess Board -->
    <primitive
      v-if="getModel('board')"
      :object="getModel('board')"
      :position="[0, -0.5, 0]"
    />

    <!-- Chess Pieces (Data-driven rendering) -->
    <primitive
      v-for="(piece, index) in chessPieces"
      :key="`${piece.type}-${index}`"
      :object="piece.model"
      :position="piece.position"
      :rotation="piece.rotation || [0, 0, 0]"
    />
  </TresCanvas>
</template>
