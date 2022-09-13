import React from "react";
import Key from "./Key";
import Constants from "./Constants";

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Keyboard(keyboardState) {
    const keys = () => {
        let arr = [];
        KEYS.map((row, i) =>
            arr.push(<div key={i}>{row}</div>));
        return arr;
    }
    
    return <div>
        {keys()}
    </div>;
}
