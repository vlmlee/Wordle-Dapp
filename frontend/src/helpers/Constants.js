// Solve states
export const UNSOLVED = 'UNSOLVED'; // grey
export const WRONG_POSITION = 'WRONG_POSITION'; // yellow
export const SOLVED = 'SOLVED'; // green

// Keyboard states
export const UNUSED_LETTER = 'UNUSED_LETTER'; // User has not used letter yet
export const NOT_PRESENT_IN_SOLUTION = 'NOT_PRESENT_IN_SOLUTION'; // User has used this letter, and it is not in the solution

export const QWERTY_KEYBOARD = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

const CONSTANTS = {
    SOLVED,
    WRONG_POSITION,
    UNSOLVED,
    UNUSED_LETTER,
    NOT_PRESENT_IN_SOLUTION,
    QWERTY_KEYBOARD
};

export default CONSTANTS;
