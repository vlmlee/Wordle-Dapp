import React from "react";
import {useState, useEffect} from "react";
import Wordle from "./Wordle";
import Keyboard from "./Keyboard";
import Constants from "./Constants";
import "./WordleContainer.scss";
import uniq from "lodash.uniq";
import {isWordInWordBank, checkSolution} from "./CheckSolution";

const initialState = Array.from({length: 5}, (_, index) => {
    return {
        position: index,
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
    
    const updateLetter = (position, value) => {
        if (value !== "") {
            setCurrentState(state => [
                ...state.slice(0, position),
                {
                    position: position,
                    value: value.toLowerCase(),
                    solveState: Constants.UNSOLVED
                },
                ...state.slice(position+1)
            ]);
        }
    };
    
    const makeAttempt = (e) => {
        if (attempts < 5 && e.key === "Enter") {
            const word = currentState.map(state => state.value).join("").toLowerCase();
    
            if (!isWordInWordBank(word)) {
                console.log("not in word bank")
                return;
            }
    
            const checkedSolution = checkSolution(currentState);
    
            setAttempts(state => state + 1);
            setPreviousStates(state => [...state, checkedSolution]);
            setIsSolved(state => false);
            setKeysUsed(state => uniq([...state, ...currentState.map(letter => letter.value.toUpperCase())]))
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
        {/*<div className={"wordle-leaderboard"}>leaderboard</div>*/}
        <h1 className={"wordle-header-title"}>Wordle</h1>
        <Wordle previousStates={previousStates}
                currentState={currentState}
                updateLetter={updateLetter}
                attempts={attempts} />
        <Keyboard keyboardState={currentState} keysUsed={keysUsed}/>
    </div>;
}
