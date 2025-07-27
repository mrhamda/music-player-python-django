import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Register } from "./components/register";
import { Login } from "./components/login";
import { Home } from "./components/home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
