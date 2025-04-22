import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../views/Login";
import Register from "../views/Register";
import ControlPanel from "../views/ControlPanel";

export default function nav() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/control" element={<ControlPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
