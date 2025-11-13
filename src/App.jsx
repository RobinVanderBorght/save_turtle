import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TRASH_TYPES = ["💻", "📱", "🔋", "🖨️", "🖥️"];

const SEA_FACTS = [
    "Over 50 million tons of e-waste end up in nature every year.",
    "Sea turtles often mistake floating plastic and e-waste for food.",
    "Toxic chemicals from e-waste poison coral reefs globally.",
    "Heavy metals from electronics accumulate in fish and enter our food chain.",
    "E-waste dumping kills thousands of marine animals annually.",
    "Lead and mercury from e-waste dissolve into seawater, harming marine life.",
    "1 in 3 sea turtles have eaten plastic or e-waste residue.",
    "Dumped batteries leak acid that destroys sea grass ecosystems.",
    "E-waste toxins disrupt reproductive systems in dolphins and whales.",
    "Every minute, a truckload of electronic garbage enters the ocean."
];

export default function TurtleEvadeGame() {

    const [turtleX, setTurtleX] = useState(window.innerWidth / 2);
    const [trash, setTrash] = useState([]);
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Fact bubble every 10 seconds
    const [factPopup, setFactPopup] = useState(null);

    const [screen, setScreen] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const requestRef = useRef();

    const turtleSize = screen.height * 0.12;
    const trashSize = screen.height * 0.08;
    const fallSpeed = screen.height * 0.004;

    // --------------------------
    // SCREEN RESIZE
    // --------------------------
    useEffect(() => {
        let timer;
        const handleResize = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                setScreen({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 150);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // --------------------------
    // PLAYER MOVEMENT
    // --------------------------
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

    // --------------------------
    // TRASH SPAWN
    // --------------------------
    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            setTrash((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    x: Math.random() * (screen.width - trashSize),
                    y: -trashSize,
                    type: TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)]
                }
            ]);
        }, 600);

        return () => clearInterval(interval);
    }, [gameOver, screen.width, trashSize]);

    // --------------------------
    // BACKGROUND BUBBLES
    // --------------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setBubbles((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    x: Math.random() * screen.width,
                    y: screen.height + 60,
                    size: 10 + Math.random() * 30,
                    speed: 0.5 + Math.random() * 1.5
                }
            ]);
        }, 400);

        return () => clearInterval(interval);
    }, [screen]);

    // --------------------------
    // FACT POPUP EVERY 10 SECONDS
    // --------------------------
    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            const fact = SEA_FACTS[Math.floor(Math.random() * SEA_FACTS.length)];
            setFactPopup(fact);

            setTimeout(() => setFactPopup(null), 3000);
        }, 10000);

        return () => clearInterval(interval);
    }, [gameOver]);

    // --------------------------
    // GAME LOOP
    // --------------------------
    useEffect(() => {
        if (gameOver) return;

        const update = () => {
            const turtleY = screen.height - turtleSize - 35;

            setTrash((prev) =>
                prev
                    .map((t) => ({ ...t, y: t.y + fallSpeed }))
                    .filter((t) => {
                        const hit =
                            t.x < turtleX + turtleSize &&
                            t.x + trashSize > turtleX &&
                            t.y < turtleY + turtleSize &&
                            t.y + trashSize > turtleY;

                        if (hit) {
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

            setBubbles((prev) =>
                prev
                    .map((b) => ({ ...b, y: b.y - b.speed }))
                    .filter((b) => b.y + b.size > -50)
            );

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    });

    // --------------------------
    // RESET GAME
    // --------------------------
    const resetGame = () => {
        setTrash([]);
        setBubbles([]);
        setScore(0);
        setGameOver(false);
        setTurtleX(screen.width / 2);
        setFactPopup(null);
    };

    // --------------------------
    // UI
    // --------------------------
    return (
        <div
            className="relative text-white"
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                backgroundImage: "url('/bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >

            {/* SCORE */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl font-bold">
                Score: {score}
            </div>

            {/* BUBBLES */}
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
                        background: "rgba(255,255,255,0.2)"
                    }}
                />
            ))}

            {/* TURTLE */}
            <motion.div
                className="absolute select-none"
                animate={{ x: turtleX, y: screen.height - turtleSize - 35 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ fontSize: `${turtleSize}px` }}
            >
                🐢
            </motion.div>

            {/* TRASH */}
            {trash.map((t) => (
                <div
                    key={t.id}
                    style={{
                        position: "absolute",
                        left: t.x,
                        top: t.y,
                        fontSize: `${trashSize}px`
                    }}
                >
                    {t.type}
                </div>
            ))}

            {/* FACT POPUP */}
            {factPopup && !gameOver && (
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="absolute left-1/2 top-1/4 -translate-x-1/2"
                >
                    <div
                        style={{
                            padding: "22px 25px",
                            width: 330,
                            borderRadius: "30px",
                            background: "rgba(255,255,255,0.25)",
                            border: "4px solid rgba(255,255,255,0.6)",
                            backdropFilter: "blur(8px)",
                            color: "white",
                            fontSize: "20px",
                            fontWeight: "600",
                            textAlign: "center"
                        }}
                    >
                        {factPopup}
                    </div>
                </motion.div>
            )}

            {/* GAME OVER BUBBLE */}
            {gameOver && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="absolute inset-0 flex items-center justify-center z-[9999]"
                    style={{
                        pointerEvents: "auto",
                        background: "transparent"
                    }}
                >
                    <motion.div
                        animate={{
                            rotate: [0, 2, -2, 2, -1, 1, 0],
                            y: [0, -4, 3, -2, 1, -3, 0]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "mirror"
                        }}
                        style={{
                            width: 260,
                            height: 260,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.25)",
                            border: "4px solid rgba(255,255,255,0.7)",
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 0 25px rgba(255,255,255,0.6)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            position: "relative",
                            textAlign: "center"
                        }}
                    >
                        <div className="text-5xl mb-2">💥</div>
                        <div className="text-3xl font-bold">Game Over</div>
                        <div className="text-xl mt-1 mb-4">Score: {score}</div>

                        <button
                            onClick={resetGame}
                            className="bg-white text-black px-5 py-2 rounded-xl font-semibold hover:bg-gray-200 shadow-md"
                        >
                            Restart
                        </button>
                    </motion.div>
                </motion.div>
            )}

        </div>
    );
}
