// Solve states
const UNSOLVED = "UNSOLVED"; // grey
const WRONG_POSITION = "WRONG_POSITION"; // yellow
const SOLVED = "SOLVED"; // green

// Keyboard states
const UNUSED_LETTER = "UNUSED_LETTER"; // User has not used letter yet
const NOT_PRESENT_IN_SOLUTION = "NOT_PRESENT_IN_SOLUTION"; // User has used this letter, and it is not in the solution

export default {SOLVED, WRONG_POSITION, UNSOLVED, UNUSED_LETTER, NOT_PRESENT_IN_SOLUTION};
