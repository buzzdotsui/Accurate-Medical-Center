"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Ambulance,
  Baby,
  Bed,
  Brain,
  FlaskConical,
  HeartHandshake,
  Radiation,
  ScanLine,
  Scissors,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  HeartPulse,
  Pill,
  Microscope,
  Sprout,
  UserRound,
  Heart,
  Lungs,
  Bone,
  Eye,
  Tooth,
  Ear,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import {
  ctaLift,
  contentReveal,
  headingReveal,
  serviceRowReveal,
  servicesStagger,
  sectionReveal,
} from "./animations";
import { displayHeadingClassName, displayHeadingStyle } from "./typography";

const BG_NEUTRAL = "var(--marketing-ivory)";
const CHARCOAL = "var(--marketing-ink)";
const CHARCOAL_MUTED = "rgba(3,22,26,0.65)";
const PRIMARY = "var(--primary)";
const BORDER = "var(--border)";

type IconKey =
  | "heart-pulse"
  | "pill"
  | "microscope"
  | "sprout"
  | "user-round"
  | "heart"
  | "lungs"
  | "bone"
  | "eye"
  | "tooth"
  | "ear"
  | "shield-check"
  | "baby"
  | "stethoscope"
  | "scissors"
  | "bed"
  | "scan-line"
  | "radiation"
  | "flask-conical"
  | "ambulance"
  | "help-circle";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number; style?: React.CSSProperties }>> = {
  "heart-pulse": HeartPulse,
  "pill": Pill,
  "microscope": Microscope,
  "sprout": Sprout,
  "user-round": UserRound,
  "heart": Heart,
  "lungs": Lungs,
  "bone": Bone,
  "eye": Eye,
  "tooth": Tooth,
  "ear": Ear,
  "shield-check": ShieldCheck,
  baby: Baby,
  stethoscope: Stethoscope,
  scissors: Scissors,
  bed: Bed,
  "scan-line": ScanLine,
  radiation: Radiation,
  "flask-conical": FlaskConical,
  ambulance: Ambulance,
  "help-circle": HelpCircle,
};

const SERVICE_ICON_MOTION: Record<IconKey, Variants> = {
  "heart-pulse": { rest: { scale: 1 }, active: { scale: 1.09 } },
  pill: { rest: { scale: 1, y: 0 }, active: { scale: 1.06, y: -1 } },
  microscope: { rest: { scale: 1, y: 0 }, active: { scale: 1.06, y: -1 } },
  sprout: { rest: { y: 0, scale: 1 }, active: { y: -3, scale: 1.05 } },
  "user-round": { rest: { scale: 1, x: 0 }, active: { x: 2, scale: 1.05 } },
  heart: { rest: { scale: 1 }, active: { scale: 1.08 } },
  lungs: { rest: { scale: 1, y: 0 }, active: { scale: 1.06, y: -1 } },
  bone: { rest: { scale: 1 }, active: { rotate: -3, scale: 1.04 } },
  eye: { rest: { scale: 1 }, active: { scale: 1.08 } },
  tooth: { rest: { scale: 1 }, active: { scale: 1.06 } },
  ear: { rest: { scale: 1 }, active: { scale: 1.06 } },
  "shield-check": { rest: { scale: 1, y: 0 }, active: { scale: 1.06, y: -1 } },
  baby: { rest: { y: 0, scale: 1 }, active: { y: -3, scale: 1.05 } },
  stethoscope: { rest: { x: 0, scale: 1 }, active: { x: 2, scale: 1.05 } },
  scissors: { rest: { rotate: 0, scale: 1 }, active: { rotate: -5, scale: 1.04 } },
  bed: { rest: { y: 0, scale: 1 }, active: { y: -2, scale: 1.04 } },
  "scan-line": { rest: { x: 0, scale: 1 }, active: { x: 2, scale: 1.04 } },
  radiation: { rest: { scale: 1 }, active: { scale: 1.055 } },
  "flask-conical": { rest: { y: 0, scale: 1 }, active: { y: -2, scale: 1.04 } },
  ambulance: { rest: { x: 0, scale: 1 }, active: { x: 3, scale: 1.04 } },
  "help-circle": { rest: { scale: 1 }, active: { scale: 1.06 } },
};

