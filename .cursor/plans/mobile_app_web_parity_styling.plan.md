---
name: Mobile App Web Parity Styling
overview: Align the React Native mobile app's styling and structure with the web app's "Monochrome Luxe" design system so both share the same palette, typography, components, and user flows. This includes a shared design-token layer, fonts, restyled screens, navigation parity (Tags + Compare), and a consistent header.
todos: []
isProject: false
---

# Mobile App Styling Parity with Web App

## Current state

**Web app** ([apps/web/src/index.css](apps/web/src/index.css), [apps/web/tailwind.config.js](apps/web/tailwind.config.js)):

- **Design system**: "Monochrome Luxe" — Cormorant Garamond (display) + IBM Plex Mono (body).
- **Light**: Cream backgrounds (`#FAF8F5`, `#F5F2ED`), gold accent (`#9E7C3C`), win/loss (`#6B8E23` / `#A04050`).
- **Dark**: Charcoal (`#0A0A0B`, `#141416`), gold (`#C9A962`), win/loss (`#C9A962` / `#8B4049`).
- **UI**: `card-luxe`, `btn-primary` / `btn-secondary`, `input-luxe`, `label-luxe`, `stat-value` / `stat-label`, badges, modals, gradient surface, subtle noise overlay.
- **Navigation**: Header (logo, date/tag filters, theme, account, sign in/out) + bottom dock: Dashboard, History, New Trade, Tags, Compare.
- **Pages**: Dashboard, History, Tags, Comparison, Trade Detail, Sign In (modal), Settings/Account (modal).

**Mobile app** ([apps/mobile/src/context/ThemeContext.jsx](apps/mobile/src/context/ThemeContext.jsx), screens):

- **Theme**: Generic palette — light `#F9FAFB` / emerald primary `#10B981`; dark `#0A0A0B` / `#111113`. No gold, no Cormorant/IBM Plex.
- **UI**: StyleSheet-based; cards, buttons, inputs use `themeColors.surface` / `themeColors.primary` (emerald). No shared design tokens.
- **Navigation**: 4 tabs — Dashboard, Add Trade, History, Settings. No Tags or Compare. No global header with logo/filters.
- **Missing vs web**: Tags management screen, Batch Comparison screen; header with ProfitPath logo, date/tag filters, account selector, theme toggle.

---

## Approach

1. **Design tokens (single source of truth)**
  Add a mobile theme/tokens module that mirrors the web’s CSS variables so every screen and component uses the same palette and spacing.
2. **Typography**
  Load Cormorant Garamond and IBM Plex Mono in Expo (e.g. `expo-font` + Google Fonts) and use them for display and body/mono consistently with the web.
3. **ThemeContext**
  Replace the current `colors.light` / `colors.dark` in [ThemeContext.jsx](apps/mobile/src/context/ThemeContext.jsx) with the Monochrome Luxe palette (bg-primary, surface, card, border, text-primary/secondary/muted, gold, win, loss, shadows). Keep existing theme persistence and `isDark` API.
4. **Reusable UI primitives**
  Introduce small building blocks (or a single `LuxeStyles` / component set) for: card, primary/secondary button, text input, label, stat value/label, win/loss badge, modal container. Use design tokens and loaded fonts so all screens can share one look with the web.
5. **Screen-by-screen restyle**
  Apply tokens + fonts + primitives to: Dashboard, Trade History, Add Trade, Trade Detail, Sign In, Sign Up, Settings, and all modals (Date, Tag, Account). Charts: use gold for primary series and web win/loss colors.
6. **Navigation and feature parity**
  Match web structure: 5 main tabs — Dashboard, History, New Trade, Tags, Compare. Add Tags screen and Batch Comparison screen. Move Settings/Account into a header or overflow menu (or keep as a 6th tab if you prefer). Add a persistent header (or top bar) with “ProfitPath” logo, optional date/tag filter entry points, theme toggle, and account selector so flows match the web.
7. **Icons**
  Replace emoji tab icons with vector icons (e.g. `@expo/vector-icons` or a lucide-react-native equivalent) to align with web’s lucide usage where possible.

---

## Implementation outline

### 1. Design tokens and theme

- **New file** (e.g. `apps/mobile/src/theme/tokens.js` or `theme/colors.js`):  
Export `LUXE_LIGHT` and `LUXE_DARK` objects with keys matching web: `bgPrimary`, `bgSurface`, `bgCard`, `border`, `borderSubtle`, `textPrimary`, `textSecondary`, `textMuted`, `accentGold`, `win`, `winBg`, `loss`, `lossBg`, `shadowSm`, `shadowMd`, `fontDisplay`, `fontMono`, `fontBody`, spacing units. Values must match [index.css](apps/web/src/index.css) (`:root` and `.dark`).
- **ThemeContext**:  
Swap `colors.light` / `colors.dark` to use these tokens. Export `colors` from the same tokens so existing `themeColors.surface` etc. call sites can be updated to semantic names (e.g. `colors.bgCard`, `colors.accentGold`) and keep one place for light/dark.

### 2. Fonts

- **Expo**:  
Use `expo-font` (and optionally `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/ibm-plex-mono`) or load from assets. In [App.js](apps/mobile/App.js) (or a layout wrapper), load fonts before rendering; show a minimal splash/loading until ready.
- **Usage**:  
Set `fontFamily` on headings to Cormorant Garamond and on body/inputs/labels to IBM Plex Mono in StyleSheet or shared LuxeStyles so all screens inherit.

### 3. Shared Luxe UI (cards, buttons, inputs, badges)

