import { createContext, useContext, useState } from "react";

const SensorContext = createContext();

export const useSensor = () => useContext(SensorContext);

export const SensorProvider = ({ children }) => {
  const [gasValue, setGasValue] = useState(0);
  const [flameValue, setFlameValue] = useState(0);

  return (
    <SensorContext.Provider
      value={{ gasValue, setGasValue, flameValue, setFlameValue }}
    >
      {children}
    </SensorContext.Provider>
  );
};
