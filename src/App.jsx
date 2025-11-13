import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TRASH_TYPES = ["💻", "📱", "🔋", "🖨️", "🖥️"];

export default function TurtleEvadeGame() {
    const [turtleX, setTurtleX] = useState(window.innerWidth / 2);
    const [trash, setTrash] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [screen, setScreen] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const requestRef = useRef();

    const turtleSize = screen.height * 0.12;
    const trashSize = screen.height * 0.08;
    const fallSpeed = screen.height * 0.0001;

    // Resize listener
    useEffect(() => {
        const handleResize = () =>
            setScreen({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Keyboard movement
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft")
                setTurtleX((x) => Math.max(x - screen.width * 0.05, 0));
            if (e.key === "ArrowRight")
                setTurtleX((x) => Math.min(x + screen.width * 0.05, screen.width - turtleSize));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [screen.width, turtleSize]);

    // Spawn trash across the screen at random x positions
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            const newTrash = {
                id: Date.now() + Math.random(),
                x: Math.random() * (screen.width - trashSize),
                y: -trashSize,
                type: TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)],
            };
            setTrash((prev) => [...prev, newTrash]);
        }, 600);
        return () => clearInterval(interval);
    }, [gameOver, screen.width, trashSize]);

    // Smooth fall animation loop
    useEffect(() => {
        if (gameOver) return;

        const update = () => {
            setTrash((prev) =>
                prev
                    .map((t) => ({
                        ...t,
                        y: t.y + fallSpeed * 16, // ~60fps => delta ~16ms per frame
                    }))
                    .filter((t) => {
                        const turtleY = screen.height - turtleSize - 20;
                        const horizontallyClose =
                            t.x + trashSize * 0.5 > turtleX &&
                            t.x < turtleX + turtleSize * 0.8;
                        const verticallyClose =
                            t.y + trashSize > turtleY && t.y < turtleY + turtleSize;
                        const collides = horizontallyClose && verticallyClose;

                        if (collides) {
                            setGameOver(true);
                            return false;
                        }

                        if (t.y > screen.height) {
                            setScore((s) => s + 1);
                            return false;
                        }
                        return true;
                    })
            );
            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameOver, screen.height, screen.width, turtleX]);

    const resetGame = () => {
        setTrash([]);
        setScore(0);
        setGameOver(false);
        setTurtleX(screen.width / 2);
    };

    return (
        <div
            className="relative overflow-hidden bg-gradient-to-b from-sky-300 to-blue-600"
            style={{ width: "100vw", height: "100vh" }}
        >
            {/* Score */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl font-bold text-white drop-shadow-lg">
                Score: {score}
            </div>

            {/* Turtle */}
            <motion.div
                className="absolute select-none"
                animate={{ x: turtleX, y: screen.height - turtleSize - 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ fontSize: `${turtleSize}px` }}
            >
                🐢
            </motion.div>

            {/* Falling Trash */}
            {trash.map((t) => (
                <div
                    key={t.id}
                    className="absolute select-none"
                    style={{
                        position: "absolute",
                        transform: `translate(${t.x}px, ${t.y}px)`,
                        fontSize: `${trashSize}px`,
                    }}
                >
                    {t.type}
                </div>
            ))}

            {/* Game Over */}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white text-4xl font-bold">
                    <p>💀 Game Over!</p>
                    <p className="mt-2 text-2xl">Final Score: {score}</p>
                    <button
                        onClick={resetGame}
                        className="mt-6 bg-white text-black px-6 py-3 rounded-2xl text-lg font-semibold hover:bg-gray-200"
                    >
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
}