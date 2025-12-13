import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Description from "./pages/Description"
import About from "./pages/About"
import Diagnose from "./pages/Diagnose"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/description" element={<Description />} />
        <Route path="/about" element={<About />} />
        <Route path="/diagnose" element={<Diagnose />} />
      </Routes>
    </BrowserRouter>
  )
}
