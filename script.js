/**
 * FreshMart — Main Script
 * Single-Page Application Logic
 *
 * Sections:
 *  1. Data — product catalogue & cart state
 *  2. Navigation — section switching
 *  3. Products — rendering & filtering
 *  4. Cart — CRUD operations & localStorage persistence
 *  5. UI Helpers — toast, animations, header scroll
 *  6. Init — bootstrap on DOMContentLoaded
 */

'use strict';

/* ==========================================================
   1. DATA — Product Catalogue
   ========================================================== */

/** @type {Product[]} */
const PRODUCTS = [
  {
    id: 1,
    name: 'Organic Red Apples',
    emoji: '🍎',
    category: 'Fruits',
    price: 3.49,
    unit: 'kg',
    badge: 'organic',
    description: 'Crisp, sweet apples picked fresh from local orchards.',
  },
  {
    id: 2,
    name: 'Fresh Broccoli',
    emoji: '🥦',
    category: 'Vegetables',
    price: 2.29,
    unit: 'head',
    badge: 'organic',
    description: 'Tender green florets packed with vitamins C & K.',
  },
  {
    id: 3,
    name: 'Baby Carrots',
    emoji: '🥕',
    category: 'Vegetables',
    price: 1.79,
    unit: 'bag',
    badge: null,
    description: 'Pre-washed snack-ready baby carrots. Great for dipping.',
  },
  {
    id: 4,
    name: 'Ripe Bananas',
    emoji: '🍌',
    category: 'Fruits',
    price: 1.49,
    unit: 'bunch',
    badge: null,
    description: 'Perfectly ripened Cavendish bananas, rich in potassium.',
  },
  {
    id: 5,
    name: 'Free-Range Eggs',
    emoji: '🥚',
    category: 'Dairy & Eggs',
    price: 4.99,
    unit: '12-pack',
    badge: 'new',
    description: 'Eggs from cage-free, free-range hens. Rich golden yolks.',
  },
  {
    id: 6,
    name: 'Whole Milk',
    emoji: '🥛',
    category: 'Dairy & Eggs',
    price: 2.89,
    unit: '1L',
    badge: null,
    description: 'Creamy full-fat milk from grass-fed cows. Farm fresh.',
  },
  {
    id: 7,
    name: 'Sourdough Bread',
    emoji: '🍞',
    category: 'Bakery',
    price: 5.49,
    unit: 'loaf',
    badge: 'new',
    description: 'Stone-baked with a crunchy crust and chewy crumb.',
  },
  {
    id: 8,
    name: 'Wild Salmon Fillet',
    emoji: '🐟',
    category: 'Meat & Fish',
    price: 12.99,
    unit: '400g',
    badge: 'sale',
    description: 'Fresh Atlantic wild-caught salmon. Rich in omega-3.',
  },
  {
    id: 9,
    name: 'Strawberries',
    emoji: '🍓',
    category: 'Fruits',
    price: 3.99,
    unit: '250g',
    badge: 'sale',
    description: 'Sweet, ruby-red strawberries bursting with flavour.',
  },
  {
    id: 10,
    name: 'Cherry Tomatoes',
    emoji: '🍅',
    category: 'Vegetables',
    price: 2.49,
    unit: 'punnet',
    badge: 'organic',
    description: 'Sun-ripened on the vine for that intense tomato flavour.',
  },
  {
    id: 11,
    name: 'Greek Yogurt',
    emoji: '🫙',
    category: 'Dairy & Eggs',
    price: 3.29,
    unit: '500g',
    badge: null,
    description: 'Thick, creamy yogurt with live cultures. High in protein.',
  },
  {
    id: 12,
    name: 'Blueberries',
    emoji: '🫐',
    category: 'Fruits',
    price: 4.49,
    unit: '150g',
    badge: 'organic',
    description: 'Plump, antioxidant-rich blueberries. Great for smoothies.',
  },
];

