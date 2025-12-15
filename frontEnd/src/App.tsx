import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Description from "./pages/Description"
import About from "./pages/About"
import InputPage from "./pages/InputPage"
import ResultsPage from "./pages/ResultsPage"
import DNAEducation from "./pages/DNAEducation"
import ClinicalReportPage from "./components/diagnose/ClinicalReportPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/description" element={<Description />} />
        <Route path="/about" element={<About />} />
        <Route path="/education" element={<DNAEducation />} />
        <Route path="/diagnose" element={<InputPage />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/mutation-detail/:diseaseId" element={<ClinicalReportPage />} />
      </Routes>
    </BrowserRouter>
  )
}
