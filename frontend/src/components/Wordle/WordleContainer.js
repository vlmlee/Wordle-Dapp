import React from "react";
import {useState} from "react";
import Wordle from "./Wordle";
import Keyboard from "./Keyboard";
import Constants from "./Constants";
import "./WordleContainer.scss";

export default function WordleContainer() {
    const [wordleState, setWordleState] = useState({
        attempt: 0,
        previousAttempts: [],
        solved: false,
        keysUsed: [] // { value: "A", keyState: Constants.SOLVED }
    });
    
    const initialState = Array.from({length: 5}, (_, index) => {
        return {
            index,
            value: "",
            solveState: Constants.UNSOLVED
        }
    });
    
    const [currentState, setCurrentState] = useState(initialState);
    
    const updateLetter = (index, value) => {
        setCurrentState([
            ...currentState.slice(0, index),
            {
                index,
                value,
                solveState: Constants.UNSOLVED
            },
            ...currentState.slice(index+1)
        ]);
    };
    
    const makeAttempt = (e) => {
        if (e.key === "Enter") {
    
            setWordleState({
                attempt: wordleState.attempt++,
                previousAttempts: wordleState.previousAttempts.push(currentState),
                solved: false,
                keysUsed: wordleState.keysUsed
            });
            
            setCurrentState(initialState);
        }
    }
    
    return <div onKeyDown={makeAttempt}>
        <h1 className={"wordle-header-title"}>Wordle</h1>
        <Wordle currentState={currentState} updateLetter={updateLetter} attempts={wordleState.attempt}></Wordle>
        <Keyboard keyboardState={{
            keysUsed: wordleState.keysUsed
        }}/>
    </div>;
}
