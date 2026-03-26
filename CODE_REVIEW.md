# 🔍 FreshMart — Code Review

**Reviewer:** Antigravity AI  
**Date:** 2026-03-26  
**Scope:** `index.html`, `style.css`, `script.js`  
**Overall Rating:** ✅ Good — Clean, well-structured, and functional

---

## Summary

FreshMart is a well-crafted vanilla SPA. The code is clearly sectioned, consistently commented, and follows good practices for a no-framework project. The review below covers strengths, minor issues, and actionable suggestions.

---

## ✅ Strengths

### 1. Clear Code Organisation
`script.js` is split into numbered, labeled sections (Data, Navigation, Products, Cart, Helpers, Init) making it immediately navigable.

```js
/* ==========================================================
   1. DATA — Product Catalogue
   ========================================================== */
```

### 2. 'use strict' Enforced
Declared at the top of `script.js`, preventing accidental globals and enabling stricter error catching.

```js
'use strict';
```

### 3. localStorage Validation on Load
The `loadCart()` function defensively validates every parsed item before accepting it back into state — protecting against corrupted or stale storage data.

```js
cart = parsed.filter(item =>
  item && typeof item.id === 'number' && typeof item.qty === 'number'
  && item.qty > 0 && PRODUCTS.some(p => p.id === item.id)
);
```

### 4. Accessibility Basics Well Implemented
- `aria-label` on all interactive buttons
- `aria-live="polite"` on quantity spans and the toast notification
- `role="group"` on the category filter bar
- `aria-pressed` on category filter buttons

### 5. CSS Design Token System
All design values (colors, spacing, radius, typography, shadows, transitions) are defined as CSS custom properties in `:root`, making the theme trivially adjustable.

```css
:root {
  --clr-brand:       hsl(142, 72%, 38%);
  --shadow-brand:    0 8px 24px rgba(34,197,94,.30);
  --transition:      220ms cubic-bezier(.4,0,.2,1);
  /* ... */
}
```

### 6. Passive Scroll Listener
The scroll event listener for the sticky header correctly uses `{ passive: true }`, avoiding janky scroll performance.

```js
window.addEventListener('scroll', onScroll, { passive: true });
```

### 7. Animation Delay on Product Cards
Staggered `animationDelay` values on product cards give a polished, sequential reveal effect without JavaScript animation libraries.

```js
card.style.animationDelay = `${idx * 0.04}s`;
```

---

## ⚠️ Issues & Suggestions

### Issue 1 — `filterProducts()` is a Redundant Wrapper
**File:** `script.js` · **Line:** 239–241  
**Severity:** 🟡 Minor

`filterProducts()` only calls `renderProducts()`. The function adds no logic of its own. The `oninput` handler in the HTML could call `renderProducts()` directly.

```js
// Current
function filterProducts() {
  renderProducts();
}
```

**Suggestion:** Remove `filterProducts` and update the HTML attribute:

```html
<!-- Before -->
<input oninput="filterProducts()" ... />

<!-- After -->
<input oninput="renderProducts()" ... />
```

---

### Issue 2 — `checkout()` Duplicates the Subtotal Calculation
**File:** `script.js` · **Lines:** 522–527  
**Severity:** 🟡 Minor

The subtotal + total calculation inside `checkout()` is identical to the one in `renderOrderSummary()`. This is a DRY (Don't Repeat Yourself) violation.

```js
// Repeated in both checkout() and renderOrderSummary()
const subtotal = cart.reduce((sum, item) => {
  const p = PRODUCTS.find(pr => pr.id === item.id);
  return sum + (p ? p.price * item.qty : 0);
}, 0);
```

**Suggestion:** Extract a helper function:

```js
function calcTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const discount = subtotal * activeDiscount;
  const total    = subtotal + DELIVERY_FEE - discount;
  return { subtotal, discount, total };
}
```

---

### Issue 3 — `confirm()` and `alert()` Block the UI Thread
**File:** `script.js` · **Lines:** 391, 530  
**Severity:** 🟠 Moderate

Native `confirm()` (in `clearCart`) and `alert()` (in `checkout`) block the browser's main thread and cannot be styled. They look out of place in a polished UI.

**Suggestion:** Replace with a custom modal or an inline confirmation pattern. For example, replace the clear-cart confirm with a two-step button state:

```js
// Instead of confirm(), show a "Are you sure? [Yes] [Cancel]" inline UI
```

---

### Issue 4 — Inline `onclick` Handlers in HTML
**File:** `index.html` · **Lines:** 21, 28–30, 34, 44, etc.  
**Severity:** 🟡 Minor

Using `onclick="..."` directly in HTML mixes concerns and makes it harder to write tests or attach multiple listeners.

```html
<!-- Current -->
<button onclick="showSection('cart')">Cart</button>
```

**Suggestion:** Attach listeners in `script.js` using `addEventListener`, keeping HTML purely structural:

```js
document.getElementById('nav-cart').addEventListener('click', (e) => {
  e.preventDefault();
  showSection('cart');
});
```

---

### Issue 5 — No Empty-State Guard in `renderOrderSummary`
**File:** `script.js` · **Line:** 464  
**Severity:** 🟢 Very Minor

If `renderOrderSummary()` were ever called with an empty cart (e.g., from a future code path), prices would display as `$0.00` with the delivery fee still showing. An early return would be safer:

```js
function renderOrderSummary() {
  if (cart.length === 0) return; // Guard
  // ...
}
```

---

### Issue 6 — CSS `clamp()` Used Only Once
**File:** `style.css` · **Line:** 318  
**Severity:** 🟢 Suggestion

`clamp()` is used on the hero title for fluid sizing, which is excellent. Consider applying the same technique to `section-title` and other large headings to keep typography fluid across all viewport sizes.

```css
/* Current: only hero uses clamp */
.hero-title { font-size: clamp(2.2rem, 5vw, var(--fz-4xl)); }

/* Suggestion: apply to other headings */
.section-title { font-size: clamp(1.8rem, 4vw, var(--fz-3xl)); }
```

---

## 📊 Summary Table

| # | File | Issue | Severity |
|---|---|---|---|
| 1 | `script.js` | `filterProducts` is a redundant wrapper | 🟡 Minor |
| 2 | `script.js` | Subtotal logic duplicated in `checkout()` | 🟡 Minor |
| 3 | `script.js` | `confirm()` / `alert()` block UI thread | 🟠 Moderate |
| 4 | `index.html` | Inline `onclick` attributes mix concerns | 🟡 Minor |
| 5 | `script.js` | No guard in `renderOrderSummary` | 🟢 Very Minor |
| 6 | `style.css` | `clamp()` not used consistently | 🟢 Suggestion |

---

## 🏁 Conclusion

The codebase is clean, well-documented, and demonstrates solid fundamentals — proper strict mode, localStorage safety, good CSS architecture, and accessibility awareness. The issues found are mostly minor refinements. The most impactful change would be replacing the native `confirm()`/`alert()` dialogs with a custom modal for a fully polished user experience.

> **Recommended next step:** Address Issue 3 (custom modal for confirm/alert) for the biggest UX improvement.
