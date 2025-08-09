import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import { Toaster } from "sonner";
import Chat from "./pages/chat";
import SocketProvider from "./context/socket";

function App() {
  return (
    <>
      <Toaster richColors dir="ltr" />
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </>
  );
}

export default App;
