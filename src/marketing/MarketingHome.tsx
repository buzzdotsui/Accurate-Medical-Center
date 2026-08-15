import { Header }         from "./Header";
import Hero               from "./Hero";
import { About }          from "./About";
import { VisionMission }  from "./VisionMission";
import { LookInside }     from "./LookInside";
import { Contact }        from "./Contact";
import { Footer }         from "./Footer";

export function MarketingHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <VisionMission />
        <LookInside />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
