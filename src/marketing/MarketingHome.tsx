import { Header }         from "./Header";
import Hero               from "./Hero";
// import { About }          from "./About";
import { VisionMission }  from "./VisionMission";
import { Services }       from "./Services";
import { LookInside }     from "./LookInside";
import { Contact }        from "./Contact";
import { Footer }         from "./Footer";
import { Loader }         from "./Loader";

import { MediaPreloaderProvider } from "./MediaPreloaderContext";
import { MotionConfig } from "framer-motion";

export function MarketingHome() {
  return (
    <MediaPreloaderProvider>
      <MotionConfig reducedMotion="user">
        <div className="flex flex-col min-h-screen bg-[#03161a]">
          <Loader />
          <Header />
          <main className="flex-1">
            <Hero />
            {/* <About /> */}
            <VisionMission />
            <Services />
            <LookInside />
            <Contact />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </MediaPreloaderProvider>
  );
}