interface ServiceCategory {
  title: string;
  description: string;
  icon: "clinical" | "specialty" | "support" | "emergency";
  services: Array<{
    id: string;
    icon: IconKey;
    title: string;
    desc: string;
    href: string;
  }>;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: "Core Clinical Services",
    description: "Primary and specialty outpatient care delivered by our experienced consultants.",
    icon: "clinical",
    services: [
      {
        id: "outpatient",
        icon: "user-round",
        title: "General Outpatient Clinic",
        desc: "Comprehensive primary care consultations with experienced physicians for acute and chronic conditions.",
        href: "/book-appointment?service=Outpatient%20Clinic",
      },
      {
        id: "cardiology",
        icon: "heart-pulse",
        title: "Cardiology",
        desc: "Diagnosis and management of cardiovascular diseases including hypertension, heart failure, and arrhythmias.",
        href: "/book-appointment?service=Cardiology",
      },
      {
        id: "respiratory",
        icon: "lungs",
        title: "Respiratory Medicine",
        desc: "Treatment of asthma, COPD, pneumonia, and other pulmonary conditions with spirometry and nebulization.",
        href: "/book-appointment?service=Respiratory%20Medicine",
      },
      {
        id: "gastroenterology",
        icon: "help-circle",
        title: "Gastroenterology",
        desc: "Diagnosis and treatment of digestive disorders including ulcers, hepatitis, and inflammatory bowel disease.",
        href: "/book-appointment?service=Gastroenterology",
      },
      {
        id: "neurology",
        icon: "brain",
        title: "Neurology",
        desc: "Management of stroke, epilepsy, headaches, neuropathies, and movement disorders.",
        href: "/book-appointment?service=Neurology",
      },
      {
        id: "dermatology",
        icon: "help-circle",
        title: "Dermatology",
        desc: "Diagnosis and treatment of skin conditions including eczema, psoriasis, acne, and skin infections.",
        href: "/book-appointment?service=Dermatology",
      },
    ],
  },
  {
    title: "Specialty Centers of Excellence",
    description: "Dedicated programs for complex conditions requiring multidisciplinary expertise.",
    icon: "specialty",
    services: [
      {
        id: "infertility",
        icon: "sprout",
        title: "Fertility & IVF Center",
        desc: "Advanced reproductive technologies including IVF, IUI, ovulation induction, and fertility preservation.",
        href: "/book-appointment?service=Infertility%20Care",
      },
      {
        id: "addiction",
        icon: "shield-check",
        title: "Addiction Recovery Center",
        desc: "Structured medical detoxification, counseling, and rehabilitation programs for substance use disorders.",
        href: "/book-appointment?service=Addiction%20Care",
      },
      {
        id: "mental-health",
        icon: "brain",
        title: "Mental Health & Therapy",
        desc: "Psychiatric evaluation, psychotherapy (CBT, counseling), and medication management for depression, anxiety, and mood disorders.",
        href: "/book-appointment?service=Psychological%20Therapy",
      },
      {
        id: "orthopedics",
        icon: "bone",
        title: "Orthopedics & Sports Medicine",
        desc: "Fracture management, joint replacement, arthroscopy, and sports injury rehabilitation.",
        href: "/book-appointment?service=Orthopedics",
      },
      {
        id: "ophthalmology",
        icon: "eye",
        title: "Ophthalmology",
        desc: "Cataract surgery, glaucoma management, diabetic retinopathy screening, and refractive error correction.",
        href: "/book-appointment?service=Ophthalmology",
      },
      {
        id: "ent",
        icon: "ear",
        title: "ENT (Otolaryngology)",
        desc: "Treatment of ear infections, hearing loss, sinusitis, tonsillitis, and voice disorders.",
        href: "/book-appointment?service=ENT",
      },
      {
        id: "dental",
        icon: "tooth",
        title: "Dental & Maxillofacial Surgery",
        desc: "Restorative dentistry, oral surgery, orthodontics, and management of facial trauma.",
        href: "/book-appointment?service=Dental%20Services",
      },
    ],
  },
  {
    title: "Women's & Children's Health",
    description: "Comprehensive care for mothers and children from conception through adolescence.",
    icon: "specialty",
    services: [
      {
        id: "obstetrics",
        icon: "heart",
        title: "Obstetrics & Antenatal Care",
        desc: "Complete pregnancy care including antenatal visits, high-risk pregnancy management, and safe delivery.",
        href: "/book-appointment?service=Pregnancy%20%26%20Maternal%20Care",
      },
      {
        id: "gynecology",
        icon: "sprout",
        title: "Gynecology",
        desc: "Management of menstrual disorders, fibroids, endometriosis, family planning, and menopause care.",
        href: "/book-appointment?service=Gynecology",
      },
      {
        id: "pediatrics",
        icon: "baby",
        title: "Pediatrics & Neonatal Care",
        desc: "Well-child visits, immunizations, growth monitoring, and management of childhood illnesses.",
        href: "/book-appointment?service=Pediatrics",
      },
      {
        id: "nicu",
        icon: "heart-pulse",
        title: "Neonatal Intensive Care (NICU)",
        desc: "Level II neonatal care for premature and critically ill newborns with 24/7 monitoring.",
        href: "/book-appointment?service=NICU",
      },
    ],
  },
  {
    title: "Diagnostic & Therapeutic Services",
    description: "State-of-the-art laboratory, imaging, and pharmacy services supporting accurate diagnosis and treatment.",
    icon: "support",
    services: [
      {
        id: "laboratory",
        icon: "microscope",
        title: "Clinical Laboratory",
        desc: "Full-spectrum testing: hematology, chemistry, microbiology, serology, hormone assays, and histopathology.",
        href: "/book-appointment?service=Laboratory%20Services",
      },
      {
        id: "radiology",
        icon: "radiation",
        title: "Radiology & Imaging",
        desc: "Digital X-ray, ultrasound (obstetric, abdominal, pelvic, vascular), and echocardiography.",
        href: "/book-appointment?service=Radiology",
      },
      {
        id: "ultrasound",
        icon: "scan-line",
        title: "Ultrasound Services",
        desc: "Obstetric, abdominal, pelvic, thyroid, breast, and vascular Doppler ultrasound studies.",
        href: "/book-appointment?service=Ultrasound%20Scan",
      },
      {
        id: "pharmacy",
        icon: "pill",
        title: "Pharmacy & Medication Counseling",
        desc: "Dispensing, drug information, adherence counseling, and antimicrobial stewardship.",
        href: "/book-appointment?service=Pharmacy",
      },
      {
        id: "physiotherapy",
        icon: "heart-pulse",
        title: "Physiotherapy & Rehabilitation",
        desc: "Post-operative rehab, stroke rehab, musculoskeletal therapy, and electrotherapy modalities.",
        href: "/book-appointment?service=Physiotherapy",
      },
    ],
  },
  {
    title: "Emergency & Critical Care",
    description: "24/7 emergency response, resuscitation, and critical care services.",
    icon: "emergency",
    services: [
      {
        id: "emergency",
        icon: "ambulance",
        title: "Accident & Emergency (A&E)",
        desc: "24/7 walk-in emergency care with triage, resuscitation, and stabilization for all acute conditions.",
        href: "/book-appointment?service=Emergency%20Services",
      },
      {
        id: "icu",
        icon: "heart-pulse",
        title: "Intensive Care Unit (ICU)",
        desc: "Ventilatory support, hemodynamic monitoring, and multi-organ support for critically ill patients.",
        href: "/book-appointment?service=ICU",
      },
      {
        id: "ambulance",
        icon: "ambulance",
        title: "Ambulance & Patient Transport",
        desc: "ACLS/BLS equipped ambulances with trained paramedics for inter-facility and emergency transport.",
        href: "/book-appointment?service=Ambulance%20Services",
      },
    ],
  },
];