- **New file(s)** (e.g. `apps/mobile/src/components/ui/LuxeCard.jsx`, `LuxeButton.jsx`, `LuxeInput.jsx`, or a single `LuxeStyles.js` with exported StyleSheet factories):  
Implement:
  - **Card**: bgCard, border, borderRadius 12, optional gold top line on press/focus.
  - **Primary button**: gold gradient (or solid gold), dark text, uppercase mono, padding, borderRadius 8.
  - **Secondary button**: transparent, border, mono; on press border/text gold, subtle winBg tint.
  - **Input**: bgSurface, border, borderRadius 8, mono, focus border gold + subtle glow (shadow).
  - **Label**: mono, small, uppercase, letterSpacing, textSecondary.
  - **Stat value**: display font, large; **stat label**: mono, tiny, uppercase, muted.
  - **Badge win/loss**: winBg/win and lossBg/loss, mono, small, uppercase, rounded.
- Use tokens and loaded font families everywhere so one change keeps web and mobile in sync visually.

### 4. Screens and modals

- **DashboardScreen**:  
Use Luxe cards for metrics (Current Balance, Net Profit, Win Rate, Total Trades, Avg W/L). Page title: display font; subtitle: mono muted. Charts: gold for balance line, win/loss colors for pie/bar. Filter row: secondary-style buttons; container background gradient surface.
- **TradeHistoryScreen**:  
List items as Luxe cards or bordered rows; win/loss badges; mono for dates/values; gold accent for active state. Match web table-like hierarchy (symbol, date, type, P&amp;L, result).
- **AddTradeScreen**:  
Form wrapped in Luxe card(s); LuxeInput + Luxe labels; OptionButton for type/result use win/loss/gold from tokens. Submit = primary button; Cancel = secondary.
- **TradeDetailScreen**:  
Same card/labels/stat value/badges; edit/delete buttons primary/secondary style.
- **SignInScreen / SignUpScreen**:  
Logo “ProfitPath” in display font with “Path” in gold; tagline mono muted. Form: LuxeInput, Luxe labels, primary button. Link color gold. Match web SignInForm layout and spacing feel.
- **SettingsScreen**:  
Sections and rows with Luxe card/border styling; theme toggle and account selector matching web header behavior.
- **Modals** (DateFilter, TagFilter, AccountSelector):  
Overlay + content container using modal-overlay/modal-content equivalents (backdrop, bgCard, border, shadow). Title: display font; list/controls use mono and tokens.

### 5. Navigation and header

- **Tabs**:  
Five tabs: Dashboard, History, New Trade, Tags, Compare. Replace emoji with vector icons. Active tab: gold background/border (match web dock active state). Tab bar background/blur and border to mirror web dock.
- **Header**:  
Add a shared header component (or per-screen header) with: “ProfitPath” (display + gold “Path”), optional date and tag filter triggers, theme toggle, account selector, sign in/out. Use tokens and Luxe button styles so it feels like the web header.
- **New screens**:  
  - **TagsScreen**: List/create/edit/delete tags; TagCard-style items; use tag management from shared or existing TagFilterContext and add create/edit/delete (align with [TagsManagementView](apps/web/src/components/views/TagsManagementView.jsx)).
  - **ComparisonScreen**: Batch comparison view (align with [TradeBatchComparisonView](apps/web/src/components/views/TradeBatchComparisonView.jsx)); same chart and metric styling as web (gold, win/loss, Luxe cards).

### 6. Global shell and charts

- **App shell**:  
Wrap main content in a container that uses `bgPrimary` and optional gradient surface (same as web). If feasible, add a very subtle noise texture (e.g. semi-transparent overlay) for parity; otherwise skip to avoid perf issues.
- **Charts**:  
In Dashboard and Comparison, pass token colors into react-native-gifted-charts: line/area gold; win/loss for pie and bar segments; axis/labels textMuted; grid border.

---

## File and dependency impact


| Area           | Files to add                                                                                               | Files to change                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Tokens & theme | `src/theme/tokens.js` (or equivalent)                                                                      | `src/context/ThemeContext.jsx`                                                   |
| Fonts          | (optional) `src/theme/fonts.js`                                                                            | `App.js`, `app.config.js` if needed for font assets                              |
| Luxe UI        | `src/components/ui/LuxeCard.jsx`, `LuxeButton.jsx`, `LuxeInput.jsx`, etc. (or one LuxeStyles + primitives) | —                                                                                |
| Screens        | `src/screens/TagsScreen.jsx`, `src/screens/ComparisonScreen.jsx`                                           | All existing screens + modals                                                    |
| Navigation     | `src/components/Header.jsx` (or shared header)                                                             | `MainNavigator.jsx`, `RootNavigator.jsx` if loading screen uses new fonts/tokens |
| Package        | —                                                                                                          | `package.json` (expo-font, optionally @expo-google-fonts/* or icon lib)          |


---

## Order of work

1. Add design tokens and update ThemeContext to Monochrome Luxe.
2. Add font loading and apply display/mono families.
3. Implement Luxe UI primitives (card, button, input, label, stat, badge, modal).
4. Restyle Dashboard, Trade History, Add Trade, Trade Detail, Sign In, Sign Up, Settings and all modals using tokens + fonts + Luxe components.
5. Add header and 5-tab nav; add Tags and Comparison screens and wire navigation.
6. Polish: charts colors, gradient/noise if used, icon set, and a quick pass so user flows (filter → list → detail → edit) match the web.

---

## Summary

After this, the mobile app will use the same Monochrome Luxe palette, typography, and component language as the web app, with matching navigation (Dashboard, History, New Trade, Tags, Compare), a consistent header, and the same flows and features (including Tags and Batch Comparison). The [frontend-design skill](.cursor/skills/frontend-design/SKILL.md) is applied by enforcing one bold, cohesive direction (luxe, gold, cream/charcoal) and refining details (typography, spacing, borders, shadows) so mobile and web feel like one product.