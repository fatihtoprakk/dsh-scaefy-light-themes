/**
 * Builds the DSH client module for the Scaefy light themes.
 *
 * Resolves each OpenCode theme through its `theme` map (not the `defs` keys
 * directly), because source themes name their palette entries differently:
 * some use `bg`/`bgPanel`, folio uses `sheet`/`chrome`/`paper`, and the
 * ported pastel themes use `{ light, dark }` reference pairs.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = '/Users/fatihtoprak/Sites/opencode-light-themes/themes';
const OUT = '/Users/fatihtoprak/Developer/dsh-scaefy-light-themes/client.js';

const files = readdirSync(SRC).filter(f => f.endsWith('.json')).sort();

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const isHex = v => typeof v === 'string' && HEX.test(v.trim());

/** Resolve one reference (defs key, literal color, or { light, dark } pair) to a light color. */
function deref(defs, value, depth = 0) {
  if (value === null || value === undefined || depth > 4) return undefined;
  if (typeof value === 'string') {
    if (isHex(value)) return value.trim();
    return deref(defs, defs[value], depth + 1);
  }
  if (typeof value === 'object') return deref(defs, value.light ?? value.dark, depth + 1);
  return undefined;
}

/** Build a semantic color lookup for one source theme. */
function palette(source) {
  const defs = source.defs ?? {};
  const theme = source.theme ?? {};
  const get = (name) => {
    const direct = deref(defs, theme[name]);
    if (direct !== undefined) return direct;
    return deref(defs, name);
  };
  const background = get('background') ?? get('backgroundPanel') ?? get('backgroundElement') ?? '#ffffff';
  const backgroundPanel = get('backgroundPanel') ?? get('backgroundElement') ?? background;
  const backgroundElement = get('backgroundElement') ?? backgroundPanel;
  const text = get('text') ?? '#1f1f1f';
  const textMuted = get('textMuted') ?? text;
  const primary = get('primary') ?? text;
  const accent = get('accent') ?? primary;
  const border = get('border') ?? textMuted;
  const borderSubtle = get('borderSubtle') ?? border;
  const borderActive = get('borderActive') ?? primary;
  const error = get('error') ?? '#c0392b';
  const warning = get('warning') ?? '#9a6a00';
  const success = get('success') ?? '#2f7d32';
  const info = get('info') ?? accent;

  // Guard against source themes that ship near-background foregrounds.
  const inkDark = '#1a1a1a';
  const safeText = guardForeground(text, [inkDark], background, 4.5);
  const safeMuted = guardForeground(textMuted, [mixToHex(safeText, background, 55), safeText], background, 2.6);
  const safePrimary = guardForeground(primary, [accent, info, safeText], background, 2.8);
  const safeAccent = guardForeground(accent, [safePrimary, safeText], background, 2.8);

  return {
    background, backgroundPanel, backgroundElement,
    text: safeText,
    textMuted: safeMuted,
    primary: safePrimary,
    secondary: get('secondary') ?? safeMuted,
    accent: safeAccent,
    border, borderSubtle, borderActive: guardForeground(borderActive, [safePrimary], background, 2.4),
    error, warning, success, info,
    diffAdded: get('diffAdded') ?? success,
    diffRemoved: get('diffRemoved') ?? error,
    diffContext: get('diffContext') ?? textMuted,
    syntaxComment: get('syntaxComment') ?? textMuted,
    syntaxKeyword: get('syntaxKeyword') ?? primary,
    syntaxFunction: get('syntaxFunction') ?? accent,
    syntaxVariable: get('syntaxVariable') ?? text,
    syntaxString: get('syntaxString') ?? success,
    syntaxNumber: get('syntaxNumber') ?? warning,
    syntaxType: get('syntaxType') ?? get('syntaxNumber') ?? warning,
    syntaxOperator: get('syntaxOperator') ?? text,
    syntaxPunctuation: get('syntaxPunctuation') ?? textMuted,
    markdownHeading: get('markdownHeading') ?? primary,
    markdownLink: get('markdownLink') ?? accent,
  };
}

const mix = (a, b, pct) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
const alpha = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/** Parse a hex color into 0..1 sRGB channels. */
function rgb(color) {
  const hex = color.trim().replace('#', '');
  const full = hex.length === 3 || hex.length === 4
    ? hex.slice(0, 3).split('').map(c => c + c).join('')
    : hex.slice(0, 6);
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
}

