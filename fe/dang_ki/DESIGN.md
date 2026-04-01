# Design System: The Digital Artisan

This design system serves as the foundational visual language for a platform dedicated to traditional craft villages. It is engineered to bridge the gap between "Tech Cleanliness" (precision, reliability, speed) and "Handcrafted Warmth" (texture, history, human touch). 

By rejecting standard "out-of-the-box" UI conventions, we create an editorial, high-end commerce experience that treats products not as SKUs, but as heritage pieces.

---

## 1. Creative North Star: "The Digital Curator"

Our design philosophy is **The Digital Curator**. We do not build "pages"; we curate "exhibitions." 

To break the "template" look common in social commerce, this design system leans into **intentional asymmetry** and **tonal depth**. Rather than rigid, boxed grids, we use breathing room (whitespace) as a luxury material. Components should feel like artifacts placed thoughtfully on a gallery plinth. 

We achieve sophistication through:
*   **Layered Surfaces:** Depth through color, not lines.
*   **Typographic Authority:** High-contrast scale shifts between display and body text.
*   **Tactile Digitalism:** Softening modern UI primitives with earthy, organic tones.

---

## 2. Colors & Surface Philosophy

The palette is a dialogue between the sterile white of a modern gallery (`#f9f9f7`) and the raw materials of the craft: Terracotta (`primary`), Moss (`secondary`), and Rattan (`tertiary`).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the definition required. This creates a "seamless" interface that feels woven rather than assembled.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
*   **Base:** `surface` (#f9f9f7)
*   **Low Priority/Backdrop:** `surface-container-low` (#f2f4f2)
*   **Interactive/Elevated Card:** `surface-container-lowest` (#ffffff)
*   **Deep Contrast/Niche Content:** `surface-container-highest` (#dee4e0)

### The "Glass & Gradient" Rule
To add "soul," use subtle gradients for primary CTAs, transitioning from `primary` (#835244) to `primary-container` (#ffdbd0). For floating navigation or overlays, use **Glassmorphism**:
*   **Token:** `surface-container-lowest` at 80% opacity.
*   **Effect:** `backdrop-blur: 12px`.
This ensures the "Handcrafted Warmth" of background images bleeds through the "Tech Cleanliness" of the interface.

---

## 3. Typography: Editorial Authority

We use a dual-sans approach to maintain a modern edge while ensuring maximum readability for commerce.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity and subtle warmth. 
    *   *Role:* Establish the "Curated" feel. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments to evoke high-end print magazines.
*   **Body & Labels (Inter):** Chosen for its technical precision.
    *   *Role:* Functional clarity. Use `body-md` (0.875rem) for product descriptions and `label-md` (0.75rem) for metadata.

**Hierarchy Note:** Always pair a `headline-lg` in `on-surface` with a `body-sm` in `on-surface-variant`. The contrast in weight and color (Terracotta vs. Slate Gray) provides an immediate sense of professional hierarchy.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often too "heavy" for a minimalist craft platform. We use **Tonal Layering**.

*   **The Layering Principle:** To lift a product card, do not add a shadow. Instead, place a `surface-container-lowest` card on a `surface-container` background.
*   **Ambient Shadows:** If a floating element (like a Cart Drawer) requires a shadow, use:
    *   `box-shadow: 0 20px 40px rgba(46, 52, 50, 0.06);` (a tinted version of `on-surface`).
*   **The "Ghost Border":** If accessibility requires a stroke (e.g., on an input field), use the `outline-variant` token at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

All components are based on **shadcn/ui** logic but styled with the following constraints:

### Buttons
*   **Primary:** Background `primary` (#835244), Text `on-primary`. Subtle rounding (`rounded-md`: 0.375rem). No shadow.
*   **Secondary:** Background `secondary-container` (#dbe9a9), Text `on-secondary-container`. Use for "Add to Cart" or secondary actions.
*   **Tertiary/Ghost:** No background. Text `primary`. Use for "View Details."

### Input Fields
*   **Style:** Flat and clean. 
*   **Background:** `surface-container-highest` (#dee4e0) at 40% opacity.
*   **Shape:** `rounded-sm` (0.125rem) to maintain a "Tech" sharpness.
*   **Interaction:** On focus, transition background to `surface-container-lowest` and add a 1px "Ghost Border" using `primary`.

### Cards & Lists
*   **The Rule:** **Zero Dividers.** 
*   Separate items using `spacing-6` (2rem) of vertical whitespace. 
*   For product grids, use asymmetrical layouts (e.g., a 2-column grid where one image is slightly taller than the other) to mimic a scrapbook or gallery wall.

### Modern Addition: The "Provenance Chip"
*   A custom component for this platform. A small, `secondary-container` chip with `secondary` text, using `label-sm`. Placed on product images to indicate the village of origin (e.g., "Bát Tràng Ceramics").

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Padding:** Allow headers to have more top-padding than bottom-padding to create an editorial "lift."
*   **Embrace the "Earth":** Use `tertiary` (#7e572e) for iconography to keep the vibe organic.
*   **Color-Shift for Hover:** Instead of darkening a color on hover, shift it to its "Fixed" variant (e.g., `primary` to `primary_fixed_dim`).

### Don't:
*   **Don't Use Pure Black:** Always use `on-background` (#2e3432) for text. It’s softer and feels more like natural ink.
*   **Don't Use 1px Dividers:** If you feel the need for a line, use a 4px wide `surface-container-highest` block or simply more whitespace.
*   **Don't Use Vibrant Notifications:** For errors, use the muted `error` (#9f403d). We must maintain a "sophisticated" calm, even during errors.

---

## 7. Spacing Logic

The spacing scale is built on a **0.35rem base (approx 5.6px)**. 
*   Use `spacing-3` (1rem) for internal component padding.
*   Use `spacing-12` (4rem) to separate major sections.
*   **Pro Tip:** Use "Negative Space as a Component." A large gap of `spacing-20` between a hero image and the first product row signals to the user that this is a luxury, unhurried experience.