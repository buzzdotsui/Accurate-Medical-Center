import Hero               from "./Hero";
// import { About }          from "./About";
import { VisionMission }  from "./VisionMission";
import { Services }       from "./Services";
import { CompanyVideo }   from "./CompanyVideo";
import { LookInside }     from "./LookInside";
import { Contact }        from "./Contact";

export function MarketingHome() {
  return (
    <>
      <Hero />
      {/* <About /> */}
      <VisionMission />
      <Services />
      <CompanyVideo />
      <LookInside />
      <Contact />
    </>
  );
}
