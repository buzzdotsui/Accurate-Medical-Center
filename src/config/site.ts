/**
 * Hospital site configuration — single source of truth for all
 * hospital metadata, contact details, and public-facing information.
 */

export const siteConfig = {
  name: 'Accurate Medical Center',
  shortName: 'AMC',
  tagline: 'Healing Minds, Restoring Lives',
  description:
    'Accurate Medical Center in Akure, Ondo State provides patient-first infertility, addiction, mental health, maternal, diagnostic, and general medical care.',
  // Public metadata must never inherit a local development or deployment-preview URL.
  // NEXT_PUBLIC_APP_URL remains available to runtime application code where needed.
  url: 'https://accuratemedicalcenter.com',
  ogImage: '/images/hero-poster.jpg',

  contact: {
    address: {
      street: '109 Irowo Street',
      landmark: 'Opposite Mega School',
      area: 'Hospital Road',
      city: 'Akure',
      state: 'Ondo State',
      country: 'Nigeria',
      full: '109 Irowo Street, Opposite Mega School, Hospital Road, Akure, Ondo State, Nigeria',
    },
    phone: {
      primary: '+2347039092836',
      emergency: '+2347039092836',
      whatsapp: '2347039092836',
      displayPrimary: '0703 909 2836',
    },
    email: {
      general: 'immediateaccuratediagnostics@yahoo.com',
      appointments: 'immediateaccuratediagnostics@yahoo.com',
      emergency: 'immediateaccuratediagnostics@yahoo.com',
    },
    hours: {
      weekdays: '8:00 AM to 8:00 PM',
      saturday: '8:00 AM to 6:00 PM',
      sunday: '10:00 AM to 4:00 PM',
      emergency: '24/7 Emergency Services',
    },
  },

  social: {
    facebook: 'https://facebook.com/accuratemedicalcenter',
    instagram: 'https://instagram.com/accuratemedicalcenter',
    twitter: 'https://twitter.com/accuratemc',
    youtube: '',
  },

  mission:
    'To deliver accessible, affordable, and compassionate healthcare while promoting physical, mental, and reproductive health through modern diagnostic technology and online consultations.',

  vision:
    'To become the most trusted and patient-focused hospital in Akure and Ondo State, delivering excellence in healthcare services, both in-person and online.',

  services: [
    {
      id: 'outpatient',
      name: 'Outpatient Clinic',
      slug: 'outpatient-clinic',
      icon: 'stethoscope',
      description: 'Comprehensive outpatient consultation and treatment services.',
    },
    {
      id: 'maternal',
      name: 'Pregnancy & Maternal Care',
      slug: 'maternal-care',
      icon: 'baby',
      description: 'Expert prenatal, antenatal, and postnatal care for mothers and babies.',
    },
    {
      id: 'infertility',
      name: 'Infertility Care',
      slug: 'infertility-care',
      icon: 'heart-handshake',
      description: 'Compassionate fertility assessment and treatment programs.',
    },
    {
      id: 'surgery',
      name: 'Surgical Services',
      slug: 'surgical-services',
      icon: 'scissors',
      description: 'State-of-the-art surgical facilities with experienced surgeons.',
    },
    {
      id: 'addiction',
      name: 'Addiction Care',
      slug: 'addiction-care',
      icon: 'shield-plus',
      description: 'Evidence-based addiction recovery and rehabilitation programs.',
    },
    {
      id: 'psychology',
      name: 'Psychological Therapy',
      slug: 'psychological-therapy',
      icon: 'brain',
      description: 'Professional mental health counseling and therapeutic services.',
    },
    {
      id: 'ultrasound',
      name: 'Ultrasound Scan',
      slug: 'ultrasound-scan',
      icon: 'scan',
      description: 'Advanced diagnostic ultrasound imaging services.',
    },
    {
      id: 'laboratory',
      name: 'Laboratory Services',
      slug: 'laboratory-services',
      icon: 'flask-conical',
      description: 'Full-spectrum clinical laboratory testing and analysis.',
    },
    {
      id: 'xray',
      name: 'X-Ray Services',
      slug: 'xray-services',
      icon: 'activity',
      description: 'Digital X-ray imaging for accurate diagnostic support.',
    },
    {
      id: 'ambulance',
      name: 'Ambulance Services',
      slug: 'ambulance-services',
      icon: 'ambulance',
      description: '24/7 emergency ambulance response and medical transport.',
    },
    {
      id: 'online',
      name: 'Online Consultation',
      slug: 'online-consultation',
      icon: 'video',
      description: 'Convenient telemedicine consultations from anywhere in Nigeria.',
    },
  ],
} as const;

export type ServiceId = (typeof siteConfig.services)[number]['id'];
