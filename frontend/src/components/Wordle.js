import React, { useEffect } from 'react';
import Letter from './Letter';
import FauxRow from './FauxRow';
import '../stylesheets/Wordle.scss';

export default function Wordle({ previousAttempts, currentAttempt, attemptNumber }) {
    let attemptsLeft = 5 - attemptNumber;

    const generatedPreviousAttempts = () => {
        return previousAttempts.map((_attempts, i) => (
            <div key={`previous-attempts__row-${i}`}>
                {_attempts.map((letter, j) => (
                    <Letter
                        key={`previous_attempts__element-${j}`}
                        position={letter.position}
                        solveState={letter.solveState}
                        value={letter.value}
                    />
                ))}
            </div>
        ));
    };

    const generateEmptyRows = () => {
        let arr = [];
        for (let i = 0; i < attemptsLeft; i++) {
            arr.push(<FauxRow key={`empty-rows-${i}`} />);
        }
        return arr;
    };

    return (
        <div className="wordle">
            {previousAttempts.length > 0 && <div className={'previous-attempts'}>{generatedPreviousAttempts()}</div>}
            <div className={'current-attempt'}>
                {currentAttempt.map((letter, i) => (
                    <Letter
                        key={`current-attempt__letter-${i}`}
                        position={letter.position}
                        solveState={letter.solveState}
                        value={letter.value}
                    />
                ))}
            </div>
            <div className={'empty-rows'}>{generateEmptyRows()}</div>
        </div>
    );
}
