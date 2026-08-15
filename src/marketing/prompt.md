# ACCURATE MEDICAL CENTER
# FINAL PREMIUM MARKETING WEBSITE TRANSFORMATION
# IMPLEMENTATION PROMPT

You are working inside the existing Accurate Medical Center Next.js HMS repository.

Your task is to transform ONLY the public-facing marketing website into a premium, official, cinematic hospital website that is capable of converting visitors into patients.

IMPORTANT:
Do NOT break, redesign, refactor, or interfere with the HMS dashboard, authentication, Prisma, PostgreSQL, API routes, protected pages, or existing backend functionality.

The marketing website is isolated primarily inside:

src/marketing/

You may modify the public marketing entry point, global marketing design tokens, metadata, and marketing-related configuration where necessary.

The final result must feel like a professionally commissioned website for a serious private medical institution.

DESIGN DIRECTION:

PREMIUM
OFFICIAL
CINEMATIC
TRUSTWORTHY
MODERN
CALM
HUMAN
MEDICAL
CONVERSION-FOCUSED

Do NOT make the website look like:
- a SaaS landing page
- a dashboard
- a generic Tailwind template
- a collection of cards
- an AI-generated template
- an overly animated portfolio

Use strong professional UI/UX judgment throughout.

==================================================
1. FINAL WEBSITE STRUCTURE
==================================================

The final public website must contain ONLY:

Header
↓
Hero
↓
About
↓
Vision & Mission
↓
Experience
↓
Contact
↓
Footer

REMOVE COMPLETELY:

- EmergencyStrip
- WhyChooseUs
- old AboutSnapshot
- old standalone Services section
- old Hero trust line
- old Header Call Now
- old Header WhatsApp CTA
- duplicate appointment buttons
- decorative red lines
- unnecessary marketing sections
- unused marketing components
- dead imports
- unused CSS

Do not replace removed sections with additional generic sections.

The website should feel intentional and editorial rather than long simply for the sake of being long.

==================================================
2. HERO
==================================================

Use this video:

C:\Users\USER\Accurate Medical Center\public\marketing\videos\clip-3.mp4

Browser path:

/marketing/videos/clip-3.mp4

Verify that the file exists before implementation.

The Hero must be full viewport and cinematic.

HERO HEADLINE:

Healing Minds, Restoring Lives.

Do NOT display:

"Accurate Medical Center"

as an eyebrow above the Hero.

Do NOT display:

"Multi-Branch · 24/7 Emergency · Online Consultations"

or any replacement trust-line.

The Hero should contain:

Healing Minds, Restoring Lives.

Accurate Medical Center provides accessible, affordable, and quality healthcare through modern medical services and compassionate professionals in Akure and across Ondo State.

PRIMARY CTA:
Book an Appointment

SECONDARY CTA:
Explore Our Services

The Hero must use the actual video as the dominant visual.

Do not bury the video under an opaque black overlay.

Use sophisticated layered gradients only where necessary for text readability.

Use:
- subtle vignette
- controlled contrast
- cinematic lighting
- elegant typography
- glass treatment where appropriate
- premium spacing

Do NOT use:
- particles
- flashy effects
- excessive zoom
- bouncing
- rotating elements
- giant opaque overlays

--------------------------------------------------
HERO POSTER
--------------------------------------------------

Generate/extract a high-quality poster frame from the actual Hero video.

Do NOT automatically use the first frame.

Choose a frame that is:
- sharp
- professional
- medically appropriate
- visually interesting
- well composed
- suitable behind typography
- free from awkward transitions

Save it in the marketing image directory.

Use the poster as the video's fallback/poster.

--------------------------------------------------
HERO ANIMATION
--------------------------------------------------

Use Framer Motion.

Sequence:

1. Background/video naturally appears
2. Headline reveals
3. Supporting paragraph reveals
4. Primary CTA reveals
5. Secondary CTA reveals

Use sophisticated easing.

Keep the animation fast enough to feel responsive.

No unnecessary delays.

==================================================
3. HEADER
==================================================

Rebuild the Header from scratch if necessary.

