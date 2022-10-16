import React from 'react';
import '../stylesheets/Letter.scss';

const Letter = ({ value, solveState }) => {
    return (
        <div className={`letter letter--${solveState}`}>
            <input disabled={true} maxLength={1} value={value} />
        </div>
    );
};

export default Letter;
