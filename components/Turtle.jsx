import React from "react";
import { motion } from "framer-motion";

const Turtle = React.memo(({ x, y }) => (
    <motion.div
        className="absolute select-none"
        animate={{ x, y }}
        transition={{ type: "tween", duration: 0.08 }}
        style={{
            fontSize: "6rem",
            zIndex: 20,
            pointerEvents: "none",
            userSelect: "none",
        }}
    >
        🐢
    </motion.div>
));

export default Turtle;
