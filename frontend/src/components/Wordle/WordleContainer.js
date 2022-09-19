import React from "react";
import {useState, useEffect} from "react";
import Wordle from "./Wordle";
import Keyboard from "./Keyboard";
import Constants from "./Constants";
import "./WordleContainer.scss";
import uniq from "lodash.uniq";

const initialState = Array.from({length: 5}, (_, index) => {
    return {
        index,
        value: "",
        solveState: Constants.UNSOLVED
    }
});

export default function WordleContainer() {
    const [attempts, setAttempts] = useState(0);
    const [previousStates, setPreviousStates] = useState([]);
    const [keysUsed, setKeysUsed] = useState([]);
    const [isSolved, setIsSolved] = useState(false);
    const [currentState, setCurrentState] = useState(initialState);
    
    const updateLetter = (index, value) => {
        setCurrentState(state => [
            ...state.slice(0, index),
            {
                index,
                value,
                solveState: Constants.UNSOLVED
            },
            ...state.slice(index+1)
        ]);
    };
    
    const makeAttempt = (e) => {
        if (attempts < 5 && e.key === "Enter") {
            setAttempts(state => state + 1);
            setPreviousStates(state => [...state, currentState]);
            setIsSolved(state => false);
            setKeysUsed(state => [...state, uniq(currentState.map(letter => letter.value))])
            setCurrentState(state => initialState);
        }
    }
    
    useEffect(() => {
        document.addEventListener("keypress", makeAttempt);
        
        return () => {
           document.removeEventListener("keypress", makeAttempt)
        }
    }, [currentState, keysUsed]);
    
    return <div>
        <h1 className={"wordle-header-title"}>Wordle</h1>
        <Wordle previousStates={previousStates}
                currentState={currentState}
                updateLetter={updateLetter}
                attempts={attempts} />
        <Keyboard keyboardState={{
            keysUsed
        }} />
    </div>;
}