/** WCAG relative luminance. */
function luminance(color) {
  const [r, g, b] = rgb(color).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors. */
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Blend two hex colors and return a hex color; `pct` is the weight of `a`. */
function mixToHex(a, b, pct) {
  const [ca, cb] = [rgb(a), rgb(b)];
  const channel = (i) => Math.round((ca[i] * pct + cb[i] * (100 - pct)) * 255);
  return '#' + [0, 1, 2].map(i => channel(i).toString(16).padStart(2, '0')).join('');
}

/**
 * Keep a foreground readable on the theme's own canvas. Some source themes
 * ship inverted or near-background accents (github-plus defines `primary` as
 * `#fafbfc`), which would render invisible buttons.
 */
function guardForeground(candidate, fallbacks, canvas, minimum) {
  for (const value of [candidate, ...fallbacks]) {
    if (typeof value !== 'string' || !isHex(value)) continue;
    if (contrast(value, canvas) >= minimum) return value;
  }
  return fallbacks[fallbacks.length - 1];
}

/** Map a resolved palette onto the DSH `--dsw-*` alias and specific tokens. */
function tokenize(p) {
  const t = {};
  const set = (name, value) => { if (typeof value === 'string' && value !== '') t[name] = value; };

  // Canvas and raised surfaces.
  set('--dsw-alias-bg-base', p.background);
  set('--dsw-alias-bg-layer-1', p.backgroundElement);
  set('--dsw-alias-bg-layer-2', p.backgroundElement);
  set('--dsw-alias-bg-layer-3', p.backgroundPanel);
  set('--dsw-alias-bg-overlay', p.backgroundElement);
  set('--dsw-alias-bg-module-platform', p.backgroundElement);
  set('--dsw-alias-bg-multi-select', p.backgroundElement);
  set('--dsw-alias-bg-skeleton', alpha(p.text, 6));
  set('--dsw-alias-bg-document-preview', p.backgroundElement);
  set('--dsw-alias-label-document-preview', p.textMuted);
  set('--dsw-alias-bg-document-selection', alpha(p.primary, 35));

  // Borders.
  set('--dsw-alias-border-l1', p.borderSubtle);
  set('--dsw-alias-border-l2', p.border);
  set('--dsw-alias-border-l2-darkmode-thin', p.border);
  set('--dsw-alias-border-l3', p.border);
  set('--dsw-alias-border-l4', p.border);
  set('--dsw-alias-border-selected', p.borderActive);
  set('--dsw-alias-border-inverted', alpha(p.text, 8));
  set('--dsw-alias-border-inverted2', alpha(p.text, 5));

  // Brand, links, state.
  set('--dsw-alias-brand-primary', p.primary);
  set('--dsw-alias-brand-primary-invert', p.background);
  set('--dsw-alias-brand-text', p.text);
  set('--dsw-alias-link', p.accent);
  set('--dsw-alias-state-business-primary', p.primary);
  set('--dsw-alias-state-business-tertiary', mix(p.background, p.primary, 88));
  set('--dsw-alias-state-error-primary', p.error);
  set('--dsw-alias-state-error-secondary', mix(p.error, p.background, 70));
  set('--dsw-alias-state-success-primary', p.success);
  set('--dsw-alias-state-success-secondary', mix(p.success, p.background, 70));
  set('--dsw-alias-state-success-tertiary', mix(p.background, p.success, 88));
  set('--dsw-alias-state-warn-primary', p.warning);
  set('--dsw-alias-state-warn-secondary', mix(p.warning, p.background, 70));
  set('--dsw-alias-state-warn-tertiary', mix(p.background, p.warning, 88));
  set('--dsw-alias-state-warn-label', p.warning);
  set('--dsw-alias-state-idle-primary', p.border);
  set('--dsw-alias-state-done-primary', p.accent);
  set('--dsw-alias-trajectory-accent', p.primary);
  set('--dsw-alias-chart-messages', p.primary);
  set('--dsw-alias-chart-system', p.textMuted);
  set('--dsw-alias-chart-tools', p.accent);

  // Labels.
  set('--dsw-alias-label-primary', p.text);
  set('--dsw-alias-label-primary-bluish', p.text);
  set('--dsw-alias-label-primary-dimmed', mix(p.text, p.background, 85));
  set('--dsw-alias-label-primary-foreground', p.background);
  set('--dsw-alias-label-primary-inverted', p.background);
  set('--dsw-alias-label-secondary', p.textMuted);
  set('--dsw-alias-label-tertiary', mix(p.textMuted, p.background, 85));
  set('--dsw-alias-label-dimmed', mix(p.textMuted, p.background, 60));
  set('--dsw-alias-label-caption', p.textMuted);
  set('--dsw-alias-label-on-color', contrast('#ffffff', p.primary) >= 3 ? '#ffffff' : p.text);
  set('--dsw-alias-label-shimmer', alpha(p.text, 30));
  set('--dsw-alias-label-deep-diving', p.primary);
  set('--dsw-alias-label-deep-diving-shimmer', alpha(p.primary, 35));
  set('--dsw-alias-menu-icon', p.textMuted);

  // Buttons and controls.
  set('--dsw-alias-button-primary-fill', p.primary);
  set('--dsw-alias-button-primary-hover', mix(p.primary, p.text, 85));
  set('--dsw-alias-button-primary-dimmed', mix(p.backgroundElement, p.primary, 88));
  set('--dsw-alias-button-contrast-fill', p.text);
  set('--dsw-alias-button-elevated-fill', p.backgroundElement);
  set('--dsw-alias-button-floating-fill', p.backgroundElement);
  set('--dsw-alias-button-floating-hover', p.backgroundPanel);
  set('--dsw-alias-button-info-fill', p.info);
  set('--dsw-alias-button-info-hover', mix(p.info, p.text, 85));
  set('--dsw-alias-button-ghost-active-fill', p.backgroundElement);
  set('--dsw-alias-button-ghost-active-hover', p.backgroundPanel);
  set('--dsw-alias-button-ghost-active-border', p.border);
  set('--dsw-alias-switch-thumb', p.background);

  // Cards and settings surfaces.
  set('--dsw-alias-card-fill', p.backgroundElement);
  set('--dsw-alias-card-fill-hover', p.backgroundPanel);
  set('--dsw-alias-card-tile-fill', alpha(p.backgroundElement, 60));
  set('--dsw-alias-settings-card-fill', p.backgroundElement);
  set('--dsw-alias-settings-card-stroke', p.borderSubtle);
  set('--dsw-alias-turn-trigger-bg', p.backgroundElement);
  set('--dsw-alias-turn-trigger-bg-hover', p.backgroundPanel);

  // Sidebar.
  set('--dsw-specific-sidebar-fill', p.backgroundPanel);
  set('--dsw-specific-sidebar-nav-item-active', alpha(p.primary, 12));
  set('--dsw-specific-sidebar-nav-item-active-accent', alpha(p.primary, 20));
  set('--dsw-specific-sidebar-right-flash', p.primary);
  set('--dsw-specific-input-major', p.backgroundElement);
  set('--dsw-specific-login-input', p.backgroundElement);
  set('--dsw-specific-selector', p.backgroundElement);
  set('--dsw-specific-tip', p.backgroundElement);
  set('--dsw-specific-bubble', p.backgroundElement);
  set('--dsw-specific-bubble-highlight', mix(p.backgroundElement, p.primary, 88));
  set('--dsw-specific-file-upload-track', alpha(p.text, 8));
  set('--dsw-specific-guide-hero', p.backgroundPanel);

  // macOS vibrancy: keep the glass warm instead of the built-in blue tint.
  set('--dsw-specific-sidebar-tint', alpha(p.backgroundPanel, 40));
  set('--dsw-specific-sidebar-wash-top', alpha(p.primary, 6));
  set('--dsw-specific-sidebar-wash-top-clear', alpha(p.primary, 0));
  set('--dsw-specific-sidebar-wash-bottom', alpha(p.accent, 6));
  set('--dsw-specific-sidebar-wash-bottom-clear', alpha(p.accent, 0));
  set('--dsw-specific-sidebar-glass-fill', alpha(p.backgroundPanel, 55));
  set('--dsw-specific-sidebar-glass-hover', alpha(p.primary, 10));
  set('--dsw-specific-sidebar-glass-collapsed-fill', 'transparent');
  set('--dsw-specific-sidebar-glass-collapsed-hover', alpha(p.primary, 10));

  // Menus: translucent surface derived from the theme, not the built-in white.
  set('--dsw-menu-surface-fill', alpha(p.backgroundElement, 70));
  set('--dsw-alias-menu-group-header-fill', alpha(p.backgroundElement, 94));
  set('--dsw-specific-menu', alpha(p.backgroundElement, 70));

  // Interaction layers.
  set('--dsw-alias-interactive-bg-hover', alpha(p.text, 7));
  set('--dsw-alias-interactive-bg-active', alpha(p.text, 12));
  set('--dsw-alias-interactive-bg-hover-solid', p.backgroundPanel);
  set('--dsw-alias-interactive-bg-hover-accent', alpha(p.primary, 12));
  set('--dsw-alias-interactive-bg-hover-danger', alpha(p.error, 12));

  // Markdown and code.
  set('--dsw-alias-markdown-code-block', p.backgroundElement);
  set('--dsw-alias-markdown-code-block-banner', p.backgroundPanel);
  set('--dsw-alias-markdown-inline-code', p.backgroundElement);
  set('--dsw-alias-markdown-code-segment-selected', p.background);
  set('--dsw-alias-markdown-code-segment-unselected', p.backgroundElement);
  set('--dsw-alias-markdown-placeholder', p.backgroundElement);
  set('--dsw-alias-markdown-tag', p.backgroundElement);
  set('--dsw-alias-markdown-citation', p.backgroundElement);

  // Diffs.
  set('--dsw-alias-code-diff-added', alpha(p.diffAdded, 18));
  set('--dsw-alias-code-diff-deleted', alpha(p.diffRemoved, 18));
  set('--dsw-alias-file-diff-added-bg', mix(p.background, p.diffAdded, 88));
  set('--dsw-alias-file-diff-added-gutter', mix(p.background, p.diffAdded, 82));
  set('--dsw-alias-file-diff-added-marker', p.diffAdded);
  set('--dsw-alias-file-diff-deleted-bg', mix(p.background, p.diffRemoved, 88));
  set('--dsw-alias-file-diff-deleted-gutter', mix(p.background, p.diffRemoved, 82));
  set('--dsw-alias-file-diff-deleted-marker', p.diffRemoved);

  // Scrollbars.
  set('--dsw-alias-scrollbar-bg-l1', p.borderSubtle);
  set('--dsw-alias-scrollbar-bg-l2', p.borderSubtle);
  set('--dsw-alias-scrollbar-hover-l1', p.border);
  set('--dsw-alias-scrollbar-hover-l2', p.border);

  // Illustrations and onboarding.
  set('--dsw-alias-illustration-background', p.backgroundElement);
  set('--dsw-alias-illustration-backing', p.backgroundPanel);
  set('--dsw-alias-illustration-detail', p.border);
  set('--dsw-alias-illustration-inset', p.backgroundPanel);
  set('--dsw-alias-illustration-shadow', p.backgroundPanel);
  set('--dsw-alias-illustration-surface', p.backgroundElement);
  set('--dsw-alias-onboarding-accent', p.primary);
  set('--dsw-alias-onboarding-card-fill', alpha(p.backgroundElement, 80));
  set('--dsw-alias-onboarding-secondary-fill', p.backgroundElement);
  set('--dsw-alias-onboarding-checkbox-border', alpha(p.text, 20));

  // Syntax highlighting.
  set('--shiki-foreground', p.text);
  set('--shiki-background', p.backgroundElement);
  set('--shiki-token-comment', p.syntaxComment);
  set('--shiki-token-keyword', p.syntaxKeyword);
  set('--shiki-token-function', p.syntaxFunction);
  set('--shiki-token-parameter', p.syntaxVariable);
  set('--shiki-token-string', p.syntaxString);
  set('--shiki-token-string-expression', p.syntaxString);
  set('--shiki-token-constant', p.syntaxNumber);
  set('--shiki-token-punctuation', p.syntaxPunctuation);
  set('--shiki-token-link', p.markdownLink);

  return t;
}

/** Short label for the picker chips. */
const label = id => id.replace(/^scaefy-/, '').replace(/-light$/, '').replace(/-/g, ' ');

const themes = [];
const report = [];
for (const file of files) {
  const id = file.replace(/\.json$/, '');
  const source = JSON.parse(readFileSync(join(SRC, file), 'utf8'));
  const p = palette(source);
  const tokens = tokenize(p);
  themes.push({ id, colorScheme: 'light', tokens });
  report.push({ id, bg: p.background, panel: p.backgroundPanel, element: p.backgroundElement, text: p.text, primary: p.primary, tokens: Object.keys(tokens).length });
}

const chips = themes.map(({ id, tokens }) => ({
  id,
  label: label(id),
  bg: tokens['--dsw-alias-bg-base'],
  panel: tokens['--dsw-specific-sidebar-fill'],
  element: tokens['--dsw-alias-bg-layer-1'],
  ink: tokens['--dsw-alias-label-primary'],
  accent: tokens['--dsw-alias-brand-primary'],
  border: tokens['--dsw-alias-border-l2'],
}));

const out = `window.__ModuleLoader__.load({
  id: '@scaefy/dsh-light-themes',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const THEMES = ${JSON.stringify(themes)};
    const CHIPS = ${JSON.stringify(chips)};
    const STORAGE_KEY = 'scaefy.selectedTheme';

    const read = () => {
      try { return typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    };
    const write = (id) => {
      try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
    };

    /** One selectable theme chip: palette swatch plus name. */
    function Chip({ chip, selected, onSelect }) {
      return h('button', {
        type: 'button',
        'aria-pressed': selected,
        title: chip.id,
        onClick: () => onSelect(chip.id),
        style: {
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px 7px 8px',
          borderRadius: 10, cursor: 'pointer', textAlign: 'left', minWidth: 0,
          background: selected ? 'var(--dsw-alias-interactive-bg-hover-accent)' : 'var(--dsw-alias-card-fill)',
          border: selected
            ? '1.5px solid var(--dsw-alias-border-selected)'
            : '1px solid var(--dsw-alias-card-tile-fill)',
          color: 'var(--dsw-alias-label-primary)',
          font: 'inherit', fontSize: 12, lineHeight: 1.3,
        },
      },
        h('span', {
          'aria-hidden': true,
          style: {
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 6, flex: '0 0 auto',
            background: chip.bg, border: '1px solid ' + chip.border,
            boxShadow: 'inset 0 -7px 0 ' + chip.panel,
          },
        },
          h('span', { style: { width: 7, height: 7, borderRadius: 999, background: chip.accent } }),
        ),
        h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, chip.label),
      );
    }

    /** Settings > General row listing every registered theme. */
    function ScaefyThemePicker({ select }) {
      const [active, setActive] = React.useState(() => {
        try {
          const current = service.theme.getTheme().preference;
          return THEMES.some(t => t.id === current) ? current : read();
        } catch (e) { return read(); }
      });
      React.useEffect(() => {
        const off = service.on('theme/change', (snapshot) => {
          const preference = snapshot.preference;
          setActive(THEMES.some(t => t.id === preference) ? preference : null);
        });
        return () => { off(); };
      }, []);
      const choose = (id) => { setActive(id); select(id); };
      return h('div', {
        style: {
          display: 'flex', flexDirection: 'column', gap: 10,
          padding: '14px 0', borderBottom: '1px solid var(--dsw-alias-border-l1)',
          width: '100%', boxSizing: 'border-box',
        },
      },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('div', { style: { color: 'var(--dsw-alias-label-primary)', fontSize: 13, fontWeight: 500 } }, 'Scaefy theme'),
          h('div', { style: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 12 } },
            'Light palettes ported from the Scaefy OpenCode themes.'),
        ),
        h('div', {
          role: 'group',
          'aria-label': 'Scaefy theme',
          style: {
            display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            maxHeight: 232, overflowY: 'auto', paddingRight: 4,
          },
        }, CHIPS.map((chip) => h(Chip, {
          key: chip.id, chip, selected: active === chip.id, onSelect: choose,
        }))),
      );
    }

    /** Service handle captured in apply, read by the row component. */
    let service;

    return {
      inject: ['theme', 'slots'],
      apply(ctx) {
        service = ctx;
        const disposers = THEMES.map((theme) => ctx.theme.register(theme));
        const ids = THEMES.map((theme) => theme.id);
        const saved = read();
        if (saved !== null && ids.indexOf(saved) !== -1) {
          try { ctx.theme.setTheme(saved); } catch (e) {}
        }
        const select = (id) => {
          try { ctx.theme.setTheme(id); } catch (e) {}
          if (ids.indexOf(id) !== -1) write(id);
        };
        try {
          ctx.slots.inject('settings.general.item', () => ctx.slots.register({
            name: 'settings.general.item', id: 'scaefy-themes', order: 12,
            inject: () => ({ select }),
          }, ScaefyThemePicker));
        } catch (e) {}
        return () => { for (const dispose of disposers) { try { dispose(); } catch (e) {} } };
      },
    };
  },
});
`;

writeFileSync(OUT, out);
console.log('Generated', themes.length, 'themes ->', OUT);
console.log('Tokens per theme:', report.map(r => r.tokens).join(','));
console.log('\nResolved palettes:');
for (const r of report) console.log(` ${r.id.padEnd(28)} bg=${r.bg} panel=${r.panel} el=${r.element} ink=${r.text} accent=${r.primary}`);
