import React from "react";
import "../stylesheets/Letter.scss";

const Letter = ({position, value, updateLetter, solveState}) => {
    return <div className={`wordle-letter wordle-letter-${solveState}`}>
        <input maxLength={1} value={value} onChange={(e) => updateLetter ? updateLetter(position, e.target.value) : null} />
    </div>;
}

export default Letter;
