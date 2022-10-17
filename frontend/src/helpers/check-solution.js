import Constants from './Constants';

import { convertLetterAndPositionToPrimes, onlyUnique } from './wordle-helpers';
import { ethers } from 'ethers';

const wordBank = require('./wordBank.json');

const solveStatePriority = {
    [Constants.NOT_PRESENT_IN_SOLUTION]: 0,
    [Constants.WRONG_POSITION]: 1,
    [Constants.SOLVED]: 2
};

function isWordInWordBank(word) {
    return wordBank.includes(word.toLowerCase());
}

async function attemptToSolve(_contract, attempt) {
    const guess = attempt.map((a) => a.value + a.position);
    return await _contract.makeAttempt(convertLetterAndPositionToPrimes(guess), {
        value: ethers.utils.parseEther('0.0007')
    });
}

async function checkSolution(_answers, currentAttempt) {
    const facadeOfAnswers = [
        ...currentAttempt.map((x) => x.value + x.position),
        ...currentAttempt.map((x) => x.value).filter(onlyUnique)
    ];

    return currentAttempt.map((letterInAttempt, index) => {
        // check if the answer is in the correct position. If so, it is solved.
        if (_answers[index]) {
            return {
                ...letterInAttempt,
                solveState: Constants.SOLVED
            };
        }

        // If it's not in the correct position, check if it's in the set. `facadeOfAnswers` will give us a
        // representation of the boolean values to letters. The returned array of booleans will always be
        // the same length as the guess sent to the contract.
        const indexOfLetterToCheckForMembership = facadeOfAnswers.indexOf(letterInAttempt.value);
        if (_answers[indexOfLetterToCheckForMembership]) {
            return {
                ...letterInAttempt,
                solveState: Constants.WRONG_POSITION
            };
        }

        // If both conditions are false, then the letter was not in the solution.
        return {
            ...letterInAttempt,
            solveState: Constants.NOT_PRESENT_IN_SOLUTION
        };
    });
}

function isValidAttempt(currentAttempt) {
    return currentAttempt.reduce((acc, cur) => {
        return cur.value && acc;
    }, true);
}

export { isWordInWordBank, checkSolution, attemptToSolve, solveStatePriority, isValidAttempt };
