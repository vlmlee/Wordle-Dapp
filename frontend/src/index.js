import React from "react";
import Dapp from "./Dapp";
import {createRoot} from "react-dom/client";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import "bootstrap/dist/css/bootstrap.css";

const queryClient = new QueryClient()

const root = createRoot(  document.getElementById("root"));

root.render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Dapp />
      </QueryClientProvider>
  </React.StrictMode>,
);
