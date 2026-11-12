import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = '/Users/fatihtoprak/Sites/opencode-light-themes/themes';
const OUT = '/Users/fatihtoprak/Developer/dsh-scaefy-light-themes/client.js';

const files = readdirSync(SRC).filter(f => f.endsWith('.json')).sort();

// Map an opencode theme JSON to DSH alias-token overrides.
function mapTheme(t) {
  const d = t.defs;
  const tok = {};
  const set = (name, val) => { if (val) tok[name] = val; };
  // core surfaces
  set('--dsw-alias-bg-base', d.bg);
  set('--dsw-alias-bg-layer-1', d.bgPanel);
  set('--dsw-alias-bg-layer-2', d.bgPanel);
  set('--dsw-alias-bg-layer-3', d.bgElement);
  set('--dsw-alias-bg-overlay', d.bgPanel);
  set('--dsw-alias-bg-module-platform', d.bgElement);
  set('--dsw-alias-bg-multi-select', d.bgElement);
  set('--dsw-alias-bg-skeleton', d.borderSubtle);
  // borders
  set('--dsw-alias-border-l1', d.borderSubtle);
  set('--dsw-alias-border-l2', d.border);
  set('--dsw-alias-border-l2-darkmode-thin', d.border);
  set('--dsw-alias-border-l3', d.border);
  set('--dsw-alias-border-l4', d.border);
  set('--dsw-alias-border-selected', d.borderActive);
  set('--dsw-alias-border-inverted', d.border);
  // brand / accent
  set('--dsw-alias-brand-primary', d.primary);
  set('--dsw-alias-brand-primary-invert', d.bg);
  set('--dsw-alias-brand-text', d.primary);
  set('--dsw-alias-link', d.accent);
  set('--dsw-alias-state-business-primary', d.primary);
  set('--dsw-alias-state-business-tertiary', d.bgElement);
  // labels
  set('--dsw-alias-label-primary', d.text);
  set('--dsw-alias-label-primary-bluish', d.text);
  set('--dsw-alias-label-secondary', d.textMuted);
  set('--dsw-alias-label-tertiary', d.textMuted);
  set('--dsw-alias-label-dimmed', d.textMuted);
  set('--dsw-alias-label-caption', d.textMuted);
  set('--dsw-alias-label-on-color', d.bg);
  // state colors
  set('--dsw-alias-state-error-primary', d.error);
  set('--dsw-alias-state-error-secondary', d.error);
  set('--dsw-alias-state-success-primary', d.success);
  set('--dsw-alias-state-success-secondary', d.success);
  set('--dsw-alias-state-warn-primary', d.warning);
  set('--dsw-alias-state-warn-secondary', d.warning);
  set('--dsw-alias-state-warn-label', d.warning);
  set('--dsw-alias-state-idle-primary', d.textMuted);
  // buttons
  set('--dsw-alias-button-primary-fill', d.primary);
  set('--dsw-alias-button-primary-hover', d.primary);
  set('--dsw-alias-button-info-fill', d.info);
  set('--dsw-alias-button-info-hover', d.info);
  // cards / surfaces
  set('--dsw-alias-card-fill', d.bgPanel);
  set('--dsw-alias-card-fill-hover', d.bgElement);
  set('--dsw-alias-card-tile-fill', d.bgElement);
  set('--dsw-alias-settings-card-fill', d.bgPanel);
  set('--dsw-alias-settings-card-stroke', d.border);
  // markdown
  set('--dsw-alias-markdown-code-block', d.bgPanel);
  set('--dsw-alias-markdown-code-block-banner', d.bgElement);
  set('--dsw-alias-markdown-inline-code', d.bgElement);
  set('--dsw-alias-markdown-code-segment-selected', d.bg);
  set('--dsw-alias-markdown-code-segment-unselected', d.bgPanel);
  set('--dsw-alias-markdown-placeholder', d.bgElement);
  set('--dsw-alias-markdown-tag', d.bgElement);
  set('--dsw-alias-markdown-citation', d.bgElement);
  // sidebar
  set('--dsw-specific-sidebar-fill', d.bgPanel);
  set('--dsw-specific-sidebar-nav-item-active', d.bgElement);
  set('--dsw-specific-sidebar-nav-item-active-accent', d.primary);
  set('--dsw-specific-input-major', d.bg);
  set('--dsw-specific-login-input', d.bgElement);
  set('--dsw-specific-selector', d.bgElement);
  set('--dsw-specific-tip', d.bgElement);
  set('--dsw-specific-bubble', d.bgPanel);
  set('--dsw-specific-bubble-highlight', d.bgElement);
  set('--dsw-specific-file-upload-track', d.borderSubtle);
  set('--dsw-specific-guide-hero', d.textMuted);
  set('--dsw-specific-sidebar-right-flash', d.primary);
  // scrollbar
  set('--dsw-alias-scrollbar-bg-l1', d.borderSubtle);
  set('--dsw-alias-scrollbar-bg-l2', d.borderSubtle);
  set('--dsw-alias-scrollbar-hover-l1', d.border);
  set('--dsw-alias-scrollbar-hover-l2', d.border);
  // interactive
  set('--dsw-alias-interactive-bg-hover', d.bgElement);
  set('--dsw-alias-interactive-bg-hover-solid', d.bgElement);
  set('--dsw-alias-interactive-bg-hover-accent', d.primary);
  set('--dsw-alias-interactive-bg-hover-danger', d.error);
  set('--dsw-alias-interactive-bg-active', d.bgElement);
  // menu icon
  set('--dsw-alias-menu-icon', d.textMuted);
  // code diff
  set('--dsw-alias-code-diff-added', d.diffAdded);
  set('--dsw-alias-code-diff-deleted', d.diffRemoved);
  set('--dsw-alias-file-diff-added-bg', d.diffAddedBg || d.bgPanel);
  set('--dsw-alias-file-diff-added-gutter', d.diffAddedBg || d.bgPanel);
  set('--dsw-alias-file-diff-added-marker', d.diffAdded);
  set('--dsw-alias-file-diff-deleted-bg', d.diffRemovedBg || d.bgPanel);
  set('--dsw-alias-file-diff-deleted-gutter', d.diffRemovedBg || d.bgPanel);
  set('--dsw-alias-file-diff-deleted-marker', d.diffRemoved);
  // turns / trajectory
  set('--dsw-alias-turn-trigger-bg', d.bgPanel);
  set('--dsw-alias-turn-trigger-bg-hover', d.bgElement);
  set('--dsw-alias-trajectory-accent', d.primary);
  // charts
  set('--dsw-alias-chart-messages', d.primary);
  set('--dsw-alias-chart-system', d.textMuted);
  set('--dsw-alias-chart-tools', d.accent);
  // onboarding
  set('--dsw-alias-onboarding-accent', d.primary);
  // shiki syntax tokens
  set('--shiki-foreground', d.text);
  set('--shiki-background', d.bgPanel);
  set('--shiki-token-comment', d.syntaxComment);
  set('--shiki-token-keyword', d.syntaxKeyword);
  set('--shiki-token-function', d.syntaxFunction);
  set('--shiki-token-parameter', d.syntaxVariable);
  set('--shiki-token-string', d.syntaxString);
  set('--shiki-token-constant', d.syntaxNumber);
  set('--shiki-token-punctuation', d.syntaxPunctuation);
  set('--shiki-token-link', d.syntaxFunction);
  return tok;
}

