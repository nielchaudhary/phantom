import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster richColors dir="ltr" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
