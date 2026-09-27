import Hero               from "./Hero";
// import { About }          from "./About";
import { VisionMission }  from "./VisionMission";
import { Services }       from "./Services";
import { CompanyVideo }   from "./CompanyVideo";
import { LookInside }     from "./LookInside";
import { Contact }        from "./Contact";

import { FadeIn }         from "@/components/ui/fade-in";

export function MarketingHome() {
  return (
    <>
      <FadeIn direction="none">
        <Hero />
      </FadeIn>
      
      <FadeIn>
        <VisionMission />
      </FadeIn>
      
      <FadeIn>
        <Services />
      </FadeIn>
      
      <FadeIn>
        <CompanyVideo />
      </FadeIn>
      
      <FadeIn>
        <LookInside />
      </FadeIn>
      
      <FadeIn>
        <Contact />
      </FadeIn>
    </>
  );
}
