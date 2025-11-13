import React, { useState, useEffect, useRef, useCallback } from "react";
import Turtle from "../components/Turtle";

const EWASTE_TYPES = ["💻", "📱", "🔋", "🖥️", "🖨️", "🎧", "📺"];

export default function App() {
    const [turtle, setTurtle] = useState({
        x: window.innerWidth / 2,
        y: window.innerHeight - 150,
    });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const trashRef = useRef([]);
    const nextTrashId = useRef(0);
    const animationRef = useRef(null);

    // Setup canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctxRef.current = canvas.getContext("2d");
    }, []);

    // Resize canvas dynamically
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle turtle movement
    useEffect(() => {
        const handleKey = (e) => {
            if (gameOver) return;
            const speed = 40;
            setTurtle((pos) => {
                let { x, y } = pos;
                if (["ArrowUp", "w"].includes(e.key)) y -= speed;
                if (["ArrowDown", "s"].includes(e.key)) y += speed;
                if (["ArrowLeft", "a"].includes(e.key)) x -= speed;
                if (["ArrowRight", "d"].includes(e.key)) x += speed;
                return {
                    x: Math.max(0, Math.min(window.innerWidth - 100, x)),
                    y: Math.max(0, Math.min(window.innerHeight - 100, y)),
                };
            });
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [gameOver]);

    // Spawn ewaste (no re-render)
    const spawnTrash = useCallback(() => {
        if (gameOver) return;
        trashRef.current.push({
            id: nextTrashId.current++,
            x: Math.random() * (window.innerWidth - 80),
            y: -50,
            speed: 2 + Math.random() * 4,
            size: 40 + Math.random() * 30,
            emoji: EWASTE_TYPES[Math.floor(Math.random() * EWASTE_TYPES.length)],
            active: true,
        });
    }, [gameOver]);

    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(spawnTrash, 700);
        return () => clearInterval(interval);
    }, [spawnTrash, gameOver]);

    // Game loop using canvas
    const gameLoop = useCallback(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const turtleX = turtle.x;
        const turtleY = turtle.y;

        // Clear frame
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw trash
        ctx.font = "bold 48px serif";
        for (const t of trashRef.current) {
            t.y += t.speed;
            ctx.fillText(t.emoji, t.x, t.y);

            // Collision detection
            if (Math.abs(t.x - turtleX) < 70 && Math.abs(t.y - turtleY) < 70) {
                setGameOver(true);
                cancelAnimationFrame(animationRef.current);
                return;
            }

            // Scoring (item avoided)
            if (t.y > window.innerHeight && t.active) {
                t.active = false;
                setScore((s) => s + 1);
            }
        }

        // Clean up off-screen trash
        trashRef.current = trashRef.current.filter((t) => t.y < window.innerHeight + 100);

        animationRef.current = requestAnimationFrame(gameLoop);
    }, [turtle]);

    useEffect(() => {
        if (!gameOver) animationRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationRef.current);
    }, [gameLoop, gameOver]);

    const restart = () => {
        trashRef.current = [];
        setScore(0);
        setGameOver(false);
        setTurtle({ x: window.innerWidth / 2, y: window.innerHeight - 150 });
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-300 to-sky-600 text-white">
            {/* Canvas (trash layer) */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full z-0"
            />

            {/* Turtle (above canvas) */}
            <div className="absolute z-20">
                <Turtle x={turtle.x} y={turtle.y} />
            </div>

            {/* Score UI (above turtle) */}
            <div className="absolute top-4 left-4 bg-white/40 backdrop-blur-sm text-black px-4 py-1 rounded-xl font-semibold z-30">
                Score: {score}
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-40">
                    <h2 className="text-4xl font-bold mb-3">Game Over</h2>
                    <p className="text-xl mb-4">Final Score: {score}</p>
                    <button
                        onClick={restart}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-xl shadow-lg"
                    >
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
}
