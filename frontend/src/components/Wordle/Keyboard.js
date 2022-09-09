import React from "react";
import Key from "./Key";
import Constants from "./Constants";

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Keyboard(keyboardState) {
    return <div>
        {KEYS.map((row, i) =>
            <div index={i}>
                {row.split("").map((key, j) => {
                    const keyState = keyboardState.keysUsed.find(i => i === key);
                    return <Key index={j} value={key} keyState={keyState ? keyState.solveState : Constants.UNSOLVED}></Key>
                })}
            </div>)
        }
    </div>;
}
