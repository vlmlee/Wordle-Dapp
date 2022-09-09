import React from "react";

const Letter = ({index, value, updateLetter}) => {
    return <div className="wordle-letter">
        <input value={value} onChange={(e) => updateLetter(index, e.target.value)} />
    </div>;
}

export default Letter;
