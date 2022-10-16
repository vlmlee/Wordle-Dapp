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
    const [{ attemptNumber, previousAttempts, keysUsed, isWordleSolved, currentAttempt, account, contract }, dispatch] =
        useReducer(BaseReducer, initialState);

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

    const updateLetter = (position, value) => {
        const letterUsed = value.toLowerCase();

        if (letterUsed !== '') {
            dispatch({
                type: WORDLE_ACTIONS.UPDATE_CURRENT_ATTEMPT,
                payload: [
                    ...currentAttempt.slice(0, position),
                    {
                        position: position,
                        value: letterUsed,
                        solveState: Constants.UNSOLVED
                    },
                    ...currentAttempt.slice(position + 1)
                ]
            });
            dispatch({
                type: WORDLE_ACTIONS.UPDATE_KEYS_USED,
                payload: letterUsed
            });
        }
    };

    const makeAttempt = (e) => {
        if (attemptNumber < 6 && e.key === 'Enter') {
            const word = currentAttempt
                .map((state) => state.value)
                .join('')
                .toLowerCase();

            if (!isWordInWordBank(word)) {
                console.log('not in word bank');
                return;
            }

            const checkedSolution = checkSolution(currentAttempt);

            dispatch({
                type: WORDLE_ACTIONS.ATTEMPT_SOLVE,
                payload: {
                    attemptNumber: attemptNumber + 1,
                    isWordleSolved: false,
                    previousAttempts: [...previousAttempts, checkedSolution]
                }
            });
        }
    };

    useEffect(() => {
        document.addEventListener('keypress', makeAttempt);

        if (!isEmpty(contract)) {
            // get attempts, etc
        }

        return () => {
            document.removeEventListener('keypress', makeAttempt);
        };
    }, [keysUsed]);

    return (
        <div>
            <h1 className={'wordle__header'}>Wordle</h1>
            <Wordle
                previousAttempts={previousAttempts}
                currentAttempt={currentAttempt}
                updateLetter={updateLetter}
                attemptNumber={attemptNumber}
            />
            <Keyboard previousAttempts={previousAttempts} currentAttempt={currentAttempt} keysUsed={keysUsed} />
        </div>
    );
}
