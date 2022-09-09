import React from "react";
import Letter from "./Letter";

export default function Wordle({currentState, updateLetter}) {
    return <div>
        {currentState.map(state =>
            <Letter index={state.index}
                    solveState={state.solveState}
                    value={state.value}
                    updateLetter={updateLetter}/>
        )}
    </div>;
}
