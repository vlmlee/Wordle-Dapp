import React from 'react';
import '../stylesheets/Letter.scss';

const Letter = ({ value, solveState, error }) => {
    return (
        <div
            className={`letter letter--${solveState} ${value ? 'letter--animate' : ''} ${
                error ? 'letter--animate-error' : ''
            }`}>
            <input disabled={true} maxLength={1} value={value} />
        </div>
    );
};

export default Letter;
