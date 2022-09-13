import React, {useEffect} from "react";
import Letter from "./Letter";
import FauxRow from "./FauxRow";
import "./Wordle.scss";

export default function Wordle({currentState, updateLetter, attempts}) {
    let attemptsLeft = 5 - attempts;
    
    const generateDivs = () => {
        let arr = [];
        for (let i = 0; i < attemptsLeft; i++) {
            arr.push(<FauxRow key={i} />);
        }
        return arr;
    };
    
    return <div className="wordle">
        {false && <div className={"wordle-attempts"}>
        
        </div>}
        <div className={"wordle-current-state"}>
            {currentState.map((state, index) =>
                <Letter key={index}
                        index={state.index}
                        solveState={state.solveState}
                        value={state.value}
                        updateLetter={updateLetter}/>
            )}
        </div>
        <div className={"wordle-faux-state"}>
            {generateDivs()}
        </div>
    </div>;
}
