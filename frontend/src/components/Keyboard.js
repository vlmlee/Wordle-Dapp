import React from 'react';
import Constants from '../helpers/Constants';
import '../stylesheets/Keyboard.scss';
import { flatten } from 'lodash';
import { QWERTY_KEYBOARD } from '../helpers/Constants';

const Key = ({ _className, letter }) => <div className={_className}>{letter}</div>;

const insertEnterKey = (determineKeyState, letter, j) => {
    const _className = `keyboard__key ${'keyboard__key--' + determineKeyState(letter)}`;

    return (
        <React.Fragment key={`fragment-${j}`}>
            <div
                key={`keyboard__enter-key-${j}`}
                className={`keyboard__key keyboard__enter-key keyboard__key--UNUSED_LETTER`}
            >
                ENTER
            </div>
            <Key key={`keyboard__key-${j}`} _className={_className} letter={letter} />
        </React.Fragment>
    );
};

const insertBackspaceKey = (determineKeyState, letter, j) => {
    const _className = `keyboard__key ${'keyboard__key--' + determineKeyState(letter)}`;

    return (
        <React.Fragment key={`fragment-${j}`}>
            <Key key={`keyboard__key-${j}`} _className={_className} letter={letter} />
            <div
                key={`keyboard__backspace-key-${j}`}
                className={'keyboard__key keyboard__backspace-key keyboard__key--UNUSED_LETTER'}
            >
                <img src="backspace-svgrepo-com.svg" alt="svg" />
            </div>
        </React.Fragment>
    );
};

export default function Keyboard({ previousAttempts, currentAttempt, keysUsed }) {
    const isKeyUsed = (key) => {
        return keysUsed?.includes(key.toLowerCase());
    };

    const determineKeyState = (key) => {
        if (isKeyUsed(key)) {
            const foundKey = [...flatten(previousAttempts), currentAttempt].find((k) => k.value === key.toLowerCase());
            const isSolved = foundKey?.solveState === Constants.SOLVED;
            const isInWrongPosition = foundKey?.solveState === Constants.WRONG_POSITION;

            if (isSolved) return Constants.SOLVED;
            if (isInWrongPosition) return Constants.WRONG_POSITION;
            return 'USED_LETTER';
        }

        return 'UNUSED_LETTER';
    };

    return (
        <div className={'keyboard'}>
            {QWERTY_KEYBOARD.map((keys_row, i) => (
                <div key={`keyboard__row-${i}`} className={'keyboard__row'}>
                    {keys_row.split('').map((letter, j) => {
                        if (letter === 'Z') {
                            return insertEnterKey(determineKeyState, letter, j);
                        }

                        if (letter === 'M') {
                            return insertBackspaceKey(determineKeyState, letter, j);
                        }

                        return (
                            <Key
                                key={`keyboard__key-${j}`}
                                _className={`keyboard__key ${'keyboard__key--' + determineKeyState(letter)}`}
                                letter={letter}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
