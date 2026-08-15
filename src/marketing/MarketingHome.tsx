import { Header }         from "./Header";
import Hero               from "./Hero";
// import { About }          from "./About";
import { VisionMission }  from "./VisionMission";
import { Services }       from "./Services";
import { LookInside }     from "./LookInside";
import { Contact }        from "./Contact";
import { Footer }         from "./Footer";
import { Loader }         from "./Loader";

export function MarketingHome() {
  return (
    <div className="flex flex-col min-h-screen">
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
  );
}