/** Valid promo codes { code: discountFraction } */
const PROMO_CODES = {
  FRESH10: 0.10,
  MART20:  0.20,
  SAVE15:  0.15,
};

const DELIVERY_FEE = 2.99; // $ flat rate

/* ==========================================================
   2. STATE
   ========================================================== */

/** @type {{ id: number, qty: number }[]} Cart items array */
let cart = [];

/** Currently applied promo code discount (0–1) */
let activeDiscount = 0;

/** Active category filter */
let activeCategory = 'All';

/** Toast timeout handle */
let toastTimer = null;


/* ==========================================================
   3. NAVIGATION — Section Switching
   ========================================================== */

/**
 * Show a page section and hide all others.
 * Updates active nav link state.
 * @param {'home'|'products'|'cart'} sectionId
 */
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));

  // Show target
  const target = document.getElementById(`section-${sectionId}`);
  if (target) target.classList.remove('hidden');

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.getElementById(`nav-${sectionId}`);
  if (activeLink) activeLink.classList.add('active');

  // Render products if needed
  if (sectionId === 'products') renderProducts();

  // Render cart if needed
  if (sectionId === 'cart') renderCart();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile menu if open
  closeMobileMenu();
}


/* ==========================================================
   4. PRODUCTS — Rendering & Filtering
   ========================================================== */

/**
 * Extract unique categories from the product list and inject filter buttons.
 */
function buildCategoryFilters() {
  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];
  const container   = document.getElementById('category-filters');
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className  = `cat-btn${cat === activeCategory ? ' active' : ''}`;
    btn.textContent = cat;
    btn.setAttribute('aria-pressed', cat === activeCategory ? 'true' : 'false');
    btn.onclick = () => {
      activeCategory = cat;
      // Update active state
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.classList.toggle('active', b.textContent === cat);
        b.setAttribute('aria-pressed', b.textContent === cat ? 'true' : 'false');
      });
      renderProducts();
    };
    container.appendChild(btn);
  });
}

/**
 * Filter products by search input and active category, then render.
 */
function filterProducts() {
  renderProducts();
}

/**
 * Render the products grid based on current search + category filters.
 */
function renderProducts() {
  const grid         = document.getElementById('product-grid');
  const searchTerm   = document.getElementById('search-input').value.trim().toLowerCase();

  const filtered = PRODUCTS.filter(p => {
    const matchCat    = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchTerm
      || p.name.toLowerCase().includes(searchTerm)
      || p.category.toLowerCase().includes(searchTerm)
      || p.description.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different search term or category.</p>
      </div>`;
    return;
  }

  filtered.forEach((product, idx) => {
    const inCart      = cart.some(c => c.id === product.id);
    const card        = document.createElement('div');
    card.className    = 'product-card';
    card.style.animationDelay = `${idx * 0.04}s`;
    card.setAttribute('data-product-id', product.id);

    // Badge HTML
    let badgeHtml = '';
    if (product.badge === 'organic') {
      badgeHtml = `<span class="product-badge badge-organic">Organic</span>`;
    } else if (product.badge === 'sale') {
      badgeHtml = `<span class="product-badge badge-sale">Sale</span>`;
    } else if (product.badge === 'new') {
      badgeHtml = `<span class="product-badge badge-new">New</span>`;
    }

    card.innerHTML = `
      <div class="product-img-wrap">
        ${badgeHtml}
        <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <div class="product-price">
            $${product.price.toFixed(2)}
            <span class="unit">/ ${product.unit}</span>
          </div>
          <button
            class="add-to-cart-btn${inCart ? ' in-cart' : ''}"
            id="add-btn-${product.id}"
            aria-label="${inCart ? 'Added to cart' : 'Add ' + product.name + ' to cart'}"
            onclick="addToCart(${product.id})"
          >
            ${inCart
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add`
            }
          </button>
        </div>
      </div>`;

    grid.appendChild(card);
  });
}


/* ==========================================================
   5. CART — CRUD Operations
   ========================================================== */

/**
 * Add a product to the cart or increment its quantity.
 * @param {number} productId
 */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += 1;
    showToast(`${product.emoji} Added another ${product.name}`);
  } else {
    cart.push({ id: productId, qty: 1 });
    showToast(`${product.emoji} ${product.name} added to cart!`);
  }

  saveCart();
  updateCartCount();

  // Update the button state in the products grid (if visible)
  updateAddButton(productId);
}

