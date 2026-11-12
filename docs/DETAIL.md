# Scaefy light themes

A curated collection of 27 light color themes for DeepSeek Harness, adapted
from the [Scaefy OpenCode light themes](https://github.com/fatihtoprakk/opencode-light-themes).

## Usage

1. Install the bundle from Plugins (or via a plugin index).
2. Open **Settings > General > Appearance**.
3. The 27 Scaefy themes appear alongside the built-in Light / Dark / System
   choices. Selecting one applies its palette immediately.

## Included themes

scaefy-light, scaefy-solarized-light, scaefy-vivid-light, scaefy-coffee-cream,
scaefy-gold-d-raynh-light, scaefy-melle-julie-light, scaefy-classic-light,
scaefy-hc-flurry, scaefy-milkshake-raspberry, scaefy-milkshake-blueberry,
scaefy-milkshake-mango, scaefy-milkshake-mint, scaefy-milkshake-vanilla,
scaefy-bluloco-light, scaefy-brackets-light-pro, scaefy-ysgrifennwr,
scaefy-netbeans-light, scaefy-quiet-light, scaefy-hop-light, scaefy-github-light,
scaefy-github-plus, scaefy-folio-light, scaefy-catppuccin-latte,
scaefy-rose-pine-dawn, scaefy-flexoki-paper, scaefy-everforest-light,
scaefy-kanagawa-lotus.

## Limitations

- Third-party themes are in-process extensions in DeepSeek Harness: selecting
  one applies it for the current session. The durable Appearance preference only
  stores the built-in `light` / `dark` / `system` values, so a selected Scaefy
  theme is not restored after a restart; re-select it from Appearance.
- Only the alias tokens mapped from each source theme are overridden; the rest
  fall back to the built-in light palette.
- Syntax highlighting colors are overridden where the source theme provides
  them, but Shiki's own token set is limited.