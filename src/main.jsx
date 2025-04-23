import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SensorProvider } from "./components/SensorContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SensorProvider>
      <App />
    </SensorProvider>
  </StrictMode>
);
