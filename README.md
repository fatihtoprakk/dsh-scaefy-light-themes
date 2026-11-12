# Scaefy light themes for DeepSeek Harness

A curated collection of 27 light color themes for
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), adapted
from the [Scaefy OpenCode light themes](https://github.com/fatihtoprakk/opencode-light-themes).

## Install

### From a local directory

1. Open DeepSeek Harness.
2. Go to **Plugins > Add plugin**.
3. Choose this repository's directory (the one containing `package.json`).
4. Enable the **Scaefy light themes** row if it is not enabled automatically.
5. Restart DeepSeek Harness (or refresh the page) so the client module loads.

### From a plugin index (Discover)

1. Open **Plugins**, enable the experimental **Custom plugin indexes** bundle
   (so the **Discover** tab appears).
2. In **Discover**, choose **Add index source** and enter:
   `https://raw.githubusercontent.com/fatihtoprakk/dsh-scaefy-light-themes/master/index.json`
3. Search for **Scaefy light themes**, confirm the install.
4. After install, open **Settings > General > Appearance** and pick a theme
   from the **Scaefy theme** selector (or via the in-process theme switcher).

### From Git directly

```bash
# pnpm spec (as produced by the market index)
git+https://github.com/fatihtoprakk/dsh-scaefy-light-themes.git#41a05e46749bc6490f53ce29368a93fe5f02d06a
```

## Themes

27 themes: scaefy-light, scaefy-solarized-light, scaefy-vivid-light,
scaefy-coffee-cream, scaefy-gold-d-raynh-light, scaefy-melle-julie-light,
scaefy-classic-light, scaefy-hc-flurry, scaefy-milkshake-raspberry,
scaefy-milkshake-blueberry, scaefy-milkshake-mango, scaefy-milkshake-mint,
scaefy-milkshake-vanilla, scaefy-bluloco-light, scaefy-brackets-light-pro,
scaefy-ysgrifennwr, scaefy-netbeans-light, scaefy-quiet-light, scaefy-hop-light,
scaefy-github-light, scaefy-github-plus, scaefy-folio-light,
scaefy-catppuccin-latte, scaefy-rose-pine-dawn, scaefy-flexoki-paper,
scaefy-everforest-light, scaefy-kanagawa-lotus.

## Usage

After installation, open **Settings > General > Appearance** and pick a theme.

## Limitations

Third-party themes are in-process extensions in DeepSeek Harness: selecting one
applies it for the current session; the durable Appearance preference only stores
the built-in `light` / `dark` / `system` values, so a selected Scaefy theme is
not restored after a restart — re-select it from Appearance.

## Contact

- X (Twitter): [@ftoprak](https://x.com/ftoprak)
- Web: [scaefy.com](https://scaefy.com)
- Issues: [GitHub Issues](https://github.com/fatihtoprakk/dsh-scaefy-light-themes/issues)

## License

MIT — see [LICENSE](LICENSE).

Color values ported from the Scaefy OpenCode light themes (MIT). `scaefy-folio-light`
ports the Folio palette from [Pane](https://github.com/greenfield-inc/Pane) (AGPL-3.0);
only color values were re-expressed.