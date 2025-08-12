import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import { Toaster } from "sonner";
import Chat from "./pages/chat";

function App() {
  return (
    <>
      <Toaster richColors dir="ltr" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
