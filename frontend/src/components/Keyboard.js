import React from "react";
import Key from "./Key";
import Constants from "./Constants";
import "../stylesheets/Keyboard.scss";
import {flatten} from "lodash";

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Keyboard({previousStates, keyboardState, keysUsed}) {
    const isKeyUsed = (key) => {
        return keysUsed && keysUsed.includes(key);
    };
    
    const determineKeyState = (key) => {
        if (isKeyUsed(key) && previousStates && keyboardState) {
            const state = flatten(previousStates).filter(k => k.value === key.toLowerCase());
            const solved = state.find(s => s.solveState === Constants.SOLVED);
            const wrongPosition = state.find(s => s.solveState === Constants.WRONG_POSITION);
            return state
                ? solved
                    ? solved.solveState
                    : wrongPosition
                        ? wrongPosition.solveState
                        : "USED_LETTER"
                : "USED_LETTER";
        }
        
        return "USED_LETTER";
    }
    
    return <div className={"keyboard"}>{KEYS.map((row, i) =>
        <div key={i} className={"keyboard-row"}>
            {row.split("").map((letter, j) => {
                if (letter === "Z") {
                    return <React.Fragment key={`fragment-${j}`}>
                        <div key={`enter-${j}`} className={`keyboard-key keyboard-key-enter keyboard-key-UNUSED_LETTER`}>ENTER</div>
                        <div key={`letter-${j}`} className={`keyboard-key ${isKeyUsed(letter) ? "keyboard-key-" + determineKeyState(letter) : "keyboard-key-UNUSED_LETTER"}`}>{letter}</div>
                    </React.Fragment>;
                }
                
                if (letter === "M") {
                    return <React.Fragment key={`fragment-${j}`}>
                        <div key={`letter-${j}`} className={`keyboard-key ${isKeyUsed(letter) ? "keyboard-key-" + determineKeyState(letter) : "keyboard-key-UNUSED_LETTER"}`}>{letter}</div>
                        <div key={`backspace-${j}`} className={"keyboard-key keyboard-key-backspace keyboard-key-UNUSED_LETTER"}>
                            <img src = "backspace-svgrepo-com.svg" alt="svg"/>
                        </div>
                    </React.Fragment>;
                }
                
                return <div key={`letter-${j}`} className={`keyboard-key ${isKeyUsed(letter) ? "keyboard-key-" + determineKeyState(letter) : "keyboard-key-UNUSED_LETTER"}`}>{letter}</div>;
            })}
        </div>)
    }</div>;
}