/**
 * Remove an item from the cart entirely.
 * @param {number} productId
 */
function removeFromCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  cart = cart.filter(c => c.id !== productId);
  saveCart();
  updateCartCount();
  renderCart();
  updateAddButton(productId);

  if (product) showToast(`🗑️ ${product.name} removed from cart`);
}

/**
 * Update the quantity of a cart item.
 * Removes the item if new quantity is zero.
 * @param {number} productId
 * @param {number} delta — +1 or -1
 */
function updateQuantity(productId, delta) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartCount();
  renderCart();
}

/**
 * Clear all items from the cart after user confirmation.
 */
function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('Are you sure you want to clear your cart?')) return;

  cart = [];
  activeDiscount = 0;
  saveCart();
  updateCartCount();
  renderCart();
  showToast('🧹 Cart cleared');

  // Reset all product buttons
  PRODUCTS.forEach(p => updateAddButton(p.id));
}

/**
 * Render the entire cart section UI.
 */
function renderCart() {
  const emptyMsg    = document.getElementById('empty-cart-msg');
  const cartContent = document.getElementById('cart-content');
  const itemsList   = document.getElementById('cart-items-list');
  const subtitle    = document.getElementById('cart-subtitle');

  if (cart.length === 0) {
    emptyMsg.classList.remove('hidden');
    cartContent.classList.add('hidden');
    subtitle.textContent = '';
    return;
  }

  emptyMsg.classList.add('hidden');
  cartContent.classList.remove('hidden');
  subtitle.textContent = `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`;

  // Render items
  itemsList.innerHTML = '';
  cart.forEach(item => {
    const product   = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;

    const lineTotal = (product.price * item.qty).toFixed(2);
    const div       = document.createElement('div');
    div.className   = 'cart-item';
    div.setAttribute('data-cart-item', item.id);

    div.innerHTML = `
      <div class="cart-item-emoji" aria-hidden="true">${product.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-category">${product.category}</div>
        <div class="cart-item-price-each">$${product.price.toFixed(2)} / ${product.unit}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" aria-label="Decrease quantity" onclick="updateQuantity(${product.id}, -1)">−</button>
        <span class="qty-value" aria-live="polite">${item.qty}</span>
        <button class="qty-btn" aria-label="Increase quantity" onclick="updateQuantity(${product.id}, +1)">+</button>
      </div>
      <div class="cart-item-total">$${lineTotal}</div>
      <button class="remove-btn" aria-label="Remove ${product.name}" onclick="removeFromCart(${product.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>`;

    itemsList.appendChild(div);
  });

  renderOrderSummary();
}

/**
 * Calculate and render the order summary panel.
 */
function renderOrderSummary() {
  const subtotal     = cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  const discount     = subtotal * activeDiscount;
  const total        = subtotal + DELIVERY_FEE - discount;

  document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('summary-delivery').textContent = `$${DELIVERY_FEE.toFixed(2)}`;
  document.getElementById('summary-total').textContent    = `$${total.toFixed(2)}`;

  const discountRow   = document.getElementById('discount-row');
  const discountSpan  = document.getElementById('summary-discount');
  if (activeDiscount > 0) {
    discountRow.classList.remove('hidden');
    discountSpan.textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow.classList.add('hidden');
  }
}

/**
 * Apply a promo code.
 */
