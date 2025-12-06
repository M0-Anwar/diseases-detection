import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import InputPage from "./pages/InputPage"
import ResultsPage from "./pages/ResultsPage"
import MutationDetailPage from "./pages/MutationDetailPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/mutation-detail/:id" element={<MutationDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
