# Design System Strategy: Làng Nghề Platform

## 1. Overview & Creative North Star: "The Modern Kiln"
This design system moves beyond the standard e-commerce grid to embrace **"The Modern Kiln"**—a creative direction that balances the raw, earthy heritage of Vietnamese craftsmanship with a high-end, editorial digital experience. 

Traditional craft is about the hands, the earth, and the heat. Our UI reflects this through **Organic Asymmetry** and **Tonal Depth**. We reject the "boxed-in" feeling of generic templates. Instead, we use expansive whitespace (the "breathing room") and layered surfaces to suggest the physical arrangement of a curator's gallery. The experience should feel like a slow-crafted discovery, not a high-speed transaction.

---

## 2. Colors & Surface Philosophy
The palette is grounded in the pigments of the earth: Terracotta (the kiln), Olive (the landscape), and Charcoal (the ink).

### Color Token Application
*   **Primary (`#a6331b` / `#c84b31`):** Use sparingly for high-intent actions. The shift between `primary` and `primary_container` should be used for subtle gradients in hero CTAs to add "soul" and depth.
*   **Secondary (`#52652a`):** Reserved for "Growth" and "Origin" markers—use this for artisan badges, sustainability tags, and secondary accents.
*   **The "No-Line" Rule:** We prohibit 1px solid borders for sectioning. Structural definition must be achieved through background shifts. For example, a `surface_container_low` section should sit directly on a `surface` background.
*   **Glass & Gradient:** Floating navigation bars or product overlays must use **Glassmorphism**. Apply a `surface` color at 70% opacity with a `20px` backdrop-blur. This ensures the craft photography—our most important asset—is never fully obscured.

---

## 3. Typography: The Editorial Voice
We utilize **Manrope** for its unique balance of geometric modernism and warm, humanist curves. It reads like a modern magazine.

*   **The Power of Scale:** Use `display-lg` (3.5rem) for hero statements, paired with ample `16` (5.5rem) spacing. High contrast in size creates an authoritative, premium feel.
*   **Hierarchy as Narrative:**
    *   **Display/Headline:** Use for artisan stories and collection titles.
    *   **Title/Body:** Use `body-lg` for product descriptions to ensure a comfortable, "long-read" experience.
    *   **Labels:** Use `label-md` in all-caps with 0.05em tracking for metadata (e.g., "HANDMADE IN BÁT TRÀNG") to mimic gallery plaques.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to create "atmosphere."

*   **The Layering Principle:** Depth is achieved by stacking surface tiers. Place a `surface_container_lowest` card (Pure White) on a `surface_container_low` background. This creates a soft, natural lift.
*   **Ambient Shadows:** For interactive states (hover), use a shadow tinted with the `on_surface` color: `box-shadow: 0 20px 40px -12px rgba(26, 28, 28, 0.08)`. It should feel like a soft glow of ambient light, not a black smudge.
*   **The "Ghost Border" Fallback:** If containment is required for accessibility, use the `outline_variant` token at 15% opacity. Never use 100% opaque borders.
*   **Softened Geometry:** All containers must use the `xl` (1.5rem) corner radius to mirror the organic, softened edges of handmade pottery and woven textiles.

---

## 5. Components

### Buttons
*   **Primary:** A gradient transition from `primary` to `primary_container`. `xl` rounding. No border.
*   **Secondary:** `surface_container_highest` background with `on_surface` text.
*   **Tertiary:** Ghost style. No background, `primary` text, underlined on hover.

### Input Fields
*   **Structure:** No background color. Only a bottom "Ghost Border" (`outline_variant` at 20%). On focus, the border transitions to `primary` and the label (using `label-sm`) slides upward.
*   **Error States:** Use the `error` token (`#ba1a1a`) only for the text and a subtle 2pt vertical line to the left of the input, avoiding "red box" fatigue.

### Cards & Discovery
*   **No Dividers:** Forbid the use of divider lines between list items or card sections. Use `3` (1rem) or `4` (1.4rem) spacing units to define boundaries.
*   **Artisan Chips:** Use `secondary_container` with `on_secondary_container` text. These should be pill-shaped (`full` roundedness) to contrast against the `xl` product cards.

### Interactive Lists
*   Use `surface_container_low` for the list container. Each item, on hover, transitions to `surface_container_lowest` with a soft ambient shadow. This creates a "hover-lift" effect that feels tactile.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetric Layouts:** Offset images from text blocks to create a curated, non-linear feel.
*   **Embrace White Space:** If a section feels crowded, double the spacing token (e.g., move from `8` to `16`).
*   **Use "Tints" for Shadows:** Ensure shadows contain a hint of the background color to maintain a premium, integrated look.

### Don’t:
*   **Don't Use Pure Black:** Always use `on_surface` (#1A1C1C) for text to maintain a soft, ink-like quality.
*   **Don't Use 1px Borders:** Never use a solid border to separate the header from the body; use a background shift or a backdrop-blur instead.
*   **Don't Crowd Icons:** Lucide icons need "air." Ensure an icon is surrounded by at least 12px of padding within any interactive element.