# Scaefy light themes

27 light color themes for DeepSeek Harness, ported from the
[Scaefy OpenCode light themes](https://github.com/fatihtoprakk/opencode-light-themes).

## Usage

Open **Settings > General** and pick a theme from the **Scaefy theme** row
(palette swatch chips). The choice is remembered across restarts.

The built-in **Appearance** row above it still switches Light / Dark / System;
choosing one of those clears the Scaefy theme.

## How the colors are derived

Each source theme is read through its own semantic map (`theme.background`,
`theme.text`, `theme.primary`, …) rather than by assuming `defs.bg`-style
names, because the source palettes name their entries differently
(`sheet` / `chrome` / `paper` in Folio, `{ light, dark }` reference pairs in
Catppuccin, Everforest, Flexoki, Kanagawa, and Rosé Pine).

The resolved palette is projected onto 144 DeepSeek Harness tokens covering:

- canvas, raised layers, overlays, sidebar, composer, cards, menus
- text, secondary text, captions, links, brand accent
- borders, selection, scrollbars, hover and active interaction layers
- buttons, switches, settings cards, onboarding, illustrations
- Markdown code blocks, inline code, and diff surfaces
- Shiki syntax tokens for code blocks
- macOS sidebar vibrancy tint and wash gradients, kept warm instead of the
  built-in blue tint

Translucent surfaces are expressed with `color-mix()`, so menus, hover layers,
and the glass sidebar blend the theme's own colors rather than white.

## Contrast guards

Two source themes ship inverted or near-background foregrounds
(`github-plus` defines `primary` as `#fafbfc`). The generator measures WCAG
contrast against the theme's canvas and substitutes a readable accent when a
foreground would be invisible, so every port keeps legible buttons and labels.

## Limitations

- Third-party themes are in-process extensions: the durable Appearance
  preference only stores `light` / `dark` / `system`. This bundle restores the
  last scaefy theme from `localStorage` at startup, so there is a brief flash of
  the default palette before it applies.
- Themes are light-scheme only; they keep their light tokens if the OS is dark.
- Colors absent from a source theme fall back to a nearby derived value.