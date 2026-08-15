# ACCURATE MEDICAL CENTER
# FINAL PREMIUM CLEAN UI/UX + VIDEO FIX
# TRAE IMPLEMENTATION INSTRUCTION

You are working directly inside the existing Accurate Medical Center Next.js HMS repository.

THIS IS AN IMPLEMENTATION TASK.

Do not give me another generic design plan.
Do not explain what you "could" do.
Inspect the existing codebase and IMPLEMENT the changes.

The final website must look like a real, premium, official hospital website.

It must be:
- clean
- elegant
- trustworthy
- modern
- highly responsive
- conversion-focused
- visually consistent
- fast
- accessible
- professionally animated

It must NOT look like:
- an AI-generated template
- a SaaS landing page
- a student project
- a dashboard
- a collection of random glass cards
- an over-animated website

============================================================
1. MOST IMPORTANT: EXPERIENCE VIDEOS ARE NOT LOADING
============================================================

THE CURRENT EXPERIENCE / SLIDESHOW VIDEOS ARE NOT LOADING.

Fix this FIRST.

Do not simply change CSS.

Diagnose the actual problem.

Inspect:

public/marketing/videos/

and determine the EXACT filenames and extensions of all Experience videos.

The videos I previously referenced are:

1. THE FACILITY
facility slideshow

2. THE RECEPTION
reception slide show

3. CONSULTATION
consultation slideshiw

4. HOSPITAL VIEW
hospital view slide show

5. COMING IN
inside (coming in) hospital view

IMPORTANT:

Those names were provided as descriptions/paths, and may not exactly match the physical files.

DO NOT INVENT filenames.

Run/inspect the actual directory and find the matching files.

Check:

- exact filename
- extension
- whether file exists
- file size
- video dimensions
- aspect ratio
- whether browser playback is possible

If necessary, inspect the repository using PowerShell/file-system commands.

============================================================
2. ACTUAL EXPERIENCE MEDIA FORMAT
============================================================

IMPORTANT CORRECTION:

THE EXPERIENCE SLIDESHOW VIDEOS ARE PORTRAIT.

They are NOT horizontal.

Rebuild the Experience slideshow around PORTRAIT VIDEO.

Do NOT force them into a horizontal 16:9 container.

Do NOT crop the portrait videos aggressively.

Do NOT stretch them.

Do NOT distort the aspect ratio.

The video itself should remain naturally portrait.

The slideshow should be designed around the portrait footage.

Think:

premium editorial hospital showcase

rather than:

large horizontal video carousel.

============================================================
3. EXPERIENCE SECTION DESIGN
============================================================

Keep:

## Experience

### A Look Inside Accurate Medical Center

But completely redesign the visual composition.

Desktop should have an elegant split composition:

LEFT:

Large editorial heading:

Experience

A Look Inside Accurate Medical Center

A short, refined description.

Then navigation information:

01 / 05

THE FACILITY

description

Previous     Next

RIGHT:

Large portrait video.

The portrait video should be the visual focus.

Example:

┌──────────────────────┐
│                      │
│                      │
│      PORTRAIT        │
│       VIDEO          │
│                      │
│                      │
└──────────────────────┘

Do NOT place the video inside a generic card.

The video should feel like an editorial media piece.

============================================================
4. EXPERIENCE SLIDES
============================================================

There are FIVE slides.

SLIDE 01
THE FACILITY

SLIDE 02
THE RECEPTION

SLIDE 03
CONSULTATION

SLIDE 04
HOSPITAL VIEW

SLIDE 05
COMING IN

Use the actual corresponding files discovered in:

public/marketing/videos/

Do not hardcode nonexistent paths.

============================================================
5. EXPERIENCE VIDEO LOADING FIX
============================================================

Make sure every video has a valid browser-accessible public URL.

Remember:

Files inside:

public/marketing/videos/

are referenced in the browser as:

/marketing/videos/FILENAME

NOT:

C:\Users\USER\...

Do not use Windows filesystem paths inside React/Next.js video src attributes.

For example:

WRONG:

C:\Users\USER\Accurate Medical Center\public\marketing\videos\something.mp4

CORRECT:

/marketing/videos/something.mp4

Use encodeURI or equivalent handling where filenames contain spaces or special characters.

============================================================
6. VIDEO DEBUGGING
============================================================

If a video still does not load, DO NOT hide the problem.

