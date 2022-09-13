import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./components/Dapp";
import {createRoot} from "react-dom/client";

// We import bootstrap here, but you can remove if you want
import "bootstrap/dist/css/bootstrap.css";

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.
const root = createRoot(  document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
);
