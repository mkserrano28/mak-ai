import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fontsource/inter";

import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ChatProvider } from "./context/ChatContext";
import { DocumentProvider } from "./context/DocumentContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WorkspaceProvider>
      <DocumentProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </DocumentProvider>
    </WorkspaceProvider>
  </React.StrictMode>,
);
