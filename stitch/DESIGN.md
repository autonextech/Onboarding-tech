```markdown
# Design System Specification: The Architectural Future

## 1. Overview & Creative North Star: "The Digital Atrium"
This design system moves away from the "boxed-in" nature of traditional enterprise software. It is inspired by modern high-end architecture—think of floor-to-ceiling glass, expansive white marble, and the play of light on structural steel. 

The Creative North Star is **The Digital Atrium**. Every screen should feel like a vast, light-filled space where information isn't "trapped" in containers, but rather "curated" on floating planes. We break the grid through intentional asymmetry: large-scale typography might overlap a glass container, or a primary CTA might sit offset from a column to create a sense of forward motion. The goal is an elite, executive experience that feels breathtakingly clean and weightless.

---

## 2. Colors & Surface Philosophy
The palette is rooted in authority but executed with a "spicy" architectural flair. We use whites and blues not as static fills, but as light sources.

### The Palette (Material Design Mapping)
- **Primary (Authority):** `#00236f` (Navy) — Used for core structural elements and high-level navigation.
- **Secondary (Branding):** `#3755c3` (Royal) — Used for active states and brand moments.
- **Tertiary (Energy):** `#002e44` (Deep Teal/Sky context) — Transitioning into vibrant `#0EA5E9` Sky Blue for interaction highlights.
- **Background:** `#ffffff` to `#f6fafe` — The foundation of the "Atrium."

### The "No-Line" Rule
**Explicit Instruction:** Designers are strictly prohibited from using 1px solid borders for sectioning or card definition. Boundaries must be defined through:
1.  **Tonal Transitions:** Moving from `surface` (#f6fafe) to `surface-container-low` (#f0f4f8).
2.  **Architectural Gradients:** Use a subtle linear gradient from `#FFFFFF` to `#F1F5F9` at a 135-degree angle to give surfaces "weight" without edges.
3.  **Negative Space:** Use the Spacing Scale (specifically `8` to `12`) to separate content blocks.

### The "Glass & Gradient" Rule
To achieve the "Executive Elite" feel, floating elements (modals, dropdowns, sticky headers) must use **Glassmorphism**.
- **Fill:** `surface-container-lowest` at 70% opacity.
- **Effect:** `backdrop-blur-2xl`.
- **Signature Glow:** Apply a 1px inner shadow (inset) using `#ffffff` at 40% opacity on the top and left edges to mimic light hitting the edge of a glass pane.

---

## 3. Typography: Editorial Authority
We pair the structural rigidity of **Instrument Sans** with the rhythmic flow of **Hanken Grotesk**.

*   **Display & Headlines (Instrument Sans):** Used for "The Statement." Headlines should use `tight` tracking (-0.02em to -0.04em) and `bold` weights. These are the anchors of the page.
    *   *Display-LG:* 3.5rem (The "Hero" moment).
    *   *Headline-MD:* 1.75rem (Section entry points).
*   **Body & Titles (Hanken Grotesk / Manrope):** Used for "The Information." Sophisticated, legible, and airy. 
    *   *Body-MD:* 0.875rem (Standard content).
    *   *Title-LG:* 1.375rem (Card headers).
*   **The Hierarchy Strategy:** Use extreme scale contrast. A `display-lg` headline should often sit near a `label-sm` to create a high-fashion, editorial layout that feels expensive.

---

## 4. Elevation & Depth: Tonal Layering
Depth in this system is organic, not artificial. We mimic physics through light and stacking.

- **The Layering Principle:** 
    - Base Level: `surface` (#f6fafe).
    - Section Level: `surface-container-low` (#f0f4f8) for large inset areas.
    - Component Level: `surface-container-lowest` (#ffffff) for cards. This creates a "lift" through brightness rather than shadow.
- **Ambient Shadows:** Standard drop shadows are forbidden. If a float is required, use a "Cloud Shadow": `Y: 20px, Blur: 40px, Spread: -5px, Color: rgba(30, 58, 138, 0.06)`. This uses the Primary Navy to tint the shadow, making it feel integrated with the brand.
- **Ghost Borders:** For form fields or essential containment, use the `outline-variant` (#c5c5d3) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Weightless Utility

### Buttons
- **Primary:** Gradient fill (`primary` to `secondary`). Roundedness: `md` (0.375rem). No shadow.
- **Secondary:** Transparent background with a `surface-container-high` hover state.
- **Tertiary/Ghost:** Text-only in `secondary`, using tight tracking for an elite look.

### Cards & Containers
- **Styling:** No borders. Background: `surface-container-lowest`. 
- **Inner Glow:** Use a 2px blur white inner shadow to give the card a "premium tech" feel.
- **Separation:** Use vertical white space `spacing-10` (3.5rem) instead of dividers.

### Input Fields
- **State:** Fields should be "Minimalist-Floating." A simple bottom underline using `outline-variant` at 20% opacity. Upon focus, the line expands and shifts to `secondary` (#3755c3).
- **Glass Inputs:** For executive search bars, use the `backdrop-blur-2xl` glass effect.

### Chips & Tags
- **Style:** "Weightless." No background fill; only a `surface-container-highest` subtle background shift on hover. Text should be `label-md` in `primary-fixed-dim`.

---

## 6. Do's and Don'ts

### Do
- **DO** use asymmetric layouts. If a paragraph is on the left, let the supporting image or data point sit slightly higher and to the right, breaking the row line.
- **DO** use "Spicy Whites." Layers of white on white on off-white create the "Architectural" depth we desire.
- **DO** use the Sky Blue (`#0EA5E9`) sparingly. It is a laser-pointer, used only to draw the eye to a final "Action" or "Success" state.

### Don't
- **DON'T** use 1px dividers. If you feel the need to separate two items, increase the `spacing` token or change the background tone of one item.
- **DON'T** use pure black (#000000) for text. Use `on-surface` (#171c1f) to keep the "Atrium" feel soft.
- **DON'T** use heavy corner radii. We are "Architectural," not "Playful." Stick to `md` (0.375rem) or `lg` (0.5rem) to maintain a crisp, professional edge.
- **DON'T** use standard Material shadows. They are too "dirty" for this system. Always tint shadows with the Navy brand color at very low opacities.

---

## 7. Executive Onboarding Context
Since this system serves high-level executives, the UI must respect their time.
- **Progress as Art:** Use thin, full-bleed progress bars at the very top of the surface (height: 2px) using the `secondary` to `tertiary` gradient.
- **Breathtaking Cleanliness:** Every screen should have at least 20% "Dead Space"—areas where no content lives—to reduce cognitive load and convey a sense of luxury. (Luxury is the luxury of space).```