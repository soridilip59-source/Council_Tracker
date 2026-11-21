
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CouncilProvider } from "./context/CouncilContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CouncilProvider>
      <App />
    </CouncilProvider>
  </React.StrictMode>
);
