# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Julius, the sole current user, tracking and analyzing his own options trading (calls/puts) to understand his performance and refine his strategy. Auth and multi-account support already exist in the codebase so the product could expand to other traders later, but that is not a current commitment; do not design for a multi-tenant audience yet.

## Product Purpose

ProfitPath is a trading journal and analytics tool for options traders. It exists to give a clear, data-driven view of trading performance and decision-making: logging trades, tagging them by strategy/context, and surfacing win rate, P&L, and balance trends so trading habits can be systematically tracked and improved toward consistent profitability.

## Positioning

Personal tool, not marketed or sold. No competitive positioning against other trade-journal products (e.g. TraderSync, Tradervue) is needed.

## Operating Context

- Used primarily by one person (the developer) to log and review their own options trades (CALL/PUT), across one or more trading accounts.
- Demo mode lets anyone browse sample data read-only without authentication; real edit/delete actions require sign-in.
- Increasingly used on mobile: the user adds the site to their iOS home screen for an app-like feel today (no dedicated native app), and wants the mobile web experience refined to feel more native rather than building a separate mobile app. Treat "mobile web that feels like a native app" as the mobile target, not a native build.
- `apps/mobile` (Expo) and `apps/web` in the repo are untracked, empty scaffolds with no committed source and are not part of the active product.

## Capabilities and Constraints

- Core features: multi-account management, trade CRUD with inline editing, custom tags with color/usage tracking, dashboard analytics (win rate, P&L, balance trend, batch comparisons), trade history table, global date/tag filters, dark/light themes, demo mode, Supabase email/password auth.
- Built on Create React App (react-scripts) with Tailwind CSS, MUI, Recharts, GSAP/Motion, and Supabase (Postgres + auth) as the backend. The real app lives in `app/`.
- Data model is options-focused: trades carry `position_type` (CALL/PUT), entry/exit price and date, quantity (contracts), and computed profit/result.
- Undecided: whether the product ever opens up to other traders.

## Product Principles

- Optimize for the developer's own trading-review workflow first; don't add complexity for a hypothetical wider audience.
- Preserve the options-specific data model and analytics as the core of the product.
- Mobile web should feel like a native app (home-screen install, app-like navigation and feel) rather than requiring a separate native build.
- Keep demo mode read-only and low-friction so the app can be shown off without exposing real account data.