Add proper video error handling during development.

For every active video:

onError:
log the actual source and media error.

Check the browser network request.

Confirm that the request returns the video rather than:

404
403
500

If necessary, normalize filenames to cleaner names.

For example:

facility-slideshow.mp4
reception-slideshow.mp4
consultation-slideshow.mp4
hospital-view-slideshow.mp4
coming-in-hospital-view.mp4

If renaming is necessary, update all references correctly.

Do NOT leave duplicate broken references.

============================================================
7. VIDEO ATTRIBUTES
============================================================

Experience videos should use:

muted
playsInline
preload="metadata"

Do NOT use preload="none" if that is preventing the slideshow from displaying/loading properly.

Performance still matters, but FUNCTIONALITY comes first.

Only the active slide should play.

When a slide becomes inactive:

pause it
reset it if appropriate

When it becomes active:

load/play it safely.

Handle autoplay restrictions properly.

If autoplay fails, the video should still display a poster/first frame and have a clear play control.

============================================================
8. EXPERIENCE POSTER FALLBACK
============================================================

Every Experience video should have a reliable visual fallback.

If possible, generate/extract poster frames from the actual videos.

Do not use unrelated images.

The poster must represent the corresponding video.

This prevents the section from looking broken while the video is loading.

============================================================
9. EXPERIENCE SLIDE TRANSITIONS
============================================================

Use Framer Motion.

When changing slides:

OUTGOING:
fade out + subtle scale

INCOMING:
fade in + subtle scale

Do NOT make the portrait video spin.

Do NOT use exaggerated 3D rotations.

Do NOT use bounce animations.

Text should transition independently.

Example:

Video:
opacity 0 → 1
scale 0.97 → 1

Title:
opacity 0 → 1
x 12 → 0

Description:
opacity 0 → 1
y 8 → 0

Keep transitions around 400–700ms.

============================================================
10. EXPERIENCE CONTROLS
============================================================

Include:

01 / 05

THE FACILITY

Previous
Next

and a thin Lemon progress indicator.

Controls must look premium and minimal.

No huge circular arrows.

No emoji.

No unnecessary icons.

Use Lucide icons if needed.

On mobile, controls must be touch friendly.

============================================================
11. MOBILE EXPERIENCE
============================================================

The portrait format is actually ideal for mobile.

Mobile layout:

Experience

A Look Inside Accurate Medical Center

PORTRAIT VIDEO

01 / 05

THE FACILITY

Description

Previous              Next

Progress

Do not make the video tiny.

Use approximately:

width: min(100%, 420px)

and preserve aspect ratio.

Center it elegantly.

The mobile version should feel intentional rather than being a collapsed desktop layout.

============================================================
12. HERO SECTION
============================================================

Continue using the new Hero video requested previously.

Inspect:

public/marketing/videos/

and locate the actual "new hero" video.

Do not guess its extension.

Use:

Healing Minds, Restoring Lives.

as the Hero headline.

Remove any old eyebrow text saying:

Accurate Medical Center

Remove:

Multi-Branch
24/7 Emergency
Online Consultations

from the Hero.

Hero CTA:

Book an Appointment

Secondary:

Explore Our Services

No phone CTA in the Hero.

============================================================
13. HERO DESIGN
============================================================

The Hero should be cinematic but CLEAN.

Use the actual footage as the primary visual.

Do not cover it with a giant black overlay.

Use a sophisticated layered gradient only where necessary for readability.

Text should be extremely readable.

Typography should have strong hierarchy.

The Hero should immediately communicate:

HEALING MINDS, RESTORING LIVES.

The headline should feel like a healthcare brand statement.

============================================================
14. HEADER
============================================================

The Header should look like an OFFICIAL HOSPITAL WEBSITE.

Navigation:

About
Services
Experience
Contact

Primary CTA:

Book an Appointment

Remove:

Call Now

WhatsApp

duplicate CTAs

The header should transition:

transparent over Hero

→

subtle glass/blur background after scrolling.

Do not make the glass effect excessive.

Use:

backdrop-blur
subtle border
controlled opacity

The header must remain readable.

============================================================
15. MOBILE HEADER
============================================================

Build a polished mobile navigation.

Use Framer Motion.

Right-side drawer.

Opening sequence:

backdrop fades in
drawer slides in
navigation items stagger in
CTA appears last

Closing should reverse smoothly.

