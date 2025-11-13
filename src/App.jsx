import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TRASH_TYPES = ["💻", "📱", "🔋", "🖨️", "🖥️"];

export default function TurtleEvadeGame() {
    const [turtleX, setTurtleX] = useState(window.innerWidth / 2);
    const [trash, setTrash] = useState([]);
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [screen, setScreen] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const requestRef = useRef();

    const turtleSize = screen.height * 0.12;
    const trashSize = screen.height * 0.08;
    const fallSpeed = screen.height * 0.004;

    // Resize
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setScreen({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }, 150);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Keyboard movement
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft")
                setTurtleX((x) => Math.max(x - screen.width * 0.05, 0));
            if (e.key === "ArrowRight")
                setTurtleX((x) =>
                    Math.min(x + screen.width * 0.05, screen.width - turtleSize)
                );
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [screen.width, turtleSize]);

    // Spawn trash
    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            const newTrash = {
                id: crypto.randomUUID(),
                x: Math.random() * (screen.width - trashSize),
                y: -trashSize,
                type: TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)],
            };
            setTrash((prev) => [...prev, newTrash]);
        }, 600);
        return () => clearInterval(interval);
    }, [gameOver, screen.width, trashSize]);

    // Spawn background bubbles
    useEffect(() => {
        const interval = setInterval(() => {
            const bubble = {
                id: crypto.randomUUID(),
                x: Math.random() * screen.width,
                y: screen.height + 60,
                size: 10 + Math.random() * 30,
                speed: 0.5 + Math.random() * 1.5,
            };
            setBubbles((prev) => [...prev, bubble]);
        }, 400);
        return () => clearInterval(interval);
    }, [screen]);

    // Game loop
    useEffect(() => {
        if (gameOver) return;

        const update = () => {
            const turtleY = screen.height - turtleSize - 20;

            // Update trash
            setTrash((prev) =>
                prev
                    .map((t) => ({
                        ...t,
                        y: t.y + fallSpeed,
                    }))
                    .filter((t) => {
                        const collides =
                            t.x < turtleX + turtleSize &&
                            t.x + trashSize > turtleX &&
                            t.y < turtleY + turtleSize &&
                            t.y + trashSize > turtleY;

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

            // Update bubbles
            setBubbles((prev) =>
                prev
                    .map((b) => ({
                        ...b,
                        y: b.y - b.speed,
                    }))
                    .filter((b) => b.y + b.size > -50)
            );

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameOver, screen.height, screen.width, turtleX, turtleSize, trashSize]);

    const resetGame = () => {
        setTrash([]);
        setBubbles([]);
        setScore(0);
        setGameOver(false);
        setTurtleX(screen.width / 2);
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                backgroundImage: "url('/bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
            className="relative text-white"
        >
            {/* Score */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl font-bold text-white drop-shadow-lg">
                Score: {score}
            </div>

            {/* Background bubbles */}
            {bubbles.map((b) => (
                <div
                    key={b.id}
                    style={{
                        position: "absolute",
                        left: b.x,
                        top: b.y,
                        width: b.size,
                        height: b.size,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.5)",
                        background: "rgba(255,255,255,0.2)",
                        boxShadow: "0 0 10px rgba(255,255,255,0.4)",
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* Turtle */}
            <motion.div
                className="absolute select-none"
                animate={{ x: turtleX, y: screen.height - turtleSize - 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ fontSize: `${turtleSize}px` }}
            >
                🐢
            </motion.div>

            {/* Trash */}
            {trash.map((t) => (
                <div
                    key={t.id}
                    style={{
                        position: "absolute",
                        left: t.x,
                        top: t.y,
                        fontSize: `${trashSize}px`,
                        userSelect: "none",
                    }}
                >
                    {t.type}
                </div>
            ))}

            {/* GAME OVER — WOBBLING BUBBLE */}
            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        className="pointer-events-auto flex flex-col items-center text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                rotate: [0, 2, -2, 2, -1, 1, 0],
                                y: [0, -4, 3, -2, 1, -3, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatType: "mirror",
                            }}
                            style={{
                                width: 260,
                                height: 260,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.25)",
                                backdropFilter: "blur(8px)",
                                border: "4px solid rgba(255,255,255,0.7)",
                                boxShadow: "0 0 25px rgba(255,255,255,0.6)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                            }}
                        >
                            {/* Highlight */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 20,
                                    left: 35,
                                    width: 70,
                                    height: 70,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.45)",
                                    filter: "blur(8px)",
                                }}
                            />

                            <div className="text-5xl mb-2">💥</div>
                            <div className="text-3xl font-bold text-white">Game Over</div>
                            <div className="text-xl text-white mt-1 mb-4">Score: {score}</div>

                            <button
                                onClick={resetGame}
                                className="bg-white text-black px-5 py-2 rounded-xl font-semibold hover:bg-gray-200 shadow-md"
                            >
                                Restart
                            </button>
                        </motion.div>

                        {/* Bubble tail */}
                        <div
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: "25px solid transparent",
                                borderRight: "25px solid transparent",
                                borderTop: "25px solid rgba(255,255,255,0.25)",
                                marginTop: -5,
                            }}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
