---
name: Vibrant Marketplace
colors:
  surface: "#f9f9f9"
  surface-dim: "#dadada"
  surface-bright: "#f9f9f9"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f3f3"
  surface-container: "#eeeeee"
  surface-container-high: "#e8e8e8"
  surface-container-highest: "#e2e2e2"
  on-surface: "#1a1c1c"
  on-surface-variant: "#5b403b"
  inverse-surface: "#2f3131"
  inverse-on-surface: "#f1f1f1"
  outline: "#8f7069"
  outline-variant: "#e3beb6"
  surface-tint: "#b62506"
  primary: "#b22204"
  on-primary: "#ffffff"
  primary-container: "#d63c1e"
  on-primary-container: "#fffbff"
  inverse-primary: "#ffb4a4"
  secondary: "#5d5f5f"
  on-secondary: "#ffffff"
  secondary-container: "#dfe0e0"
  on-secondary-container: "#616363"
  tertiary: "#7c5400"
  on-tertiary: "#ffffff"
  tertiary-container: "#9c6b00"
  on-tertiary-container: "#fffbff"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdad3"
  primary-fixed-dim: "#ffb4a4"
  on-primary-fixed: "#3e0500"
  on-primary-fixed-variant: "#8d1600"
  secondary-fixed: "#e2e2e2"
  secondary-fixed-dim: "#c6c6c7"
  on-secondary-fixed: "#1a1c1c"
  on-secondary-fixed-variant: "#454747"
  tertiary-fixed: "#ffdeae"
  tertiary-fixed-dim: "#ffba3f"
  on-tertiary-fixed: "#281800"
  on-tertiary-fixed-variant: "#604100"
  background: "#f9f9f9"
  on-background: "#1a1c1c"
  surface-variant: "#e2e2e2"
  price-red: "#EE4D2D"
  promo-orange: "#FF5722"
  success-green: "#26AA99"
  surface-gray: "#F5F5F5"
  border-subtle: "#E8E8E8"
  text-main: "#222222"
  text-secondary: "#757575"
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  price-display:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: -0.02em
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 14px
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: "500"
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 12px
  margin-mobile: 12px
  margin-desktop: 24px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system is built for a high-velocity, high-trust e-commerce environment. It draws inspiration from the energetic and accessible nature of modern marketplaces, prioritizing clarity, speed, and conversion.

The design style is **Corporate / Modern** with a focus on high-density information display. It utilizes a clean white background to let product imagery lead, while using a signature high-energy orange to drive action and highlight value. The aesthetic is "functional-vibrant"—maintaining a professional structure that feels reliable for financial transactions, while using playful accents to maintain a sense of discovery and excitement.

Key principles:

- **Mobile-First Efficiency:** UI density is optimized for small screens, ensuring price points and "Add to Cart" actions are always prominent.
- **Visual Trust:** Use of subtle borders and consistent spacing to create a structured, dependable shopping environment.
- **Action-Oriented:** The primary brand color is reserved almost exclusively for interactive elements and critical price information.

## Colors

The color palette is anchored by a vibrant primary orange, designed to trigger engagement and signal value.

- **Primary:** Used for primary buttons, active states, and brand iconography.
- **Secondary:** Predominantly white, used for surfaces and containers to provide a "clean" backdrop for colorful product photography.
- **Tertiary:** A golden yellow used sparingly for flash sales, ratings, and urgency indicators.
- **Neutral:** A range of cool grays used for backgrounds (`#F5F5F5`) and subtle borders.

Price tags should always utilize the primary brand color to maintain a direct visual link between the brand and the "deal."

## Typography

This design system uses **Inter** for its exceptional legibility in UI contexts and its modern, neutral character.

The type scale is designed for high-density layouts. We use a specialized `price-display` token for product costs to ensure they are immediately scannable. Small labels (`label-sm` and `label-bold`) are essential for badges, shipping tags (e.g., "Free Shipping"), and category chips.

Weight is used strategically: Semi-bold (600) is reserved for product titles and prices, while Regular (400) handles descriptions and secondary meta-data.

## Layout & Spacing

The layout utilizes a **Fluid Grid** system that optimizes for vertical scrolling on mobile and a 12-column structure on desktop.

- **Mobile:** A 2-column product grid is the standard for category pages to balance image size with information density. Margins are kept tight (12px) to maximize screen real estate.
- **Desktop:** The layout centers within a 1200px container. Product grids scale to 5 or 6 columns.
- **Rhythm:** An 8px-based spacing scale is used for vertical stacking, while 4px (stack-xs) is used for tight groupings like price units and their currency symbols.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-contrast outlines** to create a sense of organized structure without the visual clutter of heavy shadows.

- **Level 0 (Background):** Used for the main page background (`#F5F5F5`).
- **Level 1 (Surface):** White containers (`#FFFFFF`) with a 1px subtle border (`#E8E8E8`). This is the primary state for product cards and section blocks.
- **Level 2 (Hover/Active):** A soft, ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) is applied only on interaction to indicate "lift" and "clickability."
- **Floating:** High-elevation shadows are reserved for mobile bottom navigation bars and floating "Back to Top" buttons.

## Shapes

The shape language is **Soft**, striking a balance between the precision of a professional marketplace and the approachability of a consumer app.

- **Cards & Inputs:** Use the standard 4px (`0.25rem`) corner radius.
- **Promotional Badges:** Can use a "Pill" shape to distinguish them from structural UI elements.
- **Buttons:** Maintain the 4px radius to feel "sturdy" and reliable.
- **Product Images:** Should always have the same 4px radius to ensure they feel integrated into the card container.

## Components

### Buttons

- **Primary:** Solid `#EE4D2D` background with White text. Used for "Buy Now" and "Add to Cart" (Desktop).
- **Secondary:** White background with a 1px `#EE4D2D` border and `#EE4D2D` text. Used for "Chat Now" or secondary actions.
- **Ghost:** No border, `#757575` text. Used for "More" or tertiary navigation.

### Product Cards

The core of the system.

- **Layout:** Vertical stack: Image (1:1 ratio) -> Title (2 lines max) -> Price/Promotion row -> Rating/Sold count row.
- **Badges:** Small, colorful rectangles (e.g., "Mall", "Preferred") placed in the top-left of the image.

### Price Tags

- Always use the `price-display` typography.
- Use the `#EE4D2D` color for the current price.
- Original prices (for discounts) should be shown in `body-sm`, `#757575`, and have a strikethrough.

### Input Fields

- Height of 40px (mobile) or 44px (desktop).
- Border: 1px `#E8E8E8`.
- Focus state: Border changes to `#EE4D2D` with no outer glow.

### Chips

- Used for filters and category tags.
- Background: `#F5F5F5`; Text: `#222222`.
- Selected state: Background `#EE4D2D` with White text.
