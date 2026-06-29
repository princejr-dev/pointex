// engine.ts
// Pure game logic — no React, no UI

// ─────────────────────────────────────────────────────────────
// Types (strict mirror of your current Board.tsx logic)
// ─────────────────────────────────────────────────────────────

export type Cell = "blue" | "red" | null;

export type Player = "blue" | "red";

export type Square = {
  row: number;
  col: number;
  color: Player;
  number: number;
};

export type GameState = {
  grid: Cell[][];
  squares: Square[];
  score: { blue: number; red: number };
  isBlueTurn: boolean;
  gameOver: boolean;
};

// ─────────────────────────────────────────────────────────────
// Constants (same as Board.tsx)
// ─────────────────────────────────────────────────────────────

export const POINTS_SIZE = 11; // 10 squares => 11 points per side

// ─────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────

export const createEmptyGrid = (): Cell[][] =>
  Array.from({ length: POINTS_SIZE }, () =>
    Array.from({ length: POINTS_SIZE }, () => null),
  );

export const getInitialState = (): GameState => ({
  grid: createEmptyGrid(),
  squares: [],
  score: { blue: 0, red: 0 },
  isBlueTurn: true,
  gameOver: false,
});

// ─────────────────────────────────────────────────────────────
// Core public API
// ─────────────────────────────────────────────────────────────

export function applyMove(
  state: GameState,
  row: number,
  col: number
): GameState {
  if (state.grid[row]?.[col]) return state;

  const currentPlayer: Player = state.isBlueTurn ? "blue" : "red";

  const newGrid = placePoint(state.grid, row, col, currentPlayer);

  const hasEmpty = newGrid.some((r) => r.some((c) => c === null));

  const foundSquares = detectSquares(newGrid, state.squares);

  const mergedSquares = mergeSquares(state.squares, foundSquares);

  const score = calculateScore(mergedSquares);

  const shouldReplay = foundSquares.length > 0;

  return {
    grid: newGrid,
    squares: mergedSquares,
    score,
    isBlueTurn: shouldReplay ? state.isBlueTurn : !state.isBlueTurn,
    gameOver: !hasEmpty,
  };
}

// ─────────────────────────────────────────────────────────────
// Pure helpers (EXACT logic from your Board.tsx)
// ─────────────────────────────────────────────────────────────

function placePoint(
  grid: Cell[][],
  row: number,
  col: number,
  color: Player
): Cell[][] {
  return grid.map((r, i) =>
    r.map((cell, j) => (i === row && j === col ? color : cell)),
  );
}

// IMPORTANT: logic identical to your current detection
export function detectSquares(
  grid: Cell[][],
  existingSquares: Square[]
): Square[] {
  const found: Square[] = [];

  for (let r = 0; r < POINTS_SIZE - 1; r++) {
    for (let c = 0; c < POINTS_SIZE - 1; c++) {
      const color = grid[r][c];

      const alreadyFound = existingSquares.some(
        (s) => s.row === r && s.col === c,
      );

      if (
        !alreadyFound &&
        color &&
        grid[r][c + 1] === color &&
        grid[r + 1][c] === color &&
        grid[r + 1][c + 1] === color
      ) {
        found.push({
          row: r,
          col: c,
          color,
          number: 0,
        });
      }
    }
  }

  return found;
}

function mergeSquares(
  prev: Square[],
  newSquares: Square[]
): Square[] {
  const merged = [...prev, ...newSquares];

  let blueCount = 0;
  let redCount = 0;

  return merged.map((s) => {
    if (s.color === "blue") blueCount++;
    else redCount++;

    return {
      ...s,
      number: s.color === "blue" ? blueCount : redCount,
    };
  });
}

function calculateScore(squares: Square[]) {
  let blue = 0;
  let red = 0;

  for (const s of squares) {
    if (s.color === "blue") blue++;
    else red++;
  }

  return { blue, red };
}

// ─────────────────────────────────────────────────────────────
// Optional helpers (future-proofing)
// ─────────────────────────────────────────────────────────────

export function resetState(): GameState {
  return getInitialState();
}