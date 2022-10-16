import React from "react";

const Key = ({value, keyState}) => {
    return <div className={keyState}>
        {value}
    </div>;
};

export default Key;