Lock body scrolling while open.

Do not allow horizontal overflow.

============================================================
16. SERVICES SECTION
============================================================

The Services section MUST remain between:

OUR FOUNDATION

and

EXPERIENCE.

The old Services section must remain removed.

Do not restore the old card grid.

The new Services section should contain:

Psychological Therapy

Maternity & Delivery

Outpatient Care

Addictions Care

Ambulance Services

Online Consultations

Design it as an elegant editorial service directory.

NOT:

3 x 2 generic cards.

Recommended structure:

LEFT:
Our Services

Care designed around you.

Short supporting text.

RIGHT:
Six elegant interactive rows.

Each row:

01
Psychological Therapy
short description
arrow

02
Maternity & Delivery
short description
arrow

etc.

Hover:
- subtle Lemon accent
- text movement
- arrow movement
- description reveal
- border/background transition

Mobile:
tap-to-expand rows.

============================================================
17. OUR FOUNDATION
============================================================

Keep the existing Foundation content and improve its presentation.

Do not add fake information.

Do not invent statistics.

Do not invent awards.

Do not invent doctors.

Do not invent testimonials.

The visual hierarchy should clearly separate Foundation from Services.

============================================================
18. COLOR SYSTEM
============================================================

Lemon remains the primary brand accent.

But DO NOT make every section Lemon.

Each major section should have a deliberate visual identity.

Suggested:

HERO:
cinematic dark

FOUNDATION:
warm white / ivory

SERVICES:
soft neutral / light grey

EXPERIENCE:
deep charcoal

CONTACT:
clean white

FOOTER:
black

Lemon:
buttons
active states
small accents
progress
highlights

Do not use Lemon everywhere.

============================================================
19. CLEAN DESIGN RULE
============================================================

THIS IS CRITICAL.

The website needs to be CLEAN.

Every component must have breathing room.

Avoid:

- excessive gradients
- excessive glassmorphism
- glowing borders everywhere
- excessive shadows
- floating blobs
- particles
- neon effects
- random decorative circles
- excessive rounded cards
- huge text everywhere
- unnecessary animations
- excessive icons

Premium does NOT mean "more effects."

Premium means:

excellent spacing
excellent typography
excellent composition
excellent motion
excellent media
excellent consistency.

============================================================
20. ANIMATION SYSTEM
============================================================

Add beautiful animations across ALL sections.

Use Framer Motion.

Animations should be consistent.

FOUNDATION:
fade + upward reveal

SERVICES:
staggered row reveal

SERVICE HOVER:
subtle movement + Lemon indicator

EXPERIENCE:
cinematic slide transition

CONTACT:
staggered reveal

FOOTER:
subtle entrance

HEADER:
scroll state transition

HERO:
staggered text entrance

Use:

viewport={{ once: true, amount: 0.15 }}

where appropriate.

Support:

prefers-reduced-motion.

If reduced motion is enabled:

remove major transforms
reduce transition duration
preserve readability and functionality.

============================================================
21. CONTACT / EMAIL
============================================================

The contact form destination email is:

immediateaccuratediagnostics@yahoo.com

Use this email wherever the marketing/contact form needs the hospital's receiving email.

Do not invent another email.

If the current form uses:

mailto:

update it.

If the project already has a backend/API submission mechanism, inspect it first and update the destination appropriately.

Do not expose secret API keys in client-side code.

The contact section should remain clean and conversion-focused.

============================================================
22. CONTACT CTA
============================================================

The contact section should make it obvious how to contact the hospital.

Use:

Book an Appointment

and/or

Send an Enquiry

The hospital email should be available.

Phone number previously established:

07039092836

Use the correct international tel format:

+2347039092836

Do not reintroduce the old:

08133583097

number.

============================================================
23. RESPONSIVE REQUIREMENTS
============================================================

Test and refine:

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

Header
Hero
Foundation
Services
Experience
Contact
Footer

There must be:

NO horizontal scrolling.

NO clipped content.

NO overflowing buttons.

NO broken video containers.

NO microscopic text.

NO giant empty spaces.

============================================================
24. TYPOGRAPHY
============================================================

Keep the existing typography system where appropriate.

Use:

Inter / Plus Jakarta Sans

for interface/body content.

Use Playfair Display selectively for elegant editorial emphasis if already present.

Do not use too many font styles.

Typography should feel like a premium healthcare institution.

