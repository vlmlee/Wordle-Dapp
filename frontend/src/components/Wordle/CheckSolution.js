import Constants from "./Constants";

const wordBank = require("./wordBank.json");

const solution = ["r", "e", "c", "a", "p", "0r", "1e", "2c", "3a", "4p"];

function isWordInWordBank(word) {
    return wordBank.includes(word);
}

function checkSolution(currentState) {
    const checkedSolution = currentState.map(letter => {
        if (solution.includes(letter.value)) {
            const attemptContainsMultiple = currentState.filter(l => l.value === letter.value).length > 1;
            const solutionContainsMultiple = solution.filter(s => s.length > 1 && s.includes(letter.value)).length > 1;
    
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

export {
    isWordInWordBank,
    checkSolution
};
