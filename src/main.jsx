import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SensorProvider } from "./components/SensorContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/kma-freertos">
      <SensorProvider>
        <App />
      </SensorProvider>
    </BrowserRouter>
  </StrictMode>
);
