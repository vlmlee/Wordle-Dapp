import React from 'react';
import Dapp from './Dapp';
import { createRoot } from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Dapp />
    </React.StrictMode>
);
