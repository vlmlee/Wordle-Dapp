import React, {useEffect} from "react";
import Letter from "./Letter";
import FauxRow from "./FauxRow";
import "./Wordle.scss";

export default function Wordle({previousStates, currentState, updateLetter, attempts}) {
    let attemptsLeft = 5 - attempts;
    
    const generatedPreviousAttempts = () => {
        return previousStates.map((states, index) =>
            <div key={index}>
                {states.map((letter, j) =>
                    <Letter key={j}
                            position={letter.position}
                            solveState={letter.solveState}
                            value={letter.value} />)}
            </div>
        );
    };
    
    const generateDivs = () => {
        let arr = [];
        for (let i = 0; i < attemptsLeft; i++) {
            arr.push(<FauxRow key={i} />);
        }
        return arr;
    };
    
    return <div className="wordle">
        {previousStates.length > 0 && <div className={"wordle-attempts"}>
            {generatedPreviousAttempts()}
        </div>}
        <div className={"wordle-current-state"}>
            {currentState.map((letter, index) =>
                <Letter key={index}
                        position={letter.position}
                        solveState={letter.solveState}
                        value={letter.value}
                        updateLetter={updateLetter}/>
            )}
        </div>
        <div className={"wordle-faux-state"}>
            {generateDivs()}
        </div>
    </div>;
}
