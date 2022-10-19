import React, { useCallback, useEffect, useReducer } from 'react';
import Wordle from './components/Wordle';
import Keyboard from './components/Keyboard';
import Constants from './helpers/Constants';
import { attemptToSolve, checkSolution, isValidAttempt, isWordInWordBank } from './helpers/check-solution';
import { ethers } from 'ethers';
import BaseReducer, { initialState } from './reducers/BaseReducer';
import { WEB3_ACTIONS } from './reducers/Web3Reducer';
import { initialAttemptState, WORDLE_ACTIONS } from './reducers/WordleReducer';
import WordleAddress from './contracts/contract-address.json';
import WordleABI from './contracts/WordleABI.json';
import './stylesheets/Wordle.scss';

import Helpers from './helpers/wordle-helpers';

export default function Dapp() {
    const [
        {
            attemptNumber,
            previousAttempts,
            keysUsed,
            isWordleSolved,
            currentAttempt,
            account,
            contract,
            error,
            wordlePuzzleNumber,
            isConnected
        },
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

        const signer = provider.getSigner();
        await loadContract(provider, signer);
    };

    const loadContract = async (provider, signer) => {
        const _contract = new ethers.Contract(WordleAddress.address, WordleABI.abi, signer);
        dispatch({
            type: WEB3_ACTIONS.UPDATE_CONTRACT,
            payload: _contract
        });
        dispatch({
            type: WEB3_ACTIONS.UPDATED_IS_CONNECTED,
            payload: true
        });
    };

    window.ethereum.on('accountsChanged', ([newAddress]) => {
        if (newAddress !== undefined) {
            dispatch({
                type: WEB3_ACTIONS.UPDATE_ACCOUNT,
                payload: newAddress
            });
        } else {
            dispatch({
                type: WEB3_ACTIONS.UPDATE_ACCOUNT,
                payload: ''
            });
        }
    });

    const makeAttempt = useCallback(
        async e => {
            if (isConnected && !isWordleSolved && attemptNumber < 5 && e.key === 'Enter') {
                const word = currentAttempt
                    .map(state => state.value)
                    .join('')
                    .toLowerCase();

                if (!isWordInWordBank(word)) {
                    dispatch({
                        type: WORDLE_ACTIONS.UPDATE_ERROR,
                        payload: true
                    });
                    return;
                }

                await attemptToSolve(contract, currentAttempt);
            }
        },
        [currentAttempt, attemptNumber, contract, isWordleSolved, isConnected]
    );

    const deletePreviousLetter = useCallback(
        e => {
            if (error) {
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_ERROR,
                    payload: false
                });
            }

            if (!isWordleSolved && attemptNumber < 5 && (e.key === 'Backspace' || e.key === 'Delete')) {
                const letterAfterDesiredPositionToInvalidate = currentAttempt.find(a => a.value === '');

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
        },
        [attemptNumber, currentAttempt, error, isWordleSolved]
    );

    const enterLetter = useCallback(
        e => {
            if (isConnected && !isWordleSolved && e.keyCode >= 65 && e.keyCode <= 122) {
                const letterUsed = e.key?.toLowerCase();
                const positionToInsert = currentAttempt.find(a => a.value === '');

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
        },
        [currentAttempt, isWordleSolved, isConnected]
    );

    const contractEventListener = useCallback(
        (_player, _attemptNumber, _wordlePuzzleNo, _answer, isSolved) => {
            if (isValidAttempt(currentAttempt) && _wordlePuzzleNo.toNumber() === wordlePuzzleNumber) {
                checkSolution(_answer, currentAttempt).then(checkedSolution => {
                    dispatch({
                        type: WORDLE_ACTIONS.ATTEMPT_SOLVE,
                        payload: {
                            attemptNumber: _attemptNumber,
                            previousAttempts: [...previousAttempts, checkedSolution]
                        }
                    });

                    if (isSolved) {
                        dispatch({
                            type: WORDLE_ACTIONS.SOLVED_WORDLE
                        });
                    }
                });
            }
        },
        [currentAttempt, wordlePuzzleNumber, previousAttempts]
    );

    const playerHasAlreadySolvedWordleListener = useCallback(
        (_player, _wordlePuzzleNumber) => {
            if (_wordlePuzzleNumber === wordlePuzzleNumber) {
            }
        },
        [wordlePuzzleNumber]
    );

    useEffect(() => {
        async function getPrevAttempts() {
            if (contract) {
                const prevAttempts = await contract.getCurrentAttempts(account);
                if (prevAttempts.length) {
                    const prevAttemptsStates = prevAttempts.map(attempt => {
                        const letters = Helpers.convertPrimesToLetterAndPosition(attempt);
                        return initialAttemptState.map((s, i) => {
                            return {
                                ...s,
                                value: letters[i][0]
                            };
                        });
                    });

                    // Don't really like this since it exposes what players have already tried. In the future,
                    // we'd want to keep past results in local storage, but this won't fix the issue of not
                    // having a suitable place for persistent storage without revealing information about the puzzle
                    // to other players.
                    const prevAnswers = await contract.getCurrentAnswers(account);

                    let previousAttemptsWithSolveStates = [];

                    for (let i = 0; i < prevAttemptsStates.length; i++) {
                        const checkedSolution = await checkSolution(prevAnswers[i], prevAttemptsStates[i]);
                        previousAttemptsWithSolveStates.push(checkedSolution);
                    }

                    dispatch({
                        type: WORDLE_ACTIONS.SET_PREVIOUS_ATTEMPTS,
                        payload: {
                            previousAttempts: previousAttemptsWithSolveStates,
                            attemptNumber: previousAttemptsWithSolveStates.length
                        }
                    });
                    dispatch({
                        type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                        payload: ''
                    });
                }
            }
        }

        getPrevAttempts();

        async function getCurrentWordleNumber() {
            if (contract) {
                const currentWordleNumber = await contract.wordlePuzzleNo();
                dispatch({
                    type: WORDLE_ACTIONS.UPDATE_WORDLE_PUZZLE_NUMBER,
                    payload: currentWordleNumber.toNumber()
                });
            }
        }

        getCurrentWordleNumber();
    }, [contract, account]);

    useEffect(() => {
        document.addEventListener('keypress', makeAttempt);
        document.addEventListener('keydown', deletePreviousLetter);
        document.addEventListener('keypress', enterLetter);

        return () => {
            document.removeEventListener('keypress', makeAttempt);
            document.removeEventListener('keydown', deletePreviousLetter);
            document.removeEventListener('keypress', enterLetter);
        };
    }, [makeAttempt, deletePreviousLetter, enterLetter]);

    useEffect(() => {
        if (contract) {
            contract.on('PlayerMadeAttempt', contractEventListener, { fromBlock: 'latest' });
            contract.on('PlayerSolvedWordle', playerHasAlreadySolvedWordleListener);
        }

        return () => {
            if (contract) {
                contract.off('PlayerMadeAttempt', contractEventListener);
                contract.off('PlayerSolvedWordle', playerHasAlreadySolvedWordleListener);
            }
        };
    }, [contract, contractEventListener, playerHasAlreadySolvedWordleListener, wordlePuzzleNumber]);

    return (
        <div>
            <div className={'connect-wallet'}>
                <div
                    className={`connect-wallet__button ${account ? 'connect-wallet--connected' : ''}`}
                    onClick={web3Handler}>
                    {account ? 'Connected' : 'Connect Wallet'}
                </div>
                <div className={`connect-wallet__address`}>
                    {account && (
                        <a
                            className="connect-wallet__address-link"
                            href={`https://sepolia.etherscan.io/address/${account}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            ({account.slice(0, 4)}...{account.slice(account.length - 4)})
                        </a>
                    )}
                </div>
            </div>
            <h1 className={'wordle__header'}>Wordle</h1>
            {error && (
                <div className={'wordle__error-message'}>
                    <p>Unrecognized word</p>
                </div>
            )}
            {!isConnected && (
                <div className={'wordle__connection-error-message'}>
                    <p>Please connect to a wallet to play</p>
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
            <div className={'wordle__created-by'}>
                <a href={'https://www.mlee.app'}>- created by mlee &nbsp;</a>
                <span>👀</span>
            </div>
        </div>
    );
}
