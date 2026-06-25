"use client";

import { useState, useEffect } from "react";
import Point from "./Point";
import { FaCircle } from "react-icons/fa";

const size = 10;
const pointsSize = size + 1;

type Cell = "blue" | "red" | null;

type Square = {
  row: number;
  col: number;
  color: "blue" | "red";
  number: number;
};

export default function Board() {
  const [isBlueTurn, setIsBlueTurn] = useState(true);

  const [squares, setSquares] = useState<Square[]>([]);

  const [score, setScore] = useState({
    blue: 0,
    red: 0,
  });

  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: pointsSize }, () =>
      Array.from({ length: pointsSize }, () => null)
    )
  );

  const handleClick = (row: number, col: number) => {
    setMessage("");
    if (grid[row]?.[col]) return;

    const newColor = isBlueTurn ? "blue" : "red";

    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? newColor : cell))
    );

    setGrid(newGrid);

    const hasEmpty = newGrid.some((row: Cell[]) =>
  row.some((cell: Cell) => cell === null)
   );
   if (!hasEmpty) {
    setGameOver(true);
   }

    const foundSquares: Square[] = [];

    for (let r = 0; r < pointsSize - 1; r++) {
      for (let c = 0; c < pointsSize - 1; c++) {
        const color = newGrid[r][c];

        const alreadyExists = squares.some(
          (s) => s.row === r && s.col === c
        );

        if (
          !alreadyExists &&
          color &&
          newGrid[r][c + 1] === color &&
          newGrid[r + 1][c] === color &&
          newGrid[r + 1][c + 1] === color
        ) {
          foundSquares.push({
            row: r,
            col: c,
            color,
            number: 0,
          });
        }
      }
    }

    if (foundSquares.length > 0) {
      setSquares((prev) => {
        const merged = [...prev, ...foundSquares];

        let blueCount = 0;
        let redCount = 0;

        const updated = merged.map((s) => {
          if (s.color === "blue") blueCount++;
          else redCount++;

          return {
            ...s,
            number: s.color === "blue" ? blueCount : redCount,
          };
        });

        setScore({
          blue: blueCount,
          red: redCount,
        });

        return updated;
      });
    }

    if (foundSquares.length > 0) {
        setMessageColor(newColor);
        setMessage("Replay !");
        setVisible(true);

        setTimeout(() => {
            setVisible(false);
            setMessage("");
        }, 1200);
    } else {
        setIsBlueTurn(!isBlueTurn);
        setMessage("");
    }
  };

  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] =
  useState<"blue" | "red">("blue");

  const [visible, setVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = () => {
  setGrid(
    Array.from({ length: pointsSize }, () =>
      Array.from({ length: pointsSize }, () => null)
    )
  );

  setSquares([]);
  setScore({ blue: 0, red: 0 });
  setIsBlueTurn(true);
  setGameOver(false);
  setMessage("");
};

    const [cellSize, setCellSize] = useState(40);

useEffect(() => {
  const updateSize = () => {
    const reservedTopSpace = 120;

    setCellSize(
      Math.floor(
        Math.min(
          window.innerWidth / pointsSize,
          (window.innerHeight - reservedTopSpace) / pointsSize
        )
      )
    );
  };

  updateSize();
  window.addEventListener("resize", updateSize);

  return () => window.removeEventListener("resize", updateSize);
}, []);

let winnerMessage = "DRAW";

if (score.blue > score.red) {
  winnerMessage = "BLUE WINS";
} else if (score.red > score.blue) {
  winnerMessage = "RED WINS";
}

  return (
    <main className="flex h-screen flex-col items-center">
      <div className="mt-4 flex flex-col items-center gap-4 text-white game-font">
        <div className="flex gap-6 text-lg items-center">
            <div className="flex items-center gap-2">
                <FaCircle className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"/>
                  {score.blue}
            </div>
            <span className="text-white">-</span>
            <div className="flex items-center gap-2">
                  {score.red}
                <FaCircle className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
        </div>

        <div 
          className={`font-semibold mb-6 ${
            isBlueTurn ? "text-blue-400" : "text-red-400"
         }`}
        >
         {isBlueTurn ? "Blue Turn" : "Red Turn"}
        </div>
      </div>
        
        {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                <div className="text-center">
                    <div className="text-red-500 text-4xl font-extrabold tracking-widest mb-6 game-font shake">
                       GAME OVER
                    </div>

                    <div className={`text-2xl mt-4 mb-6 game-font ${ winnerMessage === "BLUE WINS" ? "text-blue-500" : winnerMessage === "RED WINS" ? "text-red-500" : "text-yellow-400"}`}>
                     {winnerMessage}
                    </div>

                    <div className="flex items-center justify-center gap-3 text-lg game-font mb-6">
                        <span className="text-blue-500">{score.blue}</span>
                        
                           <span className="flex items-center gap-2">
                            <FaCircle className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            <span className="text-white">-</span>
                            <FaCircle className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                           </span>
                           
                        <span className="text-red-500">{score.red}</span>
                    </div>
                    
                    <button
                       onClick={resetGame}
                       className="mt-10 px-6 py-2 bg-white text-black font-bold rounded game-font hover:bg-gray-200"
                    >
                      Play Again
                    </button>
                </div>
            </div>
        )}
        
        {visible && message && (
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none font-bold transition-opacity duration-700 float-up ${
              messageColor === "blue" ? "text-blue-500" : "text-red-500"
             }`}
            >
             {message}
            </div>
        )}

      <div
        className="absolute -bottom-4 left-3 right-0 grid"
        style={{
            gridTemplateColumns: `repeat(${pointsSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${pointsSize}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: pointsSize * pointsSize }).map((_, index) => {
          const row = Math.floor(index / pointsSize);
          const col = index % pointsSize;
          const isLastRow = row === pointsSize - 1;
          const isLastCol = col === pointsSize - 1;

          return (
            <div key={index} className={`relative border-gray-400 ${!isLastRow ? "border-b" : ""} ${!isLastCol ? "border-r" : ""}`}>
              <Point
                value={grid[row][col]}
                onClick={() => handleClick(row, col)}
              />

              {squares
                .filter((s) => s.row === row && s.col === col)
                .map((s) => (
                  <div
                    key={`${s.row}-${s.col}`}
                    className="absolute inset-0"
                    style={{ backgroundColor: s.color, opacity: 0.25 }}
                  >
                    <div className="flex items-center justify-center h-full font-bold text-white text-sm game-font">
                      {s.number}
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