const defs = [];
for (const f of files) {
  const t = JSON.parse(readFileSync(join(SRC, f), 'utf8'));
  const id = f.replace(/\.json$/, '');
  const tokens = mapTheme(t);
  defs.push({ id, colorScheme: 'light', tokens });
}

// Build client.js
const lines = [];
lines.push('window.__ModuleLoader__.load({');
lines.push(`  id: '@scaefy/dsh-light-themes',`);
lines.push(`  factory(require) {`);
lines.push(`    const React = require('react');`);
lines.push(`    return {`);
lines.push(`      inject: ['theme', 'slots'],`);
lines.push(`      apply(ctx) {`);
lines.push(`        const disposers = [];`);
lines.push(`        const themeIds = [];`);
for (const def of defs) {
  lines.push(`        disposers.push(ctx.theme.register(${JSON.stringify(def)}));`);
  lines.push(`        themeIds.push(${JSON.stringify(def.id)});`);
}
lines.push(`        console.log('[scaefy] apply: registered', themeIds.length, 'themes');`);
lines.push(`        // Restore the last selected theme (third-party themes are not persisted by DSH itself).`);
lines.push(`        try {`);
lines.push(`          const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem('scaefy.selectedTheme') : null;`);
lines.push(`          if (saved && themeIds.indexOf(saved) !== -1) { try { ctx.theme.setTheme(saved); console.log('[scaefy] restored', saved); } catch (e) { console.error('[scaefy] restore failed', e); } }`);
lines.push(`        } catch (e) { console.error('[scaefy] restore error', e); }`);
lines.push(`        // Best-effort settings row so users can pick a theme; never block theme registration.`);
lines.push(`        try {`);
lines.push(`          const Picker = function ScaefyThemePicker() {`);
lines.push(`            const [pref, setPref] = React.useState(() => ctx.theme.getTheme().preference);`);
lines.push(`            React.useEffect(() => {`);
lines.push(`              const off = ctx.on('theme/change', (snap) => setPref(snap.preference));`);
lines.push(`              return () => { off(); };`);
lines.push(`            }, []);`);
lines.push(`            return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },`);
lines.push(`              React.createElement('span', null, 'Scaefy theme'),`);
lines.push(`              React.createElement('select', { value: pref, onChange: (e) => { const v = e.target.value; console.log('[scaefy] select ->', v); try { ctx.theme.setTheme(v); setPref(v); } catch (err) { console.error('[scaefy] setTheme failed', err); } try { if (typeof localStorage !== 'undefined') localStorage.setItem('scaefy.selectedTheme', v); } catch (err) {} } },`);
lines.push(`                themeIds.map((id) => React.createElement('option', { key: id, value: id }, id))`);
lines.push(`              )`);
lines.push(`            );`);
lines.push(`          };`);
lines.push(`          const row = ctx.slots.inject('settings.general.item', () => ctx.slots.register({ name: 'settings.general.item', id: 'scaefy-theme-picker', order: 12 }, Picker));`);
lines.push(`          if (typeof row === 'function') disposers.push(row);`);
lines.push(`        } catch (e) { /* ignore: themes still registered */ }`);
lines.push(`        return () => { for (const d of disposers) { try { d(); } catch (e) {} } };`);
lines.push(`      },`);
lines.push(`    };`);
lines.push(`  },`);
lines.push('});');
lines.push('');

writeFileSync(OUT, lines.join('\n'));
console.log('Generated', defs.length, 'themes ->', OUT);
console.log('Size:', readFileSync(OUT).length);