============================================================
25. ACCESSIBILITY
============================================================

All buttons must have accessible labels.

Videos must be muted when autoplaying.

Controls must be keyboard accessible.

Focus states must be visible.

Color contrast must be sufficient.

Respect reduced motion.

Do not make hover the ONLY way to access content.

============================================================
26. CODE QUALITY
============================================================

Keep the marketing experience isolated under:

src/marketing/

Do not break:

HMS dashboard
backend
authentication
database
API routes
existing application functionality.

Use Server Components by default.

Use "use client" only where required for:

Framer Motion
video controls
slideshow state
mobile drawer
scroll state
interactive services.

Avoid unnecessary client-side rendering.

============================================================
27. INSPECT BEFORE EDITING
============================================================

Before making changes:

1. Inspect src/marketing/
2. Inspect MarketingHome.tsx
3. Inspect Hero.tsx
4. Inspect About/Foundation component
5. Inspect Experience/LookInside component
6. Inspect Contact.tsx
7. Inspect Header.tsx
8. Inspect animations.ts
9. Inspect public/marketing/videos/
10. Search the codebase for all video references
11. Search for broken Experience video paths
12. Search for old Services references

Do not guess what currently exists.

============================================================
28. CLEAN UP BROKEN REFERENCES
============================================================

After identifying the actual files:

remove references to nonexistent video paths.

Remove duplicate slideshow implementations.

Remove unused imports.

Remove dead Service components if they are no longer referenced.

Do not delete media files unless you have verified they are unused.

============================================================
29. IMPORTANT: DO NOT OVERWRITE GOOD WORK
============================================================

This is a refinement and correction pass.

Preserve working parts of the existing website.

Do not rebuild the entire HMS application.

Do not change unrelated backend code.

Do not change authentication.

Do not change database logic.

Do not modify dashboard functionality.

Only improve the marketing landing page and its supporting assets/configuration.

============================================================
30. FINAL VISUAL STANDARD
============================================================

When finished, the landing page should feel like:

A REAL PRIVATE HOSPITAL WEBSITE.

Not a coding demo.

Not an AI template.

Not a SaaS website.

Not an animation showcase.

The first impression should be:

trustworthy
clean
modern
premium
professional
calm
human
medical

The visitor should immediately understand:

WHAT ACCURATE MEDICAL CENTER IS

WHAT SERVICES IT PROVIDES

WHAT THE FACILITY LOOKS LIKE

HOW TO CONTACT THEM

HOW TO BOOK AN APPOINTMENT

============================================================
31. FINAL VERIFICATION
============================================================

Run:

npm run lint

Then:

npm run build

Fix ALL errors and warnings that affect the implementation.

Then inspect the actual rendered website.

Specifically verify:

HERO
✓ new hero video loads
✓ poster works
✓ Healing Minds, Restoring Lives. appears
✓ no old hero trust line
✓ no duplicate hospital-name eyebrow
✓ animations work
✓ CTAs work

SERVICES
✓ old Services section is gone
✓ new Services section exists
✓ correct position
✓ six services
✓ clean editorial design
✓ no generic card grid
✓ desktop interaction works
✓ mobile interaction works

EXPERIENCE
✓ five slides exist
✓ all five actual files load
✓ videos are PORTRAIT
✓ portrait aspect ratio is preserved
✓ no stretching
✓ no aggressive cropping
✓ active video plays
✓ inactive video pauses
✓ previous works
✓ next works
✓ counter works
✓ progress works
✓ transitions work
✓ poster/fallback works
✓ mobile experience is excellent

CONTACT
✓ email is:
immediateaccuratediagnostics@yahoo.com

✓ phone is:
07039092836

GLOBAL
✓ clean
✓ responsive
✓ no horizontal overflow
✓ no broken media
✓ no fake information
✓ no unnecessary visual effects
✓ no duplicated sections
✓ animations are consistent
✓ accessibility is preserved
✓ lint passes
✓ build passes

DO NOT STOP AFTER WRITING THE PLAN.

ACTUALLY MODIFY THE CODEBASE.

If something is broken, diagnose and fix it.

If a referenced media file does not exist exactly as written, inspect the directory and use the actual matching file.

The Experience videos MUST load.

The Experience videos MUST remain PORTRAIT.

The final site MUST be CLEAN.

The final site MUST look PREMIUM.

IMPLEMENT NOW.