It must look like the official website of a reputable private hospital.

DESKTOP:

Logo
About
Services
Experience
Contact
Book an Appointment

Only ONE major CTA:

Book an Appointment

REMOVE:
- Call Now
- WhatsApp
- old phone CTA
- duplicate appointment buttons

At the top of the Hero:

Transparent / minimal header.

When scrolling:

Transform into a refined glassmorphic navigation bar.

Use:
- backdrop blur
- translucent background
- subtle border
- subtle shadow
- smooth Framer Motion transition

Navigation hover:
- subtle Lemon accent
- elegant animated underline
- no exaggerated effects

--------------------------------------------------
MOBILE HEADER
--------------------------------------------------

Mobile header:

[Logo] [Menu]

Use a RIGHT-SIDE full-height drawer.

Animate:
- backdrop
- drawer
- navigation items
- CTA

Use Framer Motion.

Lock body scrolling while the drawer is open.

Mobile navigation:

About
Services
Experience
Contact
Book an Appointment

Do NOT simply shrink the desktop header.

Design the mobile navigation intentionally.

==================================================
4. ABOUT SECTION
==================================================

Replace the entire existing About + Services content with ONLY this content:

## About Accurate Medical Center

### Modern Medicine. Compassionate Care.

Accurate Medical Center is a modern, multi-service hospital in Akure, Ondo State, providing accessible, affordable, and quality healthcare for individuals and families.

From **outpatient care and diagnostics to maternity, surgery, specialist consultations, and psychological therapy**, our experienced professionals combine modern medicine with compassionate, patient-first care.

### Why Accurate?

01
24/7 Emergency Care

Round-the-clock emergency response with dedicated staff and critical care readiness at all hours.

02
Comprehensive Medical Services

From outpatient consultations to advanced diagnostics, surgery, and specialist care under one roof.

03
Experienced Healthcare Professionals

A team of seasoned doctors, surgeons, nurses, and therapists delivering evidence-based care.

04
Online Consultations

Convenient virtual consultations that bring quality healthcare directly to you, wherever you are.

05
Multiple Locations Across Ondo State

Expanding access to quality care with strategic presence and partnerships across the state.

--------------------------------------------------
IMPORTANT METRIC DESIGN
--------------------------------------------------

Do NOT leave these as ordinary bullet points or five boring cards.

The five "Why Accurate?" points should be presented as elegant trust indicators.

However, the bottom credibility metrics must be:

11+
Medical Services

24/7
Emergency Care

100%
Patient-First Care

The numbers MUST animate/count upward when the section enters the viewport.

Examples:

0 → 11+

0 → 24/7

0 → 100%

Use Framer Motion.

Duration:
approximately 1.2 to 1.8 seconds.

Use smooth easing.

Do NOT bounce the numbers.

Do NOT repeatedly restart the animation every time the user scrolls.

Use viewport detection with:

once: true

The numbers should be visually dominant.

Labels should be refined and secondary.

On desktop, use elegant separators.

On mobile, stack them beautifully without cramped cards.

==================================================
5. ABOUT SECTION DESIGN
==================================================

Do NOT make About a plain text block.

Use a premium editorial composition.

Suggested structure:

LEFT:
Large editorial heading and body copy.

RIGHT:
Elegant Why Accurate trust indicators.

BOTTOM:
Large animated credibility metrics.

Use:
- generous whitespace
- refined typography
- subtle borders
- controlled glass treatment
- Lemon accents
- sophisticated micro-interactions

The About section should feel like one cohesive composition.

Do not make it look like About and Services were merged together.

==================================================
6. COLOR SYSTEM
==================================================

Redesign the entire color distribution.

Lemon remains the primary brand accent.

But Lemon must NOT dominate every section.

Use:

LEMON
BLACK
WHITE
WARM OFF-WHITE
SOFT GREYS
DEEP CINEMATIC DARKS

Each major section must have a visibly different visual treatment from the section immediately before it.

DO NOT use the same background on consecutive major sections.

Recommended rhythm:

HERO
Deep cinematic black / video

