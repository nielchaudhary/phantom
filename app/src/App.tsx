import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import { Toaster } from "sonner";
import Chat from "./pages/chat";
import { RecoilRoot } from "recoil";

function App() {
  return (
    <>
      <RecoilRoot>
        <Toaster richColors dir="ltr" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </>
  );
}

export default App;
