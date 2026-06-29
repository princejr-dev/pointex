"use client";

import { useState, useEffect } from "react";
import Point from "./Point";
import { FaCircle, FaTrophy, FaBalanceScale } from "react-icons/fa";
import {
  applyMove,
  getInitialState,
  type GameState,
  type Square,
  POINTS_SIZE,
} from "../lib/engine";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components  (pure display — no game logic)
// ─────────────────────────────────────────────────────────────────────────────

/** Full-board overlay: How to Play modal */
function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm w-screen h-screen"
      onClick={onClose}
    >
      <div
        className="w-4/5 max-w-sm rounded-2xl border border-slate-600 bg-[#0e1633] p-6 text-center game-font"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl text-white">HOW TO PLAY</h2>

        <div className="space-y-3 text-sm text-gray-300">
          <p>* Place points on the grid.</p>
          <p>* Complete a 2×2 square with your color.</p>
          <p>* Each square gives 1 point.</p>
          <p>* Score a square and play again.</p>
          <p>* The player with the most points wins.</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 rounded px-6 py-2 bg-white font-bold text-black hover:bg-gray-200"
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}

/** Full-board overlay: end-of-game result screen */
function GameOverModal({
  score,
  onReset,
}: {
  score: { blue: number; red: number };
  onReset: () => void;
}) {
  let winnerMessage = "DRAW";
  if (score.blue > score.red) winnerMessage = "BLUE WINS";
  else if (score.red > score.blue) winnerMessage = "RED WINS";

  const resultColor =
    winnerMessage === "BLUE WINS"
      ? "text-blue-500"
      : winnerMessage === "RED WINS"
        ? "text-red-500"
        : "text-yellow-400";

  const isBlueWinner = score.blue > score.red;
  const isRedWinner = score.red > score.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm w-screen h-screen">
      <div className="px-4 text-center">
        {/* Animated title */}
        <div className="mb-4 text-5xl font-extrabold tracking-widest text-[#e5e7eb] game-font shake">
          GAME OVER
        </div>

        {/* Winner label */}
        <div className={`my-4 text-3xl game-font ${resultColor}`}>
          {winnerMessage}
        </div>

        {/* Final score */}
        <div className="mb-4 flex items-center justify-center gap-3 text-2xl game-font">
          {isBlueWinner && (
            <div className="flex items-center gap-2 text-blue-500">
              <FaTrophy className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span>Score: {score.blue}</span>
            </div>
          )}

          {isRedWinner && (
            <div className="flex items-center gap-2 text-red-500">
              <FaTrophy className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span>Score: {score.red}</span>
            </div>
          )}

          {!isBlueWinner && !isRedWinner && (
            <div className="text-yellow-400 flex items-center gap-2">
              <FaBalanceScale />
              <span>Draw</span>
            </div>
          )}
        </div>

        <button
          onClick={onReset}
          className="mt-6 rounded px-6 py-2 bg-white font-bold text-black game-font hover:bg-gray-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Board() {
  // ── Game state ─────────────────────────────────────────────────────────────

  const [state, setState] = useState<GameState>(() => getInitialState());

  // ── UI state ───────────────────────────────────────────────────────────────

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState<"blue" | "red">("blue");
  const [visible, setVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Dynamic cell size: recalculated on every viewport resize
  const [cellSize, setCellSize] = useState(40);

  // ── Responsive cell-size effect ────────────────────────────────────────────

  useEffect(() => {
    const updateSize = () => {
      // Space consumed outside the grid:
      //   header (title + score + turn label + pt-4/pb-2) ≈ 130 px
      //   main p-4  (top + bottom)                        =  32 px
      //   grid-wrapper p-2 (top + bottom)                 =  16 px
      const HEADER_H = 130;
      const OUTER_PAD = 32;
      const INNER_PAD = 16;

      const availW = window.innerWidth - OUTER_PAD;
      const availH = window.innerHeight - HEADER_H - OUTER_PAD - INNER_PAD;

      setCellSize(
        Math.floor(Math.min(availW / POINTS_SIZE, availH / POINTS_SIZE)),
      );
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ── Core game logic ────────────────────────────────────────────────────────

  /**
   * Called when a player taps a node.
   *
   * Flow:
   *  1. Place the point in the grid.
   *  2. Scan every possible 2×2 block for a newly completed square.
   *  3. If squares found → award points, keep current player (replay).
   *  4. Otherwise        → hand the turn to the opponent.
   *  5. If no empty cell remains → trigger game-over.
   */
  const handleClick = (row: number, col: number) => {
    setMessage("");

    const nextState = applyMove(state, row, col);

    // ignore invalid move (cell already taken)
    if (nextState === state) return;

    const lastPlayer = state.isBlueTurn ? "blue" : "red";

    setState(nextState);

    // game over
    if (nextState.gameOver) {
      setGameOver(true);
    }

    // replay logic (identique à ton jeu)
    const replay = nextState.isBlueTurn === state.isBlueTurn;

    if (replay) {
      setMessageColor(lastPlayer);
      setMessage("Replay !");
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setMessage("");
      }, 1200);
    }
  };

  /** Resets every piece of state to its initial value. */
  const resetGame = () => {
    setState(getInitialState());
    setGameOver(false);
    setMessage("");
    setVisible(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="w-full h-full flex items-center justify-center">
      {/*
       * Game container
       * `overflow-hidden` prevents any child from visually bleeding
       * outside the rounded card boundary.
       */}
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl">
        {/* ── Modals (full-board overlays, z-50) ────────────────────── */}
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
        {gameOver && <GameOverModal score={state.score} onReset={resetGame} />}

        {/* ── Replay notification (z-40, pointer-events disabled) ───── */}
        {visible && message && (
          <div
            className={`pointer-events-none absolute inset-0 z-40 flex items-center justify-center text-4xl font-bold transition-opacity duration-700 float-up ${
              messageColor === "blue" ? "text-blue-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HEADER
            `shrink-0` prevents the flex container from squeezing it.
        ══════════════════════════════════════════════════════════════ */}
        <header className="relative flex shrink-0 flex-col items-center pt-14 pb-4">
          {/* Live score */}
          <div className="mt-1 flex items-center gap-6 pb-2">
            <div className="flex items-center gap-2 text-4xl sm:text-3xl">
              <FaCircle className="text-3xl text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-white">{state.score.blue}</span>
            </div>
            <span className="text-white">-</span>
            <div className="flex items-center gap-2 text-4xl sm:text-3xl">
              <span className="text-white">{state.score.red}</span>
              <FaCircle className="text-3xl text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          </div>

          {/* Active-player indicator */}
          <div
            className={`mb-2 mt-4 text-xl font-semibold tracking-wide ${
              state.isBlueTurn ? "text-blue-400" : "text-red-400"
            }`}
          >
            {state.isBlueTurn ? "Blue's Turn" : "Red's Turn"}
          </div>

          {/* Rules button — top-right corner of the game container */}
          <button
            onClick={() => setShowRules(true)}
            aria-label="How to play"
            className="fixed right-4 top-4 flex h-8 w-8 items-center justify-center rounded border border-gray-600 text-sm text-white transition hover:border-gray-400 cursor-crosshair"
          >
            ?
          </button>
        </header>

        {/* ══════════════════════════════════════════════════════════════
            GAME GRID
            `flex-1` claims all vertical space left after the header.
            Inner flex centers the grid on both axes.
        ══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 justify-center translate-x-2">
          <div
            className="grid rounded-lg border border-slate-700"
            style={{
              gridTemplateColumns: `repeat(${POINTS_SIZE}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${POINTS_SIZE}, ${cellSize}px)`,
            }}
          >
            {Array.from({ length: POINTS_SIZE * POINTS_SIZE }).map(
              (_, index) => {
                const row = Math.floor(index / POINTS_SIZE);
                const col = index % POINTS_SIZE;
                const isLastRow = row === POINTS_SIZE - 1;
                const isLastCol = col === POINTS_SIZE - 1;

                return (
                  <div
                    key={index}
                    className={`relative border-gray-400 ${!isLastRow ? "border-b" : ""} ${!isLastCol ? "border-r" : ""}`}
                  >
                    {/* Clickable node */}
                    <Point
                      value={state.grid[row][col]}
                      onClick={() => handleClick(row, col)}
                    />

                    {/*
                     * Winning-square overlay.
                     *
                     * Rendered on the TOP-LEFT node of each completed square.
                     *
                     * `absolute inset-0` → strictly contained within ONE cell.
                     * This is intentional: one overlay = one logical square.
                     * Never use width/height larger than the cell here.
                     */}
                    {state.squares
                      .filter((s: Square) => s.row === row && s.col === col)
                      .map((s: Square) => (
                        <div
                          key={`sq-${s.row}-${s.col}`}
                          className="absolute inset-0"
                          style={{ backgroundColor: s.color, opacity: 0.45 }}
                        >
                          {/* Sequential score number for this square */}
                          <div className="flex h-full items-center justify-center text-sm font-bold text-white game-font">
                            {s.number}
                          </div>
                        </div>
                      ))}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