ABOUT
Warm premium ivory / off-white

VISION & MISSION
Pure black / deep charcoal

EXPERIENCE
Deep cinematic neutral / dark charcoal

CONTACT
Premium white / light neutral

FOOTER
Pure black

Transitions must feel sophisticated.

Do NOT create harsh:

yellow → white → black → yellow

changes.

Use subtle spacing, borders, lighting and typography to make the color changes feel intentional.

==================================================
7. LEMON USAGE
==================================================

Use the existing:

--marketing-lemon

for:

- primary CTA
- active navigation
- hover states
- metric highlights
- slideshow progress
- selected states
- subtle borders
- icons
- decorative accents

Do NOT cover entire sections in bright Lemon without a strong design reason.

Lemon should feel like the recognizable signature accent of the hospital.

==================================================
8. VISION & MISSION
==================================================

Keep the existing Vision & Mission concept.

Retain the premium black-panel design.

Improve:

- typography
- spacing
- composition
- gradient lighting
- ornamental SVG elements
- panel edges
- responsive layout
- Framer Motion reveals

The section should feel:

institutional
premium
serious
trustworthy

Use subtle entrance animations.

No excessive effects.

==================================================
9. EXPERIENCE
==================================================

THIS IS ONE OF THE MOST IMPORTANT SECTIONS.

Create a PREMIUM HORIZONTAL CINEMATIC SLIDESHOW.

Heading:

## Experience

# A Look Inside Accurate Medical Center

The videos are HORIZONTAL.

This is mandatory.

DO NOT:
- turn them into portrait cards
- crop aggressively
- create a 3-card grid
- stack three video cards like a generic template

The video must dominate the Experience section.

Think:

PREMIUM HOSPITAL DOCUMENTARY
+
CINEMATIC EDITORIAL WEBSITE

--------------------------------------------------
EXPERIENCE VIDEOS
--------------------------------------------------

Use EXACTLY these three:

01

Path:

/images/0814(2).mp4

Title:

Our Facility

Description:

State-of-the-art infrastructure built for patient comfort and safety.

02

Path:

/images/A001_05131710_C303.mp4

Title:

Patient Care

Description:

Compassionate, hands-on care at every stage of treatment.

03

Path:

/images/A001_05131713_C313.mp4

Title:

Medical Services

Description:

A full spectrum of diagnostic and therapeutic services.

Verify the actual files exist before implementation.

--------------------------------------------------
SLIDESHOW COMPOSITION
--------------------------------------------------

Desktop:

EXPERIENCE

A Look Inside Accurate Medical Center

[LARGE HORIZONTAL VIDEO]

01 / 03

OUR FACILITY

Description

[Previous] [Next]

Progress indicator

The horizontal video should occupy most of the visual area.

Use cinematic aspect ratio.

Respect the natural aspect ratio of the source video.

Do not unnecessarily crop the footage.

--------------------------------------------------
SLIDESHOW BEHAVIOR
--------------------------------------------------

Automatic slideshow.

Use a comfortable interval.

Manual navigation:

Previous
Next

When manually navigating:

- change immediately
- reset autoplay timer
- prevent overlapping transitions
- maintain current state correctly

Include:

- slide counter
- progress bar
- Previous button
- Next button

Controls should use refined glassmorphism.

--------------------------------------------------
EXPERIENCE ANIMATION
--------------------------------------------------

Use Framer Motion.

Transitions should include:

- cinematic crossfade
- subtle scale
- controlled directional movement
- text fade/slide
- progress animation

Do not combine excessive effects.

The animation should feel like a premium film presentation.

--------------------------------------------------
VIDEO PERFORMANCE
--------------------------------------------------

Maintain:

IntersectionObserver

preload="none"

Only the active video should play.

Inactive videos should pause.

Avoid unnecessary bandwidth usage.

Do not load every video aggressively at initial page load.

--------------------------------------------------
MOBILE EXPERIENCE
--------------------------------------------------

The videos MUST remain horizontal on mobile.

Do NOT turn them into portrait cards.

Structure:

VIDEO

