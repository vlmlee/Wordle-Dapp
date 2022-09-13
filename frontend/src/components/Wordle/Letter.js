import React from "react";
import "./Letter.scss";

const Letter = ({index, value, updateLetter}) => {
    return <div className="wordle-letter">
        <input maxLength={1} value={value} onChange={(e) => updateLetter ? updateLetter(index, e.target.value) : null} />
    </div>;
}

export default Letter;
