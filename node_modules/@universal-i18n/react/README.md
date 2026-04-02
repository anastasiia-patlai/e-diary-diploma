<div align="center">
  <h1>🌐 @universal-i18n/react</h1>
  <p><strong>The ultimate zero-config, zero-dependency auto-translation engine for React, Vite, and Next.js.</strong></p>
  <a href="https://buymeacoffee.com/rohit27.02" target="_blank">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-rohit27.02-yellow?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me A Coffee" />
  </a>
  <br/><br/>
  <a href="https://www.npmjs.com/package/@universal-i18n/react">
    <img src="https://img.shields.io/npm/v/@universal-i18n/react?style=for-the-badge&logo=npm&color=CB3837" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@universal-i18n/react">
    <img src="https://img.shields.io/npm/dm/@universal-i18n/react?style=for-the-badge&logo=npm&color=CB3837" alt="npm downloads" />
  </a>
  <a href="https://github.com/rohit27-02/universal-i18n/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  </a>
  <a href="https://github.com/rohit27-02/universal-i18n">
    <img src="https://img.shields.io/badge/GitHub-rohit27--02-black?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</div>

---

## 🚀 Why this library?

Traditional i18n libraries force you to maintain massive JSON translation files and wrap every string in your codebase with a `t()` function. It's slow, tedious, and bloated.

**@universal-i18n/react** uses a powerful `MutationObserver` engine to translate your DOM on-the-fly. Just write your React code in plain English. The library automatically detects new text nodes, batches them, translates them instantly using the `lingo.dev` API, and swaps them in the DOM with **zero layout shifts**.

- **Zero Dependencies**: Under 10KB. No Webpack/Node pollyfills required.
- **Zero Config**: Drop in the `<AutoTranslateProvider>` and you are done.
- **Framework Agnostic**: Works flawlessly across standard React SPAs, Vite, and Next.js Server Components.
- **Smart Caching**: Translations are cached in `localStorage` for instant navigation.

---

## 📦 Installation

```bash
npm install @universal-i18n/react
```

---

## 🛠️ Usage Guides

### 1. Next.js (App Router) - 🔥 Recommended Secure Setup

In Next.js, you can use the built-in server proxy to hide your API key completely.

**Step A: Get your API Key** (`.env.local`)

Get your API key from [lingo.dev](https://lingo.dev) and add it to your environment variables:

```env
LINGODOTDEV_API_KEY="your_api_key_here"
```

**Step B: Create the API Route** (`app/api/universal-i18n/route.ts`)

```tsx
import { createTranslationRoute } from "@universal-i18n/react/server";

// This securely handles API keys and CORS on the server!
export const POST = createTranslationRoute();
```

**Step C: Wrap your layout** (`app/layout.tsx` or `components/I18nWrapper.tsx`)

```tsx
"use client";
import { AutoTranslateProvider } from "@universal-i18n/react";

export function I18nWrapper({ children }) {
  return (
    <AutoTranslateProvider sourceLocale="en" availableLocales="all">
      {children}
    </AutoTranslateProvider>
  );
}
```

_Note: The provider automatically detects Next.js and routes requests through `/api/universal-i18n`._

### 2. Vite / Standard React (SPA)

If you don't have a Node.js backend to securely proxy requests, you can pass your API key directly to the provider.
_(Warning: This exposes your API key to the browser. For production SPAs, it's recommended to build a small backend proxy and pass its URL to the `apiRoute` prop)._

```tsx
import { AutoTranslateProvider } from "@universal-i18n/react";

function App() {
  return (
    <AutoTranslateProvider
      apiKey={import.meta.env.VITE_LINGO_API_KEY}
      sourceLocale="en"
      availableLocales="all"
    >
      <Navbar />
      <MainContent />
    </AutoTranslateProvider>
  );
}
```

---

## ⚙️ Advanced Customization

### The `useAutoTranslate` Hook

Don't want to use our built-in floating language switcher? You can build your own completely custom dropdown anywhere in your app:

```tsx
import { useAutoTranslate } from "@universal-i18n/react";

function CustomSelector() {
  const { locale, setLocale, availableLocales } = useAutoTranslate();

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      {availableLocales.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

### 🌍 Supported Languages

The `<AutoTranslateProvider>` natively supports the [ISO-639](https://en.wikipedia.org/wiki/ISO_639) standard language codes out-of-the-box. The `availableLocales` prop automatically accepts hundreds of languages.

You can specify an exact array like `availableLocales={["en", "fr", "ja"]}`, or simply pass `"all"` to unlock every language automatically!

### Provider Props Reference

| Prop               | Type       | Default                 | Description                                                                |
| ------------------ | ---------- | ----------------------- | -------------------------------------------------------------------------- |
| `apiKey`           | `string`   | `undefined`             | Your `lingo.dev` API Key (not required if using a Next.js API Route).      |
| `sourceLocale`     | `string`   | `"en"`                  | The language your React components are physically written in.              |
| `availableLocales` | `string[]` | `["en"]`                | Array of language codes allowed.                                           |
| `targetLocale`     | `string`   | `undefined`             | Force a specific target language on load. Defaults to browser settings.    |
| `apiRoute`         | `string`   | `"/api/universal-i18n"` | The endpoint the provider will `POST` translation grids to.                |
| `showSwitcher`     | `boolean`  | `true`                  | Injects the built-in floating action globe button.                         |
| `batchDelayMs`     | `number`   | `150`                   | Throttle time to batch DOM mutations into a single API request.            |
| `skipSelectors`    | `string`   | See note                | CSS selectors that should _never_ be translated (e.g. `code, pre, input`). |

## License

MIT © Lingo.dev