const APPOINTMENT_SERVICE_BY_MARKETING_TITLE: Record<string, string> = {
  "General Outpatient Clinic": "Outpatient Clinic",
  Cardiology: "Cardiology",
  "Respiratory Medicine": "Respiratory Medicine",
  Gastroenterology: "Gastroenterology",
  Neurology: "Neurology",
  Dermatology: "Dermatology",
  "Fertility & IVF Center": "Infertility Care",
  "Addiction Recovery Center": "Addiction Care",
  "Mental Health & Therapy": "Psychological Therapy",
  Orthopedics: "Orthopedics",
  Ophthalmology: "Ophthalmology",
  "ENT (Otolaryngology)": "ENT",
  "Dental & Maxillofacial Surgery": "Dental Services",
  "Obstetrics & Antenatal Care": "Pregnancy & Maternal Care",
  Gynecology: "Gynecology",
  Pediatrics: "Pediatrics",
  "Neonatal Intensive Care (NICU)": "NICU",
  "Clinical Laboratory": "Laboratory Services",
  Radiology: "Radiology",
  "Ultrasound Services": "Ultrasound Scan",
  Pharmacy: "Pharmacy",
  Physiotherapy: "Physiotherapy",
  "Accident & Emergency (A&E)": "Emergency Services",
  ICU: "ICU",
  "Ambulance & Patient Transport": "Ambulance Services",
};

