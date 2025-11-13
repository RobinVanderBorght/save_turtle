import React from "react";

const TrashItem = React.memo(({ x, y, emoji, size }) => (
    <div
        className="absolute select-none"
        style={{
            transform: `translate(${x}px, ${y}px)`,
            fontSize: `${size}rem`,
            willChange: "transform",
        }}
    >
        {emoji}
    </div>
));

export default TrashItem;