↓

01 / 03

↓

TITLE

↓

DESCRIPTION

↓

CONTROLS

↓

PROGRESS

Make it excellent at:

375px
390px
414px

Controls must be comfortably touchable.

==================================================
10. EXPERIENCE ASSET CLEANUP
==================================================

IMPORTANT:

Audit all existing MP4 files before deleting anything.

There are currently videos in multiple locations such as:

public/images/
public/marketing/videos/

Some files may be duplicates of the same underlying video.

DO NOT blindly duplicate or preserve multiple copies of the same video.

First search the entire project for every MP4 reference.

Determine which videos are actually used by:
- Hero
- Experience
- any remaining legitimate public page functionality

The final marketing implementation should use only the required production assets.

Do NOT delete an MP4 until confirming that:
1. it is unused
2. it is not required by the HMS
3. it is not referenced anywhere else

After verification, consolidate the final marketing videos into a clean structure where practical.

Do not leave unnecessary duplicate marketing video assets in the repository.

If two filenames contain the same underlying video, keep one canonical production copy and update references to it.

After cleanup:
- run lint
- run build
- inspect the rendered website
- verify every video loads correctly
- verify Hero
- verify all three Experience slides

==================================================
11. REMOVE WHY CHOOSE US
==================================================

Delete completely:

Our Commitment

Why Choose Accurate Medical Center?

Modern Diagnostics
Compassionate Care
Multi-Branch Access
Online Consultations

Do NOT create another standalone replacement section.

The credibility information belongs inside About.

==================================================
12. SERVICES NAVIGATION
==================================================

Header may contain:

Services

But do NOT recreate the old 11-card Services section.

If a legitimate service destination exists, link to it.

If not, connect Services to the most appropriate conversion/service-related area without creating an awkward empty section.

==================================================
13. CONTACT
==================================================

Keep Contact.

Make it highly conversion-focused.

Include:

- hospital location
- phone
- contact form
- map
- appointment CTA

PHONE:

07039092836

INTERNATIONAL:

+2347039092836

TEL:

tel:+2347039092836

Remove every occurrence of the old number:

0813 358 3097
08133583097
+2348133583097

Search the entire marketing implementation and configuration.

There must be NO old phone number remaining.

The Contact section should use:

CONTACT INFORMATION
+
GLASSMORPHIC FORM
+
MAP

Make contacting the hospital extremely obvious.

==================================================
14. HEADER CTA
==================================================

The Header must contain only:

Book an Appointment

Do NOT add:

Call Now
WhatsApp
secondary phone CTA
duplicate appointment CTA

The Contact section can contain the phone CTA.

==================================================
15. REMOVE ALL EM DASHES
==================================================

Search the marketing codebase and relevant layout/configuration for:

—

Remove every occurrence.

Rewrite sentences naturally.

Do NOT replace every em dash with a hyphen mechanically.

==================================================
16. RED ELEMENT CLEANUP
==================================================

Remove all decorative red lines.

Do NOT use red as a decorative brand color.

Red may only appear where semantically appropriate for medical emergency meaning.

Do not introduce random red accents.

==================================================
17. FRAMER MOTION
==================================================

Use Framer Motion throughout the marketing website.

Improve the current animation system.

Centralize reusable animation variants in:

src/marketing/animations.ts

Animate:

- Hero
- Header
- mobile drawer
- About
- trust indicators
- metric counters
- Vision/Mission
- Experience
- Contact
- Footer
- CTA interactions

Use:

once: true

for standard section reveals.

Animation language:

CALM
CONFIDENT
PRECISE
PREMIUM

Avoid:

- bouncing
- spinning
- excessive scaling
- particles
- cursor gimmicks
- constant floating
- aggressive blur
- excessive parallax

==================================================
18. GLASSMORPHISM
==================================================

Use glassmorphism selectively.

Good locations:

- Header
- Hero secondary CTA
- About trust indicators
- Experience controls
- Contact form

Use:

backdrop-filter
translucency
fine borders
soft shadows

Do NOT make every element glass.

