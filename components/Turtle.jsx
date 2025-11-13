import React from "react";
import { motion } from "framer-motion";

const Turtle = React.memo(({ x, y }) => (
    <motion.div
        className="absolute select-none z-20"
        animate={{ x, y }}
        transition={{ type: "tween", duration: 0.08 }}
        style={{
            fontSize: "6rem",
            pointerEvents: "none",
            userSelect: "none",
        }}
    >
        🐢
    </motion.div>
));

export default Turtle;