# Urbs Data Landing

Landing page for Urbs Data, a data consultancy focused on data warehousing, artificial intelligence, automation, and Business Intelligence.

The site explains how Urbs Data helps companies centralize scattered data, build reliable metrics, automate manual work, and turn information into better decisions.

## Stack

- React
- TanStack Start
- TanStack Router
- TypeScript
- Tailwind CSS
- ParaglideJS for English and Spanish content
- Biome
- Vitest

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm preview  # Preview production build
pnpm test     # Run tests
pnpm check    # Run Biome checks
```

## Content

The landing page lives in:

```text
src/features/landing
```

Main sections include:

- Hero
- Problem section
- Services
- Data flow
- SMB solutions
- Trusted companies
- Contact CTA
- Footer

Translations live in:

```text
src/i18n/messages/es.json
src/i18n/messages/en.json
```

## Build

```bash
pnpm build
```

The production output is generated in `.output`.
