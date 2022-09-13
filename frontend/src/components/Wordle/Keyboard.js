import React from "react";
import Key from "./Key";
import Constants from "./Constants";
import "./Keyboard.scss";

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Keyboard(keyboardState) {
    return <div className={"keyboard"}>{KEYS.map((row, i) =>
        <div key={i} className={"keyboard-row"}>
            {row.split("").map((letter, j) => <div key={j} className={"keyboard-key"}>{letter}</div>)}
        </div>)
    }</div>;
}