==================================================
19. TYPOGRAPHY
==================================================

Use:

Inter
Plus Jakarta Sans

for UI/body.

Use:

Playfair Display

for premium editorial headings where appropriate.

Hero:

Healing Minds, Restoring Lives.

must be visually dominant.

Maintain excellent hierarchy throughout the page.

==================================================
20. RESPONSIVE DESIGN
==================================================

The website must be intentionally designed for:

375px
390px
414px
768px
834px
1024px
1280px
1440px
1920px

Check:

- Hero
- video
- typography
- header
- mobile drawer
- buttons
- About
- metrics
- Vision/Mission
- Experience
- slideshow
- Contact
- map
- Footer

There must be:

NO horizontal page overflow.

Do NOT simply shrink desktop layouts.

Recompose layouts for mobile where necessary.

==================================================
21. ACCESSIBILITY
==================================================

Maintain:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible buttons
- proper form labels
- ARIA labels for slideshow controls
- reduced-motion support

==================================================
22. PERFORMANCE
==================================================

Keep Server Components wherever possible.

Only use "use client" where interaction requires it.

Do NOT convert the entire marketing website into a Client Component.

Optimize:

- videos
- poster
- animations
- client JavaScript
- image loading

Do not load all Experience videos simultaneously.

==================================================
23. SEO
==================================================

Do NOT break:

- metadata
- OpenGraph
- Twitter cards
- robots.txt
- sitemap.xml

Maintain relevant SEO naturally:

Accurate Medical Center
Akure
Ondo State
hospital
healthcare
medical services
diagnostics
maternity
surgery
specialist care

==================================================
24. FINAL VISUAL QUALITY
==================================================

Do not merely satisfy the requirements technically.

After implementation, inspect the actual rendered website.

Ask:

Does this look like a real private hospital website?

Does it look expensive?

Does it inspire trust?

Does it make a visitor want to book an appointment?

Does the Hero immediately communicate the hospital's identity?

Does the About section communicate credibility quickly?

Does the Experience section feel cinematic?

Does the Contact section make conversion easy?

Does the mobile experience feel intentionally designed?

If something technically meets the requirement but looks visually weak, redesign it.

Use professional UI/UX judgment.

==================================================
25. FINAL VERIFICATION
==================================================

Run:

npm run lint

Then:

npm run build

Fix ALL errors.

Then inspect the actual website.

Verify:

HERO:
- clip-3.mp4 loads
- poster is high quality
- headline is correct
- no "Accurate Medical Center" eyebrow
- no Hero trust line
- CTA works
- video remains visible

HEADER:
- official hospital appearance
- one primary CTA
- no Call Now
- no WhatsApp
- mobile drawer works

ABOUT:
- old About/Services content is gone
- new About content is present
- Why Accurate is presented elegantly
- metric counters animate
- 11+, 24/7 and 100% appear correctly

COLORS:
- sections are visually distinct
- Lemon remains the primary accent
- no random colors
- no decorative red lines

VISION:
- premium black-panel treatment
- animations work

EXPERIENCE:
- exactly three videos
- all videos remain horizontal
- slideshow works
- autoplay works
- manual navigation works
- progress works
- inactive videos pause
- mobile remains horizontal

CONTACT:
- 07039092836 is correct
- +2347039092836 is correct
- old number is completely gone
- form works
- map works

GLOBAL:
- no EmergencyStrip
- no WhyChooseUs
- no old Services grid
- no old Hero trust line
- no old phone number
- no em dash
- no decorative red lines
- no duplicate marketing videos
- no horizontal overflow
- no broken HMS functionality

==================================================
26. MOST IMPORTANT INSTRUCTION
==================================================

Do not stop at "the code compiles."

Build the website until the rendered result genuinely looks like a premium, official, modern private hospital website.

Prioritize:

1. Visual hierarchy
2. Trust
3. Conversion
4. Cinematic presentation
5. Responsive quality
6. Performance
7. Accessibility
8. Clean architecture

The final result should be something that can be presented directly to Accurate Medical Center management without looking like a student project or generic AI-generated template.