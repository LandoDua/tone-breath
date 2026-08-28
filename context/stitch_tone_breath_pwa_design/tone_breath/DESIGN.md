---
name: Tone Breath
colors:
  surface: '#FFFFFF'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a77'
  outline-variant: '#bbcac6'
  surface-tint: '#006b5f'
  primary: '#006b5f'
  on-primary: '#ffffff'
  primary-container: '#14b8a6'
  on-primary-container: '#00423b'
  inverse-primary: '#4fdbc8'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#9b4426'
  on-tertiary: '#ffffff'
  tertiary-container: '#f38764'
  on-tertiary-container: '#6c2106'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#71f8e4'
  primary-fixed-dim: '#4fdbc8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#7c2d11'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  accent-glow: rgba(20, 184, 166, 0.1)
  dark-bg: '#0F172A'
  dark-surface: '#1E293B'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 44px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 40px
---

## Brand & Style

The design system for this mindfulness PWA is rooted in **Empathetic Minimalism**. The goal is to reduce cognitive load and create a digital sanctuary that feels human and organic rather than mechanical. It draws inspiration from **Modern Material Design**, utilizing soft surfaces, intentional whitespace, and subtle depth to guide the user toward a state of calm.

The visual narrative is centered around "The Pulse"—a singular, focal point of interaction that mimics biological rhythms. Every design decision serves the purpose of breathwork, ensuring that the interface never competes for the user's attention. The style is light, airy, and grounded in tranquility, providing a "quiet" UI that supports mental health and focus.

## Colors

The palette is designed to prevent visual fatigue. The primary background uses **Pearl Grey (#F8FAFC)** instead of pure white to soften the screen's glow. **Vibrant Teal (#14B8A6)** serves as the "Life-Force" color, used exclusively for the breathing guide and primary actions to create a strong mental association between the color and the act of breathing.

**Warm Slate (#334155)** provides high-readability text with a softened contrast, avoiding the harshness of pure black. In Dark Mode, the system shifts to a deep **Blue Night (#0F172A)** with luminous teal accents to maintain accessibility and comfort during evening use.

## Typography

This design system utilizes **Inter** for its geometric clarity and humanistic balance. To evoke serenity, we lean heavily into **Light (300)** and **Regular (400)** weights. 

The type hierarchy is spacious. Headlines use light weights and negative letter spacing for a sophisticated, editorial feel. Body text is optimized for comfort, while labels and small captions use slightly increased tracking to ensure legibility on mobile devices. The "Display" style is reserved for empathetic greetings and focus-state instructions.

## Layout & Spacing

The layout follows a **fluid, content-centric model**. It avoids complex grids to keep the focus on the central breathing element. 

- **Margins:** A generous 24px safety margin on mobile ensures the UI feels uncrowded.
- **Rhythm:** An 8px base unit governs all padding and margins. 
- **The "Breathable" Grid:** Elements are vertically stacked with significant gaps (Section Gap) to allow each piece of information to "breathe" independently. On desktop, content is constrained to a 480px central column to maintain the intimacy of the mobile experience.

## Elevation & Depth

Elevation is used sparingly to denote interactive surfaces. The design system employs **Tonal Layers** combined with **Ambient Shadows**.

- **Cards & Modals:** Use a very subtle, diffused shadow (15% opacity of the slate color) with a large blur radius (20px-40px) to make elements appear to float gently above the background.
- **The Breathing Circle:** Instead of a shadow, the central circle uses a **10% opacity Teal ring** as a "limit shadow." This serves as a visual target for the maximum expansion of the breath.
- **Active States:** Subtle 1px inner borders are used in dark mode instead of heavy shadows to maintain a "flat but deep" aesthetic.

## Shapes

The shape language is dominated by **Rounded** forms (0.5rem base radius). This choice reflects the organic nature of breath and avoids the "aggressiveness" of sharp corners.

- **Primary Buttons:** Large, fully pill-shaped for a tactile, friendly feel.
- **Cards:** Use `rounded-xl` (1.5rem) to create soft, containerized sections.
- **The Guide:** The core of the app is a perfect circle, representing the holistic and cyclical nature of mindfulness.

## Components

### Buttons
Primary buttons are pill-shaped, filled with Teal, and use white text. Secondary buttons use a tonal slate ghost style. Buttons should have a "squishy" feel, achieved through a slight scale-down animation on press.

### The Breathing Guide
The central component. It consists of a solid Teal circle that scales from 40% to 100% of its container. A static 10% opacity ring marks the 100% boundary. Text inside the circle must be vertically and horizontally centered.

### Cards
Mode selection cards (e.g., "Sleep", "Relax") should be large surfaces with light shadows. They contain a Lucide icon, a headline, and a short description. The entire card is a single tap target.

### Time Selector
A horizontal scroll or "wheel" interface. It should use the `label-lg` typography for units. The selected value is highlighted in Teal with a slight scale increase.

### Progress Indicators
Phase maps (e.g., 4-7-8) are displayed as a horizontal row of numbers. The active phase is enclosed in a small teal circle or highlighted in bold, while inactive phases are muted to 30% opacity warm slate.

### Inputs
Standard inputs are rarely used, but when present, they use a subtle bottom border or a soft-rounded container with a background color only 2% darker than the main background.