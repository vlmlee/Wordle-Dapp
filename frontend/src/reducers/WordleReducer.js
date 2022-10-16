import Constants from '../helpers/Constants';

const initialAttemptState = Array.from({ length: 5 }, (_, index) => {
    return {
        position: index,
        value: '',
        solveState: Constants.UNSOLVED
    };
});

const baseWordleState = {
    attemptNumber: 0,
    previousAttempts: [],
    keysUsed: [],
    isWordleSolved: false,
    currentAttempt: initialAttemptState
};

const WORDLE_ACTIONS = {
    INCREMENT_ATTEMPT_NUMBER: 'INCREMENT_ATTEMPT_NUMBER',
    UPDATE_KEYS_USED: 'UPDATE_KEYS_USED',
    SOLVED_WORDLE: 'SOLVED_WORDLE',
    CREATE_NEW_WORDLE: 'CREATE_NEW_WORDLE',
    UPDATE_CURRENT_ATTEMPT: 'UPDATE_CURRENT_ATTEMPT',
    ATTEMPT_SOLVE: 'ATTEMPT_SOLVE'
};

const WordleReducer = (state, action) => {
    switch (action.type) {
        case WORDLE_ACTIONS.INCREMENT_ATTEMPT_NUMBER:
            return {
                ...state,
                attempts: state.attemptNumber++
            };
        case WORDLE_ACTIONS.UPDATE_KEYS_USED:
            const isKeyAlreadyUsed = state.keysUsed.includes(action.payload);
            if (isKeyAlreadyUsed) return state;

            return {
                ...state,
                keysUsed: [...state.keysUsed, action.payload]
            };
        case WORDLE_ACTIONS.SOLVED_WORDLE:
            return {
                ...state,
                isWordleSolved: true
            };
        case WORDLE_ACTIONS.CREATE_NEW_WORDLE:
            return baseWordleState;
        case WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT:
            return {
                ...state,
                currentAttempt: action.payload
            };
        case WORDLE_ACTIONS.ATTEMPT_SOLVE:
            return {
                ...state,
                ...action.payload,
                currentAttempt: initialAttemptState
            };
        default:
            return state;
    }
};

export { baseWordleState, WORDLE_ACTIONS, WordleReducer };

export default WordleReducer;
