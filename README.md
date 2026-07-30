# DevToolBox

> Fast, free, privacy-first developer tools that run **entirely in your browser**. No login, no backend, and your data never leaves your device.

[![Free](https://img.shields.io/badge/price-free-2ea44f)](https://tools.ideaflow.top)
[![Open Source](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Privacy-first](https://img.shields.io/badge/privacy-client--side-success)](https://tools.ideaflow.top/privacy)
[![Languages](https://img.shields.io/badge/languages-en%20%7C%20zh--CN%20%7C%20zh--TW-orange)](https://tools.ideaflow.top)

🌐 **Live site:** https://tools.ideaflow.top
🐙 **Source:** https://github.com/YunyuVv/web-tools

---

## Why DevToolBox?

Most "online tool" sites send your text, payloads, or secrets to a server you don't control. DevToolBox is different:

- **🔒 100% client-side.** Every tool runs in your browser with JavaScript. Nothing is uploaded, logged, or stored.
- **⚡ Instant & offline-friendly.** No server round-trips — paste and get results immediately.
- **🚫 No account, no paywall.** Free to use, ad-supported (no subscription, no sign-up).
- **🌍 Truly multilingual.** Full English / 简体中文 / 繁體中文 UI with proper `hreflang` SEO.
- **🌗 Light & dark mode.** Follows your system preference.
- **📦 Open source.** Audit the code, self-host it, or contribute a tool.

---

## Tools

23 tools across 9 categories. All free, all local.

**JSON**
- [JSON Formatter](https://tools.ideaflow.top/tools/json-formatter/) — pretty-print, validate, and collapse JSON
- [JSON Inspector](https://tools.ideaflow.top/tools/json-inspector/) — explore large JSON as a tree
- [JSON to CSV](https://tools.ideaflow.top/tools/json-to-csv/) — flatten JSON into a table

**Encoding**
- [Base64](https://tools.ideaflow.top/tools/base64/) — encode / decode text & files
- [URL Encode](https://tools.ideaflow.top/tools/url-encode/) — percent-encoding for URLs
- [Args Formatter](https://tools.ideaflow.top/tools/args-format/) — format command-line arguments
- [HTML Entities](https://tools.ideaflow.top/tools/html-entities/) — encode / decode HTML entities

**Crypto**
- [Hash Generator](https://tools.ideaflow.top/tools/hash-generator/) — MD5 / SHA-1 / SHA-256 / SHA-512
- [UUID Generator](https://tools.ideaflow.top/tools/uuid-generator/) — v4 (and bulk) UUIDs
- [Password Generator](https://tools.ideaflow.top/tools/password-generator/) — strong, configurable passwords

**Text**
- [Regex Tester](https://tools.ideaflow.top/tools/regex-tester/) — live JS regex testing with flags
- [Lorem Ipsum](https://tools.ideaflow.top/tools/lorem-ipsum/) — generate placeholder text
- [Word Counter](https://tools.ideaflow.top/tools/word-counter/) — count words, chars, lines
- [Markdown Preview](https://tools.ideaflow.top/tools/markdown-preview/) — live Markdown rendering

**Date & Time**
- [Timestamp](https://tools.ideaflow.top/tools/timestamp/) — Unix ↔ human time, now, conversions
- [Cron Parser](https://tools.ideaflow.top/tools/cron-parser/) — explain & preview cron schedules

**CSS**
- [CSS Gradient](https://tools.ideaflow.top/tools/css-gradient/) — build linear/radial gradients
- [Box Shadow](https://tools.ideaflow.top/tools/box-shadow/) — design layered shadows

**Color**
- [Color Converter](https://tools.ideaflow.top/tools/color-converter/) — HEX / RGB / HSL conversions
- [Contrast Checker](https://tools.ideaflow.top/tools/contrast-checker/) — WCAG contrast ratios

**Network**
- [IP Lookup](https://tools.ideaflow.top/tools/ip-lookup/) — your public IP & network info
- [User Agent](https://tools.ideaflow.top/tools/user-agent/) — parse & identify user agents

**Image**
- [Avatar](https://tools.ideaflow.top/tools/avatar/) — generate placeholder avatars

---

## Privacy

DevToolBox has **no backend**. There is no server that receives your input — formatting, hashing, encoding, and generation all happen locally in your browser tab. We cannot see, store, or sell your data because it never leaves your machine. Analytics (when enabled) are privacy-friendly and cookieless.

See the [Privacy Policy](https://tools.ideaflow.top/privacy) for details.

---

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) — fully static export (`output: 'export'`)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Cloudflare Pages](https://pages.cloudflare.com) for zero-config, global, static hosting
- Self-hosted [Geist](https://vercel.com/font) fonts (no external font CDN)

---

## Getting Started

```bash
# install dependencies
npm install

# run the dev server (http://localhost:3000)
npm run dev

# production build → static export in ./out
npm run build
```

The build also regenerates `sitemap.xml`, `robots.txt`, and pings search engines via IndexNow.

---

## Project Structure

```
app/
  (en)/            # default-language routes (no prefix): /, /tools/[slug]
  [locale]/        # prefixed locales: /zh-CN, /zh-TW, /{locale}/tools/[slug]
  layout.tsx       # root layout (pre-hydration scripts, analytics, ads)
components/
  tools/           # one component per tool
  tools/ToolContent.tsx  # single source of truth: slug → tool component
lib/
  tools-registry.ts  # tool metadata (slug, category, icon, enabled)
  i18n/             # en / zh-CN / zh-TW translations
  site.ts           # SITE_URL, JSON-LD, hreflang alternates
```

---

## Contributing

Contributions are welcome! To add a new tool:

1. Add its metadata to `lib/tools-registry.ts` (`slug`, `category`, `i18nKey`, `icon`).
2. Create the UI component under `components/tools/` and register it in `components/tools/ToolContent.tsx`.
3. Add the translated strings to `lib/i18n/en.json`, `lib/i18n/zh-CN.json`, and `lib/i18n/zh-TW.json` (keep the key structure identical across all three).
4. Run `npm run dev` and verify the tool renders in all three languages.

Please open an issue or PR on [GitHub](https://github.com/YunyuVv/web-tools).

---

## License

[MIT](./LICENSE) © DevToolBox contributors.
