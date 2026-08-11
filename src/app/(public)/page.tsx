import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Phone, Calendar, Heart, Shield, Stethoscope, Users, Clock, MapPin, ChevronRight, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Premium Navbar */}
      <header className="h-20 bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3 font-heading font-bold text-2xl text-primary">
          <Logo className="w-8 h-8 text-primary" />
          <span className="leading-none flex flex-col">
            <span>{siteConfig.shortName}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-medium">Medical Center</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/" className="text-primary hover:opacity-80 transition-opacity">Home</Link>
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
          <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link>
          <Link href="/doctors" className="text-muted-foreground hover:text-primary transition-colors">Our Doctors</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-sm font-medium mr-4 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <Phone className="w-4 h-4" />
            <span>Emergency: 112</span>
          </div>
          <Link href="/login">
            <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary/10">Portal Login</Button>
          </Link>
          <Button className="shadow-lg shadow-primary/20">Book Appointment</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-24 lg:py-36 overflow-hidden bg-gradient-to-br from-grey-50 to-grey-100">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="container px-6 lg:px-12 mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase">
                <Heart className="w-4 h-4" /> Trusted Healthcare in Ondo State
              </div>
              <h1 className="text-5xl lg:text-7xl font-heading font-black tracking-tight text-foreground leading-[1.1]">
                Healing Minds,<br/>
                <span className="text-primary drop-shadow-sm">Restoring Lives.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Welcome to Accurate Medical Center. We combine cutting-edge medical technology with compassionate care to deliver world-class healthcare right here in Akure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/25 hover:-translate-y-0.5 transition-transform">
                  <Calendar className="mr-2 h-5 w-5" /> Book a Visit
                </Button>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-background border-2 border-primary/20 hover:bg-primary/5">
                    Patient Portal
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Premium Hero Graphic */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl opacity-50 translate-x-8 translate-y-8" />
              <div className="relative aspect-[4/3] max-w-lg mx-auto bg-card border border-grey-200 rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col justify-between transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
                    <Logo className="w-8 h-8 text-primary" />
                  </div>
                  <div className="px-4 py-1.5 bg-green-500/15 text-green-700 text-sm font-bold rounded-full border border-green-500/20">Available 24/7</div>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div className="space-y-3">
                    <div className="h-3 w-1/4 bg-muted rounded-full" />
                    <div className="h-6 w-3/4 bg-foreground rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted/60 rounded-full" />
                    <div className="h-2 w-5/6 bg-muted/60 rounded-full" />
                    <div className="h-2 w-4/6 bg-muted/60 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-muted/50">
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-grey-200 border-2 border-background" />
                    <div className="w-10 h-10 rounded-full bg-grey-300 border-2 border-background -ml-4" />
                    <div className="w-10 h-10 rounded-full bg-grey-400 border-2 border-background -ml-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">50k+</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Happy Patients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED SERVICES */}
        <section className="py-24 bg-background">
          <div className="container px-6 lg:px-12 mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">Our Centers of Excellence</h2>
              <p className="text-muted-foreground text-lg">We provide specialized, patient-centered care across multiple medical disciplines using state-of-the-art facilities.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Maternal Care', desc: 'Comprehensive antenatal, delivery, and postnatal support.', icon: Heart },
                { title: 'Mental Health', desc: 'Psychological assessment, therapy, and addiction recovery.', icon: Shield },
                { title: 'General Surgery', desc: 'Modern operating theatres with expert surgical teams.', icon: Stethoscope },
                { title: 'Advanced Radiology', desc: 'High-resolution CT, Ultrasound, and Digital X-Ray.', icon: Activity },
                { title: '24/7 Pharmacy', desc: 'Fully stocked dispensary for outpatients and inpatients.', icon: Clock },
                { title: 'Pediatrics', desc: 'Dedicated care for infants, children, and adolescents.', icon: Users },
              ].map((service, i) => (
                <Card key={i} className="group hover:border-primary/50 transition-colors cursor-pointer border-grey-200 shadow-sm hover:shadow-md">
                  <CardContent className="p-8 space-y-4">
                    <div className="w-14 h-14 bg-grey-50 border border-grey-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <service.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold font-heading">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
                    <div className="flex items-center text-primary font-medium text-sm group-hover:underline pt-4">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* EMERGENCY CTA */}
        <section className="py-20 bg-black text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />
          <div className="container px-6 lg:px-12 mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold tracking-widest uppercase border border-red-500/20">
                <Activity className="w-4 h-4" /> Emergency
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold leading-tight">Need Urgent Medical Attention?</h2>
              <p className="text-grey-400 text-lg">Our emergency department is open 24 hours a day, 7 days a week. Our ambulance fleet is always on standby.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Button size="lg" className="h-16 px-10 text-lg bg-primary text-black font-bold hover:bg-primary/90 shadow-xl shadow-primary/20">
                <Phone className="mr-3 h-6 w-6" /> Call 112 Now
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Premium FOOTER */}
      <footer className="bg-background border-t py-16">
        <div className="container px-6 lg:px-12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 font-heading font-bold text-xl text-primary">
              <Logo className="w-8 h-8" />
              <span className="leading-none flex flex-col">
                <span>{siteConfig.shortName}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-medium mt-0.5">Medical Center</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed pr-4">
              Healing Minds, Restoring Lives. Delivering accessible, affordable, and world-class healthcare to Ondo State since 2008.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/doctors" className="hover:text-primary transition-colors">Our Doctors</Link></li>
              <li><Link href="/departments" className="hover:text-primary transition-colors">Departments</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6">Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/services/maternal" className="hover:text-primary transition-colors">Maternal Care</Link></li>
              <li><Link href="/services/mental-health" className="hover:text-primary transition-colors">Mental Health</Link></li>
              <li><Link href="/services/radiology" className="hover:text-primary transition-colors">Radiology</Link></li>
              <li><Link href="/services/laboratory" className="hover:text-primary transition-colors">Laboratory</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="leading-relaxed">109 Irowo Street,<br/>Opposite Mega School,<br/>Hospital Road, Akure</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">+234 (0) 800 ACCURATE</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container px-6 lg:px-12 mx-auto mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} Accurate Medical Center. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
