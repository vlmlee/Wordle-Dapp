import React, {useMemo} from "react";
import {useState, useEffect} from "react";
import Wordle from "./components/Wordle";
import Keyboard from "./components/Keyboard";
import Constants from "./components/Constants";
import "./stylesheets/WordleContainer.scss";
import {uniq, isEmpty} from "lodash";
import {isWordInWordBank, checkSolution} from "./helpers/check-solution";
import {ethers} from "ethers";

const initialState = Array.from({length: 5}, (_, index) => {
    return {
        position: index,
        value: "",
        solveState: Constants.UNSOLVED
    }
});

export default function Dapp() {
    const [attempts, setAttempts] = useState(0);
    const [previousStates, setPreviousStates] = useState([]);
    const [keysUsed, setKeysUsed] = useState([]);
    const [isSolved, setIsSolved] = useState(false);
    const [currentState, setCurrentState] = useState(initialState);

    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState({});

    const web3Handler = async () => {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await loadContract(signer);
    };

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
        // `accountsChanged` event can be triggered with an undefined newAddress.
        // This happens when the user removes the NotDapp from the "Connected
        // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
        // To avoid errors, we reset the dapp state
        if (newAddress === undefined) {
            setAccount(newAddress);
        }
    });

    window.ethereum.on("chainChanged", ([chainId]) => {
        // Only Sepolia testnet 11155111 is supported
    });

    // const checkIfConnectedToSepoliaTestNet = async () => {
    //     const chainId = await provider.request({ method: 'eth_chainId' });
    //     return chainId === 11155111;
    // }

    const loadContract = async (signer) => {
        // const _contract = new ethers.Contract(LeaderboardAddress.address, LeaderboardAbi.abi, signer);
        // setContract(_contract);
    };
    
    const updateLetter = (position, value) => {
        if (value !== "") {
            setCurrentState(state => [
                ...state.slice(0, position),
                {
                    position: position,
                    value: value.toLowerCase(),
                    solveState: Constants.UNSOLVED
                },
                ...state.slice(position+1)
            ]);
        }
    };
    
    const makeAttempt = useMemo((e) => {
        if (attempts < 6 && e.key === "Enter") {
            const word = currentState.map(state => state.value).join("").toLowerCase();
    
            if (!isWordInWordBank(word)) {
                console.log("not in word bank")
                return;
            }
    
            const checkedSolution = checkSolution(currentState);
    
            setAttempts(state => state + 1);
            setPreviousStates(state => [...state, checkedSolution]);
            setIsSolved(state => false);
            setKeysUsed(state => uniq([...state, ...currentState.map(letter => letter.value.toUpperCase())]))
            setCurrentState(state => initialState);
        }
    }, [attempts]);

    useEffect(() => {
        document.addEventListener("keypress", makeAttempt);

        if(!isEmpty(contract)) {
            // get attempts, etc
        }
        
        return () => {
           document.removeEventListener("keypress", makeAttempt)
        }
    }, [currentState, keysUsed]);
    
    return <div>
        {/*<div className={"wordle-leaderboard"}>leaderboard</div>*/}
        <h1 className={"wordle-header-title"}>Wordle</h1>
        <Wordle previousStates={previousStates}
                currentState={currentState}
                updateLetter={updateLetter}
                attempts={attempts} />
        <Keyboard previousStates={previousStates} keyboardState={currentState} keysUsed={keysUsed}/>
    </div>;
}