export function Services() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section
      id="services"
      className="relative w-full py-24 sm:py-32 lg:py-40"
      aria-labelledby="services-heading"
      style={{ backgroundColor: "var(--marketing-ivory)", color: "var(--marketing-ink)" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionReveal}
          className="mb-20 sm:mb-28"
        >
          <motion.h2
            variants={headingReveal}
            id="services-heading"
            className={`text-4xl sm:text-5xl lg:text-6xl ${displayHeadingClassName}`}
            style={{ ...displayHeadingStyle, color: "var(--marketing-ink)" }}
          >
            Clinical Departments <br className="hidden sm:block" />
            <span className="font-semibold">and Specialty Centers</span>
          </motion.h2>
        </motion.div>

        {SERVICE_CATEGORIES.map((category, catIdx) => (
          <motion.div
            key={category.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: "-70px" }}
            variants={sectionReveal}
            className="mb-20 sm:mb-24"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15, margin: "-70px" }}
              variants={servicesStagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {category.services.map((srv, idx) => {
                const Icon = ICONS[srv.icon];
                const isHovered = hoveredIdx === idx;

                return (
                  <Link
                    href={srv.href}
                    key={srv.id}
                    passHref
                    legacyBehavior
                  >
                    <motion.article
                      whileHover="hover"
                      whileFocus="hover"
                      whileTap={{ scale: 0.99 }}
                      variants={serviceRowReveal}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onFocus={() => setHoveredIdx(idx)}
                      onBlur={() => setHoveredIdx(null)}
                      className="group relative flex flex-col h-full p-6 rounded-2xl transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
                      style={{
                        backgroundColor: "var(--card)",
                        border: `1px solid ${BORDER}`,
                        boxShadow: isHovered ? "0 12px 32px rgba(3,22,26,0.08)" : "none",
                        borderColor: isHovered ? "var(--primary)" : BORDER,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          initial="rest"
                          animate={isHovered ? "active" : "rest"}
                          variants={{
                            rest: { scale: 1 },
                            active: { scale: 1.05, transition: { duration: 0.28 } },
                          }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-[background-color,border-color] duration-300"
                          style={{
                            backgroundColor: isHovered ? "var(--primary)" : "transparent",
                            border: isHovered ? "1px solid transparent" : `1px solid ${BORDER}`,
                          }}
                        >
                          <Icon
                            aria-hidden
                            strokeWidth={1.7}
                            className="h-6 w-6 transition-colors duration-300"
                            style={{
                              color: isHovered ? "var(--primary-foreground)" : "var(--marketing-ink)",
                            }}
                          />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold leading-tight truncate" style={{ color: "var(--marketing-ink)" }}>
                            {srv.title}
                          </h3>
                        </div>
                      </div>
                      <p className="mt-4 text-base leading-relaxed flex-1" style={{ color: "rgba(3,22,26,0.65)" }}>
                        {srv.desc}
                      </p>
                      <motion.div
                        initial="rest"
                        animate={isHovered ? "active" : "rest"}
                        variants={{ rest: { x: 0, opacity: 0 }, active: { x: 4, opacity: 1, transition: { duration: 0.28 } } }}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                      </motion.div>
                    </motion.article>
                  </Link>
                );
              })}
            </motion.div>

            {catIdx < SERVICE_CATEGORIES.length - 1 && (
              <hr className="my-16 border-t" style={{ borderColor: BORDER }} />
            )}
          </motion.div>
        ))}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={contentReveal}
          className="mt-16 flex justify-center lg:justify-start"
        >
          <Link href="/book-appointment" passHref legacyBehavior>
            <motion.a
              variants={ctaLift}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-[18px] text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                boxShadow: "0 10px 30px rgba(196,106,63,0.15)",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:translate-x-[300%] group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                }}
              />
              <span className="relative z-10 tracking-wide">Book an Appointment</span>
              <ArrowRight className="relative z-10 w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}