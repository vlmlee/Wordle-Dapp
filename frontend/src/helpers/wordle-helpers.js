import { BigNumber } from 'ethers';

const primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109,
    113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239,
    241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379,
    383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521,
    523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661,
    673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827,
    829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911
];
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const letterToPrime = (letter, index) =>
    BigNumber.from(`${primes[alphabet.length * index + alphabet.indexOf(letter.toLowerCase())]}`);

const convertPrimesToLetterAndPosition = arr => {
    return arr.map(_prime => {
        const _nonHexPrime = _prime instanceof BigNumber ? _prime.toNumber() : _prime;
        const indexOfPrime = primes.indexOf(_nonHexPrime);
        const letter = alphabet[indexOfPrime % alphabet.length];
        const position = Math.floor(indexOfPrime / (alphabet.length - 1));
        return letter + position;
    });
};

const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
};

const convertLetterAndPositionToPrimes = arr => {
    const guesses = arr.map(x => x.split(''));
    return [
        ...guesses.map(x => letterToPrime(x[0], x[1])),
        ...guesses
            .map(x => x[0])
            .filter(onlyUnique)
            .map(x => letterToPrime(x[0], 5))
    ];
};

const calculateAccumulator = (solution, base, _modulus) => {
    return solution.reduce((acc, cur, i) => {
        if (i === 0) return acc;
        acc = powerMod(acc, cur, _modulus);
        return acc;
    }, powerMod(base, solution[0], _modulus));
};

const calculateWitnesses = (solution, base, _modulus) => {
    return solution.map((p, i, array) => {
        const _primesToCalculate = array.filter((x, j) => j !== i);

        return _primesToCalculate.reduce((acc, cur, j) => {
            if (j === 0) return acc;
            acc = powerMod(acc, cur, _modulus);
            return acc;
        }, powerMod(base, _primesToCalculate[0], _modulus));
    });
};

const powerMod = (base, exponent, modulus) => {
    if (modulus === 1) return 0;
    var result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1)
            //odd number
            result = (result * base) % modulus;
        exponent = exponent >> 1; //divide by 2
        base = (base * base) % modulus;
    }
    return result;
};

export default {
    calculateWitnesses,
    calculateAccumulator,
    onlyUnique,
    letterToPrime,
    alphabet,
    primes,
    powerMod,
    convertLetterAndPositionToPrimes,
    convertPrimesToLetterAndPosition
};
