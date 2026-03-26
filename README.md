# 🛒 FreshMart — Fresh Groceries Delivered Fast

> A responsive, single-page grocery shopping web application built with vanilla HTML, CSS, and JavaScript.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Promo Codes](#promo-codes)
- [Tech Stack](#tech-stack)
- [Browser Support](#browser-support)

---

## Overview

FreshMart is a fully client-side SPA (Single-Page Application) that simulates an online supermarket. Users can browse a product catalogue, filter by category or search term, manage a shopping cart, apply promo discount codes, and simulate a checkout — all without a backend.

Cart data is persisted via `localStorage` so it survives page refreshes.

---

## Features

| Feature | Description |
|---|---|
| 🏠 **Home Page** | Hero banner, feature highlights, and a CTA section |
| 🛍️ **Product Catalogue** | 12 products across 5 categories |
| 🔍 **Search & Filter** | Real-time search + category filter buttons |
| 🛒 **Shopping Cart** | Add, remove, and adjust quantities |
| 💾 **Persistence** | Cart saved to `localStorage` |
| 🏷️ **Promo Codes** | Apply discount codes at checkout |
| 📱 **Responsive Design** | Mobile hamburger menu + adaptive layouts |
| ♿ **Accessibility** | ARIA labels, `aria-live` regions, semantic HTML |
| 🔔 **Toast Notifications** | Non-blocking feedback messages |

---

## Project Structure

```
AnitgProject/
├── index.html      # App shell — markup, sections, header, footer
├── style.css       # Design system, component styles, responsive rules
└── script.js       # All SPA logic — data, navigation, cart, helpers
```

---

## Getting Started

No build tools or dependencies are required. Simply open the project in a browser:

### Option 1 — Open directly

```bash
# Double-click index.html, or open it from your browser:
File → Open File → index.html
```

### Option 2 — Local dev server (recommended)

Using the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension:

1. Right-click `index.html` in the Explorer
2. Select **"Open with Live Server"**
3. The app opens at `http://127.0.0.1:5500`

Or using Node.js `http-server`:

```bash
npx http-server . -p 5500
```

Then visit `http://localhost:5500`.

---

## Usage

1. **Browse** — Click **Products** in the nav or "Shop Now" on the hero.
2. **Filter** — Use the category pills or the search bar to narrow results.
3. **Add to Cart** — Click the green **Add** button on any product card.
4. **View Cart** — Click the cart icon in the header or the **Cart** nav link.
5. **Adjust Quantities** — Use the `−` / `+` buttons on each cart item.
6. **Apply a Promo** — Enter a code in the promo field and click **Apply**.
7. **Checkout** — Click **Proceed to Checkout** to place your simulated order.

---

## Promo Codes

| Code | Discount |
|---|---|
| `FRESH10` | 10% off subtotal |
| `MART20` | 20% off subtotal |
| `SAVE15` | 15% off subtotal |

---

## Tech Stack

| Technology | Role |
|---|---|
| **HTML5** | Semantic structure & accessibility |
| **CSS3** (Vanilla) | Design system with CSS custom properties |
| **JavaScript ES6+** | SPA logic, DOM manipulation, localStorage |
| **Google Fonts — Inter** | Typography |

No frameworks, no bundlers, no dependencies.

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ Fully supported |
| Firefox 88+ | ✅ Fully supported |
| Safari 14+ | ✅ Fully supported |
| Edge 90+ | ✅ Fully supported |

> **Note:** `backdrop-filter` (glassmorphism header) may degrade gracefully on older browsers — the layout remains fully functional.

---

## License

This project is open source and available for personal and educational use.

---

*Made with 💚 for fresh living — © 2026 FreshMart*
