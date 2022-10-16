import Web3Reducer, { baseW3State } from './Web3Reducer';
import WordleReducer, { baseWordleState } from './WordleReducer';

const combineReducers =
    (...reducers) =>
    (state, action) =>
        reducers.reduce(
            (newState, reducer) => reducer(newState, action),
            state
        );

const BaseReducer = combineReducers([Web3Reducer, WordleReducer]);
const initialState = { ...baseWordleState, ...baseW3State };

export { initialState, BaseReducer };

export default BaseReducer;
