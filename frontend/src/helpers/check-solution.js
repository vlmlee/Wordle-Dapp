import Constants from './Constants';

import { convertLetterAndPositionToPrimes } from './wordle-helpers';
import { ethers } from 'ethers';

const wordBank = require('./wordBank.json');

const solution = ['r0', 'e1', 'c2', 'a3', 'p4', 'r5', 'e5', 'c5', 'a5', 'p5'];

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

async function checkSolution() {}

function updateSolveStates(currentState) {
    const _letters = currentState.map((x) => x.value);

    const checkedSolution = currentState.map((letter) => {
        if (solution.includes(letter.value)) {
            const attemptContainsMultiple = currentState.filter((l) => l.value === letter.value).length > 1;
            const solutionContainsMultiple =
                solution.filter((s) => s.length > 1 && s.includes(letter.value)).length > 1;

            if (solution.includes(letter.position + letter.value)) {
                return {
                    position: letter.position,
                    value: letter.value,
                    solveState: Constants.SOLVED
                };
            } else if (attemptContainsMultiple && !solutionContainsMultiple) {
                return {
                    position: letter.position,
                    value: letter.value,
                    solveState: Constants.NOT_PRESENT_IN_SOLUTION
                };
            } else {
                return {
                    position: letter.position,
                    value: letter.value,
                    solveState: Constants.WRONG_POSITION
                };
            }
        }

        return {
            position: letter.position,
            value: letter.value,
            solveState: Constants.NOT_PRESENT_IN_SOLUTION
        };
    });

    return checkedSolution;
}

export { isWordInWordBank, checkSolution, updateSolveStates, attemptToSolve, solveStatePriority };
