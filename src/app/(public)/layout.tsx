import { Header } from "@/marketing/Header";
import { Footer } from "@/marketing/Footer";
import { MediaPreloaderProvider } from "@/marketing/MediaPreloaderContext";
import { MotionConfig } from "framer-motion";
import { Loader } from "@/marketing/Loader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MediaPreloaderProvider>
      <MotionConfig reducedMotion="user">
        <div className="flex flex-col min-h-screen bg-[#03161a]">
          <Loader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </MotionConfig>
    </MediaPreloaderProvider>
  );
}
