const baseW3State = {
    account: '',
    contract: null,
    isConnected: false
};

const WEB3_ACTIONS = {
    UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
    UPDATE_CONTRACT: 'UPDATE_CONTRACT',
    UPDATED_IS_CONNECTED: 'UPDATE_IS_CONNECTED'
};

const Web3Reducer = (state, action) => {
    switch (action.type) {
        case WEB3_ACTIONS.UPDATE_ACCOUNT:
            return {
                ...state,
                account: action.payload
            };
        case WEB3_ACTIONS.UPDATE_CONTRACT:
            return {
                ...state,
                contract: action.payload
            };
        case WEB3_ACTIONS.UPDATED_IS_CONNECTED:
            return {
                ...state,
                isConnected: action.payload
            };
        default:
            return state;
    }
};

export { baseW3State, WEB3_ACTIONS, Web3Reducer };

export default Web3Reducer;
