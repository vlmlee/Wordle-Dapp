import React from "react";
import Key from "./Key";
import Constants from "./Constants";
import "./Keyboard.scss";

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Keyboard(keyboardState) {
    return <div className={"keyboard"}>{KEYS.map((row, i) =>
        <div key={i} className={"keyboard-row"}>
            {row.split("").map((letter, j) => {
                if (letter === "Z") {
                    return <>
                        <div className={"keyboard-key keyboard-key-enter keyboard-key-UNUSED_LETTER"}>ENTER</div>
                        <div key={j} className={"keyboard-key keyboard-key-UNUSED_LETTER"}>{letter}</div>
                    </>;
                }
                
                if (letter === "M") {
                    return <>
                        <div key={j} className={"keyboard-key keyboard-key-UNUSED_LETTER"}>{letter}</div>
                        <div className={"keyboard-key keyboard-key-backspace keyboard-key-UNUSED_LETTER"}>
                            <img src = "backspace-svgrepo-com.svg" alt="svg"/>
                        </div>
                    </>;
                }
                
                return <div key={j} className={"keyboard-key keyboard-key-UNUSED_LETTER"}>{letter}</div>;
            })}
        </div>)
    }</div>;
}
