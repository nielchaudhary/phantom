import HeroSection from "../components/sections/hero";
import { ModalProvider } from "../components/ui/animated-modal";

export default function Landing() {
  return (
    <ModalProvider>
      <div className="home-page-bg min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <HeroSection />
      </div>
    </ModalProvider>
  );
}
