# Accurate Medical Center — Premium UI/UX Transformation Plan

This plan outlines the final premium UI/UX refinement for the marketing landing page. The goal is to elevate the site to feel official, cinematic, and professional while strictly maintaining isolation from the main HMS codebase.

## Open Questions
- For the mobile header drawer, would you prefer it to slide in from the left, from the right, or fade in as a full-screen overlay? (A slide-in from the right is usually standard and elegant, so I will default to that unless you specify otherwise).

## Proposed Changes

### `src/marketing` (Component Deletions & Composition)
- **[DELETE]** `EmergencyStrip.tsx` — Completely removed as requested.
- **[DELETE]** `WhyChooseUs.tsx` — Completely removed as requested.
- **[MODIFY]** `MarketingHome.tsx` — Update composition to `Header -> Hero -> AboutServices -> VisionMission -> LookInside -> Contact -> Footer`. Remove references to deleted components.

---

### `src/marketing/Hero.tsx`
- **Video & Poster**: Update background video to `/images/0814(1).mp4`. During implementation, I will use a script to extract a high-quality poster frame from this video to act as the fallback/poster image.
- **Copy**: 
  - Eyebrow: "ACCURATE MEDICAL CENTER"
  - Headline: "Where modern medicine meets compassionate care."
  - Remove the old "Multi-Branch · 24/7 Emergency..." trust line completely.
- **CTAs**: Replace existing CTAs with "Book an Appointment" (Primary) and "Explore Our Services" (Secondary) with premium hover motion and glass treatments.
- **Design**: Refine layered gradients to ensure the video remains visible while keeping text legible.

---

### `src/marketing/Header.tsx`
- **Navigation**: Update links to: "About", "Services", "Experience", "Contact".
- **CTAs**: Remove the phone/WhatsApp links. Keep only one strong primary CTA ("Book Appointment").
- **Scroll Behavior**: Implement a seamless transparent-to-glass transition on scroll.
- **Mobile Drawer**: Completely redesign the mobile menu into a beautiful, full-height slide-in drawer using Framer Motion (animating the backdrop, drawer, and navigation items).

---

### `src/marketing/LookInside.tsx` (Experience Section)
- **Cinematic Slideshow**: Completely overhaul the current 2x2 grid into a premium, automatic slideshow.
- **Videos**: Use the 3 specified videos (`0814(2).mp4`, `A001_05131710_C303.mp4`, `A001_05131713_C313.mp4`).
- **Controls**: Add elegant manual navigation (previous/next), a slide counter (`01 / 03`), and a progress indicator.
- **Performance**: Retain `IntersectionObserver` and `preload="none"`. Ensure only the active video plays while the others pause.
- **Mobile**: Redesign specifically for mobile (Video -> Slide Number -> Title -> Description -> Nav).

---

### `src/marketing/AboutServices.tsx`
- **Design Refinement**: We already combined About and Services into this file, but I will refine the editorial layout to make the visual transition even smoother.
- **Trust Elements**: Redesign the 4 trust elements (Multi-Branch, 24/7 Emergency, Online Consultations, Akure) from a generic grid into a more sophisticated layout (e.g., a vertical information rail or floating glass panel).

---

### `src/marketing/Contact.tsx` & `src/marketing/Footer.tsx`
- **Conversion Strategy**: Ensure the contact section has a highly prominent phone CTA since it was removed from the header.
- **Phone Number Update**: Update the phone number to `07039092836` (and `tel:+2347039092836`).

---

### `src/config/site.ts`
- **[MODIFY]** `site.ts` — Update all `phone` properties to the new `07039092836` number.

---

### Global Content Cleanup
- Search and replace all em-dashes (`—`) across the marketing components with natural sentence structure or standard hyphens where appropriate.
- Ensure all animations conform to the "restrained, sophisticated" mandate using the centralized `animations.ts` file.

## Verification Plan

### Automated Verification
- Run `npm run lint` and `npm run build` to ensure the codebase compiles cleanly with no Next.js/TypeScript errors.

### Manual Verification
- Visual inspection of the Hero video and extracted poster frame.
- Verification of the new cinematic Experience slideshow logic (auto-play, manual nav, pausing inactive videos).
- Responsive testing (375px through 1440px) to ensure no horizontal scrolling or broken layouts.
- Verification that `07039092836` is the only phone number used and that no em-dashes exist in the marketing copy.