function applyPromo() {
  const input = document.getElementById('promo-input');
  const hint  = document.getElementById('promo-hint');
  const code  = input.value.trim().toUpperCase();

  if (!code) {
    hint.textContent  = 'Please enter a promo code.';
    hint.className    = 'promo-hint error';
    return;
  }

  const discount = PROMO_CODES[code];
  if (discount !== undefined) {
    activeDiscount   = discount;
    hint.textContent = `✅ Code applied! You save ${(discount * 100).toFixed(0)}% off your subtotal.`;
    hint.className   = 'promo-hint success';
    renderOrderSummary();
    showToast(`🎉 Promo code "${code}" applied!`);
  } else {
    hint.textContent = '❌ Invalid promo code. Try FRESH10, MART20, or SAVE15.';
    hint.className   = 'promo-hint error';
  }

  input.value = '';
}

/**
 * Simulate checkout — shows a success alert, then clears cart.
 */
function checkout() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const discount = subtotal * activeDiscount;
  const total    = (subtotal + DELIVERY_FEE - discount).toFixed(2);

  setTimeout(() => {
    alert(
      `🎉 Order Placed Successfully!\n\n` +
      `Thank you for shopping with FreshMart!\n` +
      `Your order total: $${total}\n` +
      `Estimated delivery: within 60 minutes.\n\n` +
      `A confirmation email will be sent shortly.`
    );
    // Clear cart after checkout
    cart = [];
    activeDiscount = 0;
    saveCart();
    updateCartCount();
    renderCart();
    showToast('✅ Order placed! Thank you for shopping with FreshMart!');
    PRODUCTS.forEach(p => updateAddButton(p.id));
  }, 100);
}


/* ==========================================================
   6. LOCALSTORAGE PERSISTENCE
   ========================================================== */

/** Save cart array to localStorage. */
function saveCart() {
  try {
    localStorage.setItem('freshmart_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('FreshMart: Could not save cart to localStorage.', e);
  }
}

/** Load cart from localStorage on page load. */
function loadCart() {
  try {
    const stored = localStorage.getItem('freshmart_cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate: only keep items with valid product IDs
      cart = parsed.filter(item =>
        item && typeof item.id === 'number' && typeof item.qty === 'number'
        && item.qty > 0 && PRODUCTS.some(p => p.id === item.id)
      );
    }
  } catch (e) {
    cart = [];
    console.warn('FreshMart: Could not load cart from localStorage.', e);
  }
}


/* ==========================================================
   7. UI HELPERS
   ========================================================== */

/**
 * Update the cart count badge in the header.
 */
function updateCartCount() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const badge    = document.getElementById('cart-count');

  badge.textContent = totalQty;

  // Bump animation
  badge.classList.remove('bump');
  void badge.offsetWidth; // reflow
  badge.classList.add('bump');
}

/**
 * Update a single "Add to Cart" button in the product grid.
 * @param {number} productId
 */
function updateAddButton(productId) {
  const btn = document.getElementById(`add-btn-${productId}`);
  if (!btn) return;

  const inCart = cart.some(c => c.id === productId);
  const product = PRODUCTS.find(p => p.id === productId);

  btn.className = `add-to-cart-btn${inCart ? ' in-cart' : ''}`;
  btn.setAttribute('aria-label', inCart ? 'Added to cart' : `Add ${product?.name} to cart`);
  btn.innerHTML = inCart
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add`;
}

/**
 * Show a brief toast notification.
 * @param {string} message
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/**
 * Toggle the mobile navigation drawer.
 */
function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  nav.classList.toggle('open');
}

/**
 * Close the mobile navigation drawer.
 */
function closeMobileMenu() {
  document.getElementById('mobile-nav').classList.remove('open');
}

/**
 * Add a "scrolled" class to the header when user scrolls down.
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}


/* ==========================================================
   8. INITIALISATION
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Load persisted cart
  loadCart();

  // Build category filter buttons
  buildCategoryFilters();

  // Update header cart badge
  updateCartCount();

  // Attach header scroll effect
  initHeaderScroll();

  // Show Home section by default
  showSection('home');

  console.log(
    '%c🛒 FreshMart loaded!',
    'color:#22c55e; font-size:1.2rem; font-weight:bold;'
  );
});
