import React, { useCallback, useMemo, useReducer } from 'react';
import { useState, useEffect } from 'react';
import Wordle from './components/Wordle';
import Keyboard from './components/Keyboard';
import Constants from './helpers/Constants';
import { isEmpty } from 'lodash';
import { isWordInWordBank, checkSolution } from './helpers/check-solution';
import { ethers } from 'ethers';
import BaseReducer, { initialState } from './reducers/BaseReducer';
import { WEB3_ACTIONS } from './reducers/Web3Reducer';
import { WORDLE_ACTIONS } from './reducers/WordleReducer';
import WordleABI from './contracts/WordleABI.json';
import './stylesheets/Wordle.scss';

export default function Dapp() {
    const [
        { attemptNumber, previousAttempts, keysUsed, isWordleSolved, currentAttempt, account, contract, error },
        dispatch
    ] = useReducer(BaseReducer, initialState);

    const web3Handler = async () => {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        dispatch({
            type: WEB3_ACTIONS.UPDATE_ACCOUNT,
            payload: accounts[0]
        });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const chainId = await provider.request({ method: 'eth_chainId' });

        if (chainId === 11155111) {
            const signer = provider.getSigner();
            await loadContract(provider, signer);
        }
    };

    window.ethereum.on('accountsChanged', ([newAddress]) => {
        if (newAddress !== undefined) {
            dispatch({
                type: WEB3_ACTIONS.UPDATE_ACCOUNT,
                payload: newAddress
            });
        }
    });

    window.ethereum.on('chainChanged', ([chainId]) => {
        // Only Sepolia testnet 11155111 is supported
    });

    const loadContract = async (provider, signer) => {
        const _contract = new ethers.Contract(WordleABI.address, WordleABI.abi, signer);
        dispatch({
            type: WEB3_ACTIONS.UPDATE_CONTRACT,
            payload: _contract
        });
    };

    const makeAttempt = (e) => {
        if (!isWordleSolved && attemptNumber < 5 && e.key === 'Enter') {
            const word = currentAttempt
                .map((state) => state.value)
                .join('')
                .toLowerCase();

            if (!isWordInWordBank(word)) {
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_ERROR,
                    payload: true
                });
                return;
            }

            const checkedSolution = checkSolution(currentAttempt);

            dispatch({
                type: WORDLE_ACTIONS.ATTEMPT_SOLVE,
                payload: {
                    attemptNumber: attemptNumber + 1,
                    previousAttempts: [...previousAttempts, checkedSolution]
                }
            });

            const _isSolved = checkedSolution.reduce((acc, cur) => {
                acc = acc && cur.solveState === Constants.SOLVED;
                return acc;
            }, true);

            if (_isSolved) {
                dispatch({
                    type: WORDLE_ACTIONS.SOLVED_WORDLE
                });
            }
        }
    };

    const deletePreviousLetter = (e) => {
        if (error) {
            dispatch({
                type: WORDLE_ACTIONS.UPDATE_ERROR,
                payload: false
            });
        }

        if (!isWordleSolved && attemptNumber < 5 && (e.key === 'Backspace' || e.key === 'Delete')) {
            const letterAfterDesiredPositionToInvalidate = currentAttempt.find((a) => a.value === '');

            if (!letterAfterDesiredPositionToInvalidate) {
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT,
                    payload: [
                        ...currentAttempt.slice(0, 4),
                        {
                            position: 4,
                            value: '',
                            solveState: Constants.UNSOLVED
                        }
                    ]
                });
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                    payload: currentAttempt[currentAttempt.length - 1].value
                });
            } else if (letterAfterDesiredPositionToInvalidate.position > 1) {
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT,
                    payload: [
                        ...currentAttempt.slice(0, letterAfterDesiredPositionToInvalidate.position - 1),
                        {
                            position: letterAfterDesiredPositionToInvalidate.position - 1,
                            value: '',
                            solveState: Constants.UNSOLVED
                        },
                        ...currentAttempt.slice(letterAfterDesiredPositionToInvalidate.position)
                    ]
                });
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                    payload: letterAfterDesiredPositionToInvalidate.value
                });
            } else if (letterAfterDesiredPositionToInvalidate.position === 1) {
                // Removing the first letter
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT,
                    payload: [
                        {
                            position: letterAfterDesiredPositionToInvalidate.position - 1,
                            value: '',
                            solveState: Constants.UNSOLVED
                        },
                        ...currentAttempt.slice(letterAfterDesiredPositionToInvalidate.position)
                    ]
                });
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                    payload: letterAfterDesiredPositionToInvalidate.value
                });
            }
        }
    };

    const enterLetter = (e) => {
        if (!isWordleSolved && e.keyCode >= 65 && e.keyCode <= 122) {
            const letterUsed = e.key?.toLowerCase();
            const positionToInsert = currentAttempt.find((a) => a.value === '');

            if (positionToInsert?.position === 0) {
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT,
                    payload: [
                        {
                            position: positionToInsert.position,
                            value: letterUsed,
                            solveState: Constants.UNSOLVED
                        },
                        ...currentAttempt.slice(positionToInsert.position + 1)
                    ]
                });
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                    payload: letterUsed
                });
            } else if (positionToInsert?.position > 0) {
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT,
                    payload: [
                        ...currentAttempt.slice(0, positionToInsert.position),
                        {
                            position: positionToInsert.position,
                            value: letterUsed,
                            solveState: Constants.UNSOLVED
                        },
                        ...currentAttempt.slice(positionToInsert.position + 1)
                    ]
                });
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                    payload: letterUsed
                });
            }
        }
    };

    useEffect(() => {
        document.addEventListener('keypress', makeAttempt);
        document.addEventListener('keydown', deletePreviousLetter);
        document.addEventListener('keypress', enterLetter);

        if (!isEmpty(contract)) {
            // get attempts, etc
        }

        return () => {
            document.removeEventListener('keypress', makeAttempt);
            document.removeEventListener('keydown', deletePreviousLetter);
            document.removeEventListener('keypress', enterLetter);
        };
    }, [makeAttempt, deletePreviousLetter, enterLetter]);

    return (
        <div>
            <h1 className={'wordle__header'}>Wordle</h1>
            {error && (
                <div className={'wordle__error-message'}>
                    <p>Unrecognized word</p>
                </div>
            )}
            {isWordleSolved && (
                <div className={'wordle__solved-message'}>
                    <p className={'--green'}>You did it!</p>
                </div>
            )}
            <Wordle
                previousAttempts={previousAttempts}
                currentAttempt={currentAttempt}
                attemptNumber={attemptNumber}
                error={error}
            />
            <Keyboard previousAttempts={previousAttempts} currentAttempt={currentAttempt} keysUsed={keysUsed} />
        </div>
    );
}
