// 3AE Gia Dung Thong Minh - Universal Store & Product Interaction Engine
// Version 6.0 - Robust Button & Checkout Integration

(function() {
  const globalScope = typeof window !== 'undefined' ? window : this;

  // 1. Initial State & Helper Functions
  const DEFAULT_PRODUCT_ID = "noi-da-nang-gaabor-ec30t01a";

  function getQueryParam(name) {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function formatVND(amount) {
    if (typeof amount !== 'number') amount = parseInt(amount) || 0;
    return amount.toLocaleString('vi-VN') + '₫';
  }

  function findProduct(idOrSlug) {
    const db = globalScope.PRODUCTS_DB || (typeof PRODUCTS_DB !== 'undefined' ? PRODUCTS_DB : []);
    if (!db || !db.length) return null;
    if (!idOrSlug) return db[8] || db[0];
    const query = idOrSlug.toString().toLowerCase().trim();

    // Exact match by id or slug
    let found = db.find(p => p.id === query || p.slug === query);
    if (found) return found;

    // Exact keyword / model matching
    const models = [
      { key: "gws-m02a", id: "can-dien-tu-gaabor" },
      { key: "cân điện tử", id: "can-dien-tu-gaabor" },
      { key: "fp03t", id: "may-xay-gaabor-fp03t" },
      { key: "máy xay cầm tay", id: "may-xay-gaabor-fp03t" },
      { key: "ec-15m01a", id: "noi-da-nang-gaabor-ec15m01a" },
      { key: "jm-m01a", id: "may-xay-gaabor-jm-m01a" },
      { key: "ec-20m01a", id: "noi-da-nang-gaabor-ec20m01a" },
      { key: "ek-20m01a", id: "am-sieu-toc-gaabor-ek20m01a" },
      { key: "ấm siêu tốc", id: "am-sieu-toc-gaabor-ek20m01a" },
      { key: "gfd-n400a02", id: "quat-dung-gaabor-gfd-n400a02" },
      { key: "quạt", id: "quat-dung-gaabor-gfd-n400a02" },
      { key: "cw-18m01a", id: "may-hut-bui-gaabor-cw-18m01a" },
      { key: "hút bụi", id: "may-hut-bui-gaabor-cw-18m01a" },
      { key: "ec-30t01a", id: "noi-da-nang-gaabor-ec30t01a" },
      { key: "nồi lẩu", id: "noi-da-nang-gaabor-ec30t01a" },
      { key: "nồi chiên", id: "noi-da-nang-gaabor-ec30t01a" },
      { key: "mslovelux", id: "may-nau-sua-hat-masuto" },
      { key: "sữa hạt", id: "may-nau-sua-hat-masuto" },
      { key: "cable kit", id: "bo-cap-mophie-kit" },
      { key: "universal", id: "hub-sac-mophie-universal" },
      { key: "pac4000bk", id: "bom-dien-energizer-pac4000bk" },
      { key: "bơm hơi", id: "bom-dien-energizer-pac4000bk" },
      { key: "mfi", id: "cap-lightning-mophie-1m" },
      { key: "lightning", id: "cap-lightning-mophie-1m" },
      { key: "pd100x", id: "micro-maono-rgb-pd100x" },
      { key: "bts121bk", id: "loa-di-dong-bts121bk" },
      { key: "loa", id: "loa-di-dong-bts121bk" },
      { key: "pd200x", id: "micro-maono-pd200x" },
      { key: "micro", id: "micro-maono-pd200x" },
      { key: "xlr", id: "cap-maono-xlr-18m" },
      { key: "datic", id: "cong-tac-hunonic-datic" },
      { key: "2 nút", id: "cong-tac-2-nut-hunonic" },
      { key: "chống giật", id: "cong-tac-chong-giat-hunonic" },
      { key: "cửa cuốn", id: "cong-tac-cua-cuon-hunonic" },
      { key: "hunonic", id: "cong-tac-hunonic-datic" },
      { key: "gaabor", id: "noi-da-nang-gaabor-ec30t01a" }
    ];

    for (const m of models) {
      if (query.includes(m.key)) {
        const p = db.find(prod => prod.id === m.id);
        if (p) return p;
      }
    }

    return db.find(p => p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase())) || db[8];
  }

  // Toast Helper
  function showToast(message, type = 'success') {
    if (typeof document === 'undefined') return;
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-20 right-6 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-2xl text-sm font-medium border border-outline-variant/30 transform transition-all duration-300 translate-y-[-10px] opacity-0';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-primary-container text-[20px]">${type === 'success' ? 'check_circle' : 'info'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-[-10px]', 'opacity-0');
    });
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-[-10px]');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // 2. Cart State Management
  function getCart() {
    try {
      const data = localStorage.getItem('3ae_cart');
      if (data) return JSON.parse(data);
    } catch (e) {}

    const initial = [
      {
        id: "noi-da-nang-gaabor-ec30t01a",
        name: "Nồi Lẩu Điện Gaabor EC-30T01A kèm xửng 3L",
        color: "Trắng Kem Sang Trọng",
        price: 550000,
        oldPrice: 690000,
        qty: 1,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQJPkVYNw3GfXYD2dAo3NOBephEKbraUWTQ2H1FUljO0FsMgape6kuyaT7pNj22bZsVDGfj19PiyI9GbY01Hh0CGqadziPg1nfpMCnTTK_1MnuFMABiGUnbj_ZQKACLtsvRvzXmbvrvrQsrppaVbrznIX-viItYCz3uW78TGmbYJ7MJUuabHrsvUThxV_7fn-ZFfVQCLmLN8RcGq7Hb6zLVO4XgvqDMR51gC9Q6L8"
      },
      {
        id: "am-sieu-toc-gaabor-ek20m01a",
        name: "Ấm Siêu Tốc Gaabor EK-20M01A Thủy Tinh 2.0L",
        color: "Trắng Tinh Khôi",
        price: 350000,
        oldPrice: 440000,
        qty: 1,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUqTaxBYitFAztXOiF2zq6yA9pkVMMQmt7o7Ar2VA5mM4F5CvSaY0DqoU8-rINrroE17QBwTBRVzPhiO1PuYRKPD-YXbhzwLqNb8W_pfd3_wPfy8rBXOXe0sQdkyg8eN_bAIjV8smUwwT4nRejCgPjqDBFDDEQu1wu7Lj0VAc8cscfriVEppHK5OcbNSsqRjNLTKN303HLf59VOcO2uNXEH4Dw-g2YFEMMRUlfhD8"
      }
    ];
    try {
      localStorage.setItem('3ae_cart', JSON.stringify(initial));
    } catch(e) {}
    return initial;
  }

  function saveCart(cart) {
    try {
      localStorage.setItem('3ae_cart', JSON.stringify(cart));
      updateCartUI();
      if (window.location.pathname.includes('gio-hang')) {
        renderCartPage();
      }
    } catch (e) {}
  }

  function addToCart(productId, qty = 1, color = null) {
    const product = findProduct(productId);
    if (!product) return;
    const cart = getCart();
    const selectedColor = color || (product.colors && product.colors[0]) || "Tiêu chuẩn";
    const existingIndex = cart.findIndex(item => item.id === product.id && item.color === selectedColor);

    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        color: selectedColor,
        price: product.price,
        oldPrice: product.originalPrice,
        qty: qty,
        image: product.image
      });
    }

    saveCart(cart);
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
    openQuickCart();
  }

  function updateQuantity(itemRef, delta) {
    const cart = getCart();
    let index = -1;
    if (typeof itemRef === 'number') {
      index = itemRef;
    } else if (typeof itemRef === 'string') {
      index = cart.findIndex(i => i.id === itemRef);
    }
    if (index >= 0 && cart[index]) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart(cart);
      if (window.location.pathname.includes('gio-hang')) {
        renderCartPage();
      }
    }
  }

  function removeFromCart(itemRef) {
    const cart = getCart();
    let index = -1;
    if (typeof itemRef === 'number') {
      index = itemRef;
    } else if (typeof itemRef === 'string') {
      index = cart.findIndex(i => i.id === itemRef);
    }
    if (index >= 0 && cart[index]) {
      const removed = cart.splice(index, 1);
      saveCart(cart);
      showToast(`Đã xóa "${removed[0].name}" khỏi giỏ hàng!`, 'info');
      if (window.location.pathname.includes('gio-hang')) {
        renderCartPage();
      }
    }
  }

  // Quick Cart Modal Helpers
  function openQuickCart() {
    const backdrop = document.getElementById('quick-cart-backdrop');
    if (backdrop) {
      backdrop.style.display = 'flex';
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
      });
    }
  }

  function closeQuickCart() {
    const backdrop = document.getElementById('quick-cart-backdrop');
    if (backdrop) {
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        backdrop.style.display = 'none';
      }, 300);
    }
  }

  // 3. UI Update for Badges and Drawer
  function updateCartUI() {
    if (typeof document === 'undefined') return;
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update badges
    document.querySelectorAll('[data-path="gio-hang"] .bg-tertiary, #headerCartCount, #mobileCartBadge, #floating-cart-badge, a[href="gio-hang.html"] .bg-tertiary').forEach(badge => {
      badge.textContent = totalCount;
    });

    // Update subtotal text in header
    document.querySelectorAll('[data-path="gio-hang"] .text-label-md, a[href="gio-hang.html"] .font-label-md').forEach(span => {
      if (span.textContent.includes('₫') || span.textContent.includes('đ')) {
        span.textContent = formatVND(totalPrice);
      }
    });

    // Re-render Quick Cart Drawer items if present
    const drawerContainer = document.querySelector('#quick-cart-backdrop .overflow-y-auto');
    if (drawerContainer) {
      if (cart.length === 0) {
        drawerContainer.innerHTML = `
          <div class="py-12 flex flex-col items-center justify-center text-center">
            <span class="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2">remove_shopping_cart</span>
            <p class="font-headline-sm text-on-surface font-bold">Giỏ hàng của bạn đang trống</p>
            <p class="font-body-sm text-on-surface-variant mt-1">Hãy khám phá thêm hàng trăm thiết bị gia dụng ưu đãi hấp dẫn!</p>
            <a href="index.html" onclick="window.closeQuickCart()" class="mt-4 px-6 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md font-bold hover:brightness-105 transition-all">Mua sắm ngay</a>
          </div>
        `;
      } else {
        drawerContainer.innerHTML = cart.map((item, index) => `
          <div class="group relative flex gap-space-md p-space-md rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all mb-3">
            <div class="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-container-lowest flex-shrink-0 cursor-pointer" onclick="window.location.href='chi-tiet-san-pham.html?sp=${item.id}'">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform" src="${item.image}" alt="${item.name}">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div class="pr-space-lg">
                <h4 class="font-label-lg text-label-lg text-on-surface truncate hover:text-primary transition-colors cursor-pointer font-bold" onclick="window.location.href='chi-tiet-san-pham.html?sp=${item.id}'">
                  ${item.name}
                </h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Phân loại: ${item.color}</p>
              </div>
              <div class="flex items-center justify-between mt-space-xs">
                <div class="flex flex-col">
                  <span class="font-headline-sm text-headline-sm text-on-surface font-bold text-tertiary">${formatVND(item.price)}</span>
                  <span class="font-body-sm text-body-sm text-on-surface-variant/70 line-through text-[11px]">${formatVND(item.oldPrice || item.price * 1.2)}</span>
                </div>
                <!-- Stepper -->
                <div class="flex items-center bg-surface-container-lowest rounded-lg shadow-sm p-0.5 border border-outline-variant/30">
                  <button onclick="window.updateQuantity(${index}, -1)" class="w-7 h-7 flex items-center justify-center rounded text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span class="w-8 text-center font-label-md text-label-md text-on-surface font-bold">${item.qty}</span>
                  <button onclick="window.updateQuantity(${index}, 1)" class="w-7 h-7 flex items-center justify-center rounded text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>
            <button onclick="window.removeFromCart(${index})" class="absolute top-space-md right-space-md text-on-surface-variant/50 hover:text-error transition-colors p-1 cursor-pointer" title="Xóa">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        `).join('');
      }

      // Update drawer subtotal
      const subtotalEl = document.querySelector('#quick-cart-backdrop .font-price-hero, #quick-cart-backdrop .font-headline-md.text-on-surface');
      if (subtotalEl) subtotalEl.textContent = formatVND(totalPrice);

      const countBadge = document.querySelector('#quick-cart-backdrop .rounded-full.bg-surface-container-high');
      if (countBadge) countBadge.textContent = `${totalCount} món`;
    }
  }

  // 4. Dedicated Cart Page Hydration (gio-hang.html)
  function renderCartPage() {
    const cartContainer = document.getElementById('cart-item-list');
    if (!cartContainer) return;
    const cart = getCart();

    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const selectAllLabel = selectAllCheckbox ? selectAllCheckbox.parentElement.querySelector('span') : null;

    if (cart.length === 0) {
      if (selectAllLabel) selectAllLabel.textContent = "Chọn tất cả (0 sản phẩm)";
      cartContainer.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-3">remove_shopping_cart</span>
          <h3 class="font-headline-md text-headline-md font-bold text-on-surface">Giỏ hàng của bạn đang trống</h3>
          <p class="font-body-md text-on-surface-variant mt-1 max-w-md">Hãy khám phá thêm hàng trăm thiết bị gia dụng và smarthome chính hãng ưu đãi hấp dẫn!</p>
          <a href="index.html" class="mt-6 px-8 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm font-bold shadow-md hover:bg-primary-fixed transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span>Khám phá sản phẩm ngay</span>
          </a>
        </div>
      `;
      updateCartSummary(0, 0, 0);
      return;
    }

    if (selectAllLabel) selectAllLabel.textContent = `Chọn tất cả (${cart.length} sản phẩm)`;

    cartContainer.innerHTML = cart.map((item, index) => {
      const itemSubtotal = item.price * item.qty;
      const itemOldSubtotal = item.oldPrice ? item.oldPrice * item.qty : null;
      return `
        <article class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative" data-item-id="${item.id}">
          <div class="flex items-start gap-space-md">
            <input checked="" class="item-checkbox mt-2 w-5 h-5 rounded accent-inverse-surface cursor-pointer flex-shrink-0" type="checkbox">
            <!-- Thumbnail -->
            <div class="relative w-24 h-24 md:w-28 md:h-28 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0 p-2 flex items-center justify-center cursor-pointer" onclick="window.location.href='chi-tiet-san-pham.html?sp=${item.id}'">
              <img alt="${item.name}" class="w-full h-full object-contain" src="${item.image}">
              <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-tertiary text-on-tertiary font-label-sm text-[9px] font-bold tracking-tight">-20%</span>
            </div>
            <!-- Product Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary">3AE Official Store</span>
                  <h3 onclick="window.location.href='chi-tiet-san-pham.html?sp=${item.id}'" class="font-headline-sm text-headline-sm text-on-surface leading-snug hover:text-primary transition-colors cursor-pointer font-bold">
                    ${item.name}
                  </h3>
                </div>
                <button onclick="window.removeFromCart(${index})" class="text-on-surface-variant hover:text-tertiary p-1 transition-colors flex-shrink-0 cursor-pointer" title="Xóa sản phẩm">
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span class="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">Phân loại: ${item.color || 'Tiêu chuẩn'}</span>
              </div>
              <div class="mt-space-md pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
                <!-- Pricing -->
                <div class="flex items-baseline gap-space-xs">
                  <span class="font-price-hero text-price-hero text-on-surface font-extrabold tracking-tight">${formatVND(itemSubtotal)}</span>
                  ${itemOldSubtotal ? `<span class="font-body-sm text-body-sm text-on-surface-variant line-through">${formatVND(itemOldSubtotal)}</span>` : ''}
                </div>
                <!-- Stepper -->
                <div class="flex items-center gap-space-md">
                  <button onclick="window.showToast('Đã lưu vào danh sách yêu thích!');" class="text-on-surface-variant hover:text-tertiary transition-colors flex items-center justify-center p-1 cursor-pointer" title="Lưu vào danh sách yêu thích">
                    <span class="material-symbols-outlined text-[20px]">favorite</span>
                  </button>
                  <div class="flex items-center rounded-xl bg-surface-container-low p-1">
                    <button onclick="window.updateQuantity(${index}, -1)" class="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container shadow-xs active:scale-95 transition-all cursor-pointer">
                      <span class="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <input class="w-10 text-center font-label-lg text-label-lg bg-transparent text-on-surface focus:outline-none select-none font-bold" readonly="" type="text" value="${item.qty}">
                    <button onclick="window.updateQuantity(${index}, 1)" class="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container shadow-xs active:scale-95 transition-all cursor-pointer">
                      <span class="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const voucherDiscount = subtotal >= 1000000 ? 30000 : 0;
    const shipping = 0;
    const total = subtotal - voucherDiscount + shipping;

    updateCartSummary(subtotal, voucherDiscount, total);

    // Wire Clear All button
    const removeAllBtn = document.getElementById('btn-remove-all');
    if (removeAllBtn) {
      removeAllBtn.onclick = () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?')) {
          localStorage.setItem('3ae_cart', '[]');
          updateCartUI();
          renderCartPage();
          showToast('Đã xóa toàn bộ giỏ hàng!', 'info');
        }
      };
    }

    // Wire Checkout button
    const checkoutBtn = document.querySelector('.lg\\:col-span-5 button.w-full, aside button.w-full');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        if (getCart().length === 0) {
          showToast('Giỏ hàng của bạn đang trống!', 'info');
          return;
        }
        window.location.href = 'thanh-toan.html';
      };
    }

    // Wire Order notes toggle
    const toggleNotesBtn = document.getElementById('toggle-order-notes');
    const notesContent = document.getElementById('notes-content');
    if (toggleNotesBtn && notesContent) {
      toggleNotesBtn.onclick = () => {
        notesContent.classList.toggle('hidden');
        const span = toggleNotesBtn.querySelector('span:first-child');
        if (span) span.textContent = notesContent.classList.contains('hidden') ? 'Mở rộng' : 'Thu gọn';
      };
    }

    // Wire Voucher Apply / Remove buttons
    const voucherInput = document.querySelector('aside input[type="text"]');
    const voucherBtn = Array.from(document.querySelectorAll('aside button')).find(b => b.textContent.includes('Áp Dụng')) || document.querySelector('aside .relative.flex button');
    if (voucherBtn) {
      voucherBtn.onclick = () => {
        const code = voucherInput ? voucherInput.value.trim().toUpperCase() : 'GIAM30K';
        if (code === 'GIAM30K' || code === 'FREESHIP' || code === '3AE') {
          showToast(`Áp dụng mã ${code} thành công! Tiết kiệm 30.000₫`);
        } else {
          showToast(`Mã ${code} không hợp lệ hoặc đã hết lượt.`, 'info');
        }
      };
    }
  }

  function updateCartSummary(subtotal, discount, total) {
    document.querySelectorAll('aside span, .lg\\:col-span-5 span').forEach(el => {
      if (el.textContent.includes('Tạm tính')) {
        const val = el.parentElement.querySelector('span:last-child');
        if (val) val.textContent = formatVND(subtotal);
      }
    });

    const totalDisplay = document.querySelector('aside .font-display-hero, .lg\\:col-span-5 .font-display-hero');
    if (totalDisplay) totalDisplay.textContent = formatVND(total);
  }

  // 5. Checkout Page Submission & Sync (thanh-toan.html)
  function initCheckoutPage() {
    if (!window.location.pathname.includes('thanh-toan')) return;

    // Sync order items from real cart
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = subtotal >= 1000000 ? 30000 : 0;
    const shipping = 0;
    const total = subtotal - discount + shipping;

    const subtotalEl = document.getElementById('subtotal-display');
    if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);

    const totalEl = document.getElementById('total-amount-display');
    if (totalEl) totalEl.textContent = formatVND(total);

    // Wire Big Submit Order Button
    const orderBtn = document.getElementById('btn-submit-order') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ĐẶT HÀNG NGAY')) || document.querySelector('button[type="button"].w-full.py-4');
    if (orderBtn) {
      orderBtn.onclick = handleOrderSubmit;
    }

    // Wire Voucher buttons
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim() === 'Áp Dụng') {
        btn.onclick = () => showToast('Áp dụng mã giảm giá thành công! Tiết kiệm 30.000₫');
      } else if (btn.textContent.trim() === 'Gỡ bỏ') {
        btn.onclick = () => showToast('Đã gỡ mã giảm giá.', 'info');
      }
    });
  }

  function handleOrderSubmit() {
    const nameInput = document.querySelector('input[placeholder*="Nguyễn Văn A"]') || document.querySelector('input[name="fullname"]');
    const phoneInput = document.querySelector('input[placeholder*="09"]') || document.querySelector('input[name="phone"]');

    const customerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Quý khách";
    const customerPhone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : "0984 313 632";

    const orderId = '#GDTM-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderId: orderId,
      customerName: customerName,
      customerPhone: customerPhone,
      items: getCart(),
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('3ae_last_order', JSON.stringify(orderData));
      localStorage.setItem('3ae_cart', '[]');
    } catch(e) {}

    showToast(`Đặt hàng thành công đơn ${orderId}! Đang chuyển tới trang xác nhận...`, 'success');
    setTimeout(() => {
      window.location.href = `da-thanh-toan.html?orderId=${encodeURIComponent(orderId)}`;
    }, 700);
  }

  // 6. Order Confirmation Page (da-thanh-toan.html)
  function initOrderConfirmationPage() {
    if (!window.location.pathname.includes('da-thanh-toan')) return;
    const orderIdParam = getQueryParam('orderId');
    let orderId = orderIdParam;
    if (!orderId) {
      try {
        const lastOrder = JSON.parse(localStorage.getItem('3ae_last_order') || '{}');
        orderId = lastOrder.orderId;
      } catch(e) {}
    }
    if (!orderId) orderId = '#GDTM-892419';

    const orderIdEl = document.getElementById('orderIdText');
    if (orderIdEl) orderIdEl.textContent = orderId;

    const copyBtn = document.getElementById('copyOrderBtn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(orderId.replace('#', ''));
        showToast(`Đã sao chép mã đơn hàng: ${orderId}`);
      };
    }
  }

  // 7. Product Details Action Handlers
  function hydrateProductDetail() {
    const isMobilePage = window.location.pathname.includes('mobile');
    const spParam = getQueryParam('sp');
    const product = findProduct(spParam);
    if (!product) return;

    document.title = `${product.name} - Gia Dụng Thông Minh 3AE`;

    // Breadcrumb
    const breadcrumbCurrent = document.querySelector('nav[aria-label="Breadcrumb"] .text-on-surface, .breadcrumb-item.active');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

    // Title
    const titleEl = document.querySelector('h1, h2.font-headline-lg');
    if (titleEl && !titleEl.textContent.includes('Giới Thiệu') && !titleEl.textContent.includes('Khuyến Mãi') && !titleEl.textContent.includes('Đại Tiệc')) {
      titleEl.textContent = product.name;
    }

    // Brand
    const brandEl = document.querySelector('.bg-primary-container.text-on-primary-container, .brand-label');
    if (brandEl) brandEl.textContent = product.brand.toUpperCase() + ' OFFICIAL';

    // Prices
    const priceEl = document.querySelector('#display-price, .font-price-hero.text-tertiary, .product-price');
    if (priceEl) priceEl.textContent = formatVND(product.price);

    const oldPriceEl = document.querySelector('#display-original-price, .line-through');
    if (oldPriceEl) oldPriceEl.textContent = formatVND(product.originalPrice);

    const discountEl = document.querySelector('.bg-tertiary.text-on-tertiary');
    if (discountEl && product.discount) discountEl.textContent = product.discount;

    // Main Photo
    const mainImg = document.getElementById('main-product-img') || document.querySelector('.aspect-square img');
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    // Keep 1st thumbnail in sync with the current product image
    const firstThumbImg = document.querySelector('.thumbnail-btn img');
    if (firstThumbImg && product.image) {
      firstThumbImg.src = product.image;
      firstThumbImg.alt = product.name;
    }

    // Update Mobile Breadcrumbs
    const mobileCatBreadcrumb = document.querySelector('.px-margin.py-space-sm .text-secondary span:first-child');
    if (mobileCatBreadcrumb && product.categoryName) {
      mobileCatBreadcrumb.textContent = product.categoryName;
    }
    const mobileProdBreadcrumb = document.querySelector('.px-margin.py-space-sm .text-secondary span:last-child');
    if (mobileProdBreadcrumb) {
      mobileProdBreadcrumb.textContent = product.name;
    }

    // Reset Gallery selection to index 0
    if (typeof updateGalleryUI === 'function') {
      try { updateGalleryUI(0); } catch(e) {}
    }
    if (typeof updateDesktopGallery === 'function') {
      try { updateDesktopGallery(0); } catch(e) {}
    }

    // Color label
    const colorLabel = document.getElementById('selected-color-label');
    if (colorLabel && product.colors && product.colors[0]) {
      colorLabel.textContent = product.colors[0];
    }
  }

  // Global functions exposed to window
  globalScope.handleAddToCart = function(customId = null, customQty = null) {
    const spParam = getQueryParam('sp');
    const product = findProduct(customId || spParam);
    if (!product) return;

    let qty = customQty;
    if (!qty) {
      const qtyInput = document.getElementById('qty-input') || document.getElementById('product-qty');
      qty = qtyInput ? parseInt(qtyInput.value || qtyInput.textContent) || 1 : 1;
    }

    const colorLabel = document.getElementById('selected-color-label');
    const color = colorLabel ? colorLabel.textContent.trim() : null;

    addToCart(product.id, qty, color);

    const mobileBadge = document.getElementById('floating-cart-badge');
    if (mobileBadge) {
      const cart = getCart();
      mobileBadge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }
  };

  globalScope.handleBuyNow = function(customId = null) {
    const spParam = getQueryParam('sp');
    const product = findProduct(customId || spParam);
    if (!product) return;

    let qty = 1;
    const qtyInput = document.getElementById('qty-input') || document.getElementById('product-qty');
    if (qtyInput) qty = parseInt(qtyInput.value || qtyInput.textContent) || 1;

    const colorLabel = document.getElementById('selected-color-label');
    const color = colorLabel ? colorLabel.textContent.trim() : null;

    addToCart(product.id, qty, color);
    window.location.href = 'thanh-toan.html';
  };

  globalScope.handleOrderSubmit = handleOrderSubmit;
  globalScope.showToast = showToast;
  globalScope.openQuickCart = openQuickCart;
  globalScope.closeQuickCart = closeQuickCart;
  globalScope.addToCart = addToCart;
  globalScope.updateQuantity = updateQuantity;
  globalScope.removeFromCart = removeFromCart;
  globalScope.formatVND = formatVND;
  globalScope.findProduct = findProduct;

  // 8. Universal Search Implementation
  function initUniversalSearch() {
    function doSearch(val) {
      if (!val || !val.trim()) return;
      const query = val.trim();
      const product = findProduct(query);
      const isMobile = window.innerWidth <= 640 || window.location.pathname.includes('mobile');
      if (product) {
        window.location.href = `${isMobile ? 'mobile-san-pham.html' : 'chi-tiet-san-pham.html'}?sp=${product.id}`;
      } else {
        window.location.href = `dai-tiec-khuyen-mai.html`;
      }
    }

    document.querySelectorAll('input[type="text"]').forEach(input => {
      const ph = input.getAttribute('placeholder') || '';
      if (ph.includes('Bạn tìm gì') || ph.includes('Tìm kiếm') || ph.includes('Tìm sản phẩm')) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doSearch(input.value);
          }
        });
        const parent = input.parentElement;
        if (parent) {
          const btn = parent.querySelector('button');
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              doSearch(input.value);
            });
          }
        }
      }
    });
  }

  // 9. Newsletter Form Binding
  function initNewsletterForm() {
    document.querySelectorAll('footer input[type="email"]').forEach(input => {
      const parent = input.parentElement;
      if (parent) {
        const btn = parent.querySelector('button');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = input.value.trim();
            if (email && email.includes('@')) {
              showToast('Cảm ơn bạn! Đã đăng ký nhận bản tin ưu đãi thành công.', 'success');
              input.value = '';
            } else {
              showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'info');
            }
          });
        }
      }
    });
  }

  // 10. Filters & Navigation Tabs
  globalScope.filterBrandSpotlight = function(btn, category) {
    const parent = document.getElementById('brand-spotlight-tabs') || (btn ? btn.parentElement : null);
    if (parent) {
      parent.querySelectorAll('button').forEach(b => {
        b.className = 'px-space-md py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all cursor-pointer';
      });
      if (btn) {
        btn.className = 'px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold shadow-sm transition-all cursor-pointer';
      }
    }
    const section = parent ? parent.closest('section') : null;
    if (section) {
      const cards = section.querySelectorAll('.grid > div');
      cards.forEach(card => {
        if (category === 'all') {
          card.style.display = 'flex';
        } else {
          const cat = card.getAttribute('data-category') || '';
          card.style.display = (cat === category || cat.includes(category)) ? 'flex' : 'none';
        }
      });
    }
  };

  globalScope.filterMobileCategory = function(btn, category) {
    const parent = btn.parentElement;
    if (parent) {
      parent.querySelectorAll('button').forEach(b => {
        b.className = 'bg-surface-container-lowest text-on-surface px-3 py-1 rounded-full font-label-sm text-[11px] font-semibold shrink-0 transition-all cursor-pointer';
      });
      btn.className = 'bg-inverse-surface text-inverse-on-surface px-3 py-1 rounded-full font-label-sm text-[11px] font-bold shrink-0 shadow-sm transition-all cursor-pointer';
    }
    const cards = document.querySelectorAll('.grid-cols-2 > div, .grid-cols-2 > article');
    cards.forEach(card => {
      if (category === 'all') {
        card.style.display = 'flex';
      } else {
        const cat = card.getAttribute('data-category') || '';
        card.style.display = (cat === category || card.textContent.toLowerCase().includes(category.toLowerCase())) ? 'flex' : 'none';
      }
    });
  };

  globalScope.switchTimelineSlot = function(btn, time) {
    const parent = btn.parentElement;
    if (parent) {
      parent.querySelectorAll('button').forEach(b => {
        b.className = 'flex flex-col items-center px-6 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer';
        const sub = b.querySelector('span:last-child');
        if (sub) sub.className = 'font-label-sm text-label-sm';
      });
      btn.className = 'flex flex-col items-center px-6 py-2 rounded-xl bg-inverse-surface text-primary-container font-label-md text-label-md shadow-sm cursor-pointer';
      const sub = btn.querySelector('span:last-child');
      if (sub) sub.className = 'font-label-sm text-label-sm text-primary-container font-bold';
    }
    showToast(`Đã chuyển sang đợt Flash Sale ${time}!`);
  };

  globalScope.applyVoucher = function() {
    showToast('Áp dụng mã giảm giá thành công! Tiết kiệm 30.000₫');
  };

  globalScope.removeVoucher = function() {
    showToast('Đã gỡ mã giảm giá.', 'info');
  };

  globalScope.copyOrderId = function(btn) {
    const el = document.getElementById('orderIdText');
    const text = el ? el.textContent.trim() : '#GDTM-892419';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Đã sao chép mã đơn ' + text);
        if (btn) btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span><span>Đã sao chép!</span>';
      }).catch(() => {
        showToast('Mã đơn hàng: ' + text);
      });
    } else {
      showToast('Mã đơn hàng: ' + text);
    }
  };

  globalScope.filterReviewChips = function(btn) {
    if (!btn || !btn.parentElement) return;
    btn.parentElement.querySelectorAll('button').forEach(b => {
      b.className = 'px-space-md py-1.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-sm text-label-sm shadow-sm transition-all cursor-pointer';
    });
    btn.className = 'px-space-md py-1.5 rounded-full bg-inverse-surface text-on-primary font-label-sm text-label-sm font-semibold transition-all cursor-pointer';
  };

  // 11. Automatic Product Card Click Binding Across All Pages
  function bindAllProductCards() {
    const isMobile = window.location.pathname.includes('mobile');
    const targetPage = isMobile ? 'mobile-san-pham.html' : 'chi-tiet-san-pham.html';

    // All product cards across sections
    document.querySelectorAll('.product-item, #flash-product-grid > div, section .rounded-xl.bg-surface-container-lowest, .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div, .grid-cols-2 > div').forEach((card, index) => {
      if (card.hasAttribute('onclick')) return;
      const h4 = card.querySelector('h4, h3');
      if (h4) {
        const title = h4.textContent.trim();
        const product = findProduct(title);
        if (product) {
          card.style.cursor = 'pointer';
          card.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;
            window.location.href = `${targetPage}?sp=${product.id}`;
          });

          // Cart buttons inside card
          const cartBtn = card.querySelector('button');
          if (cartBtn && !cartBtn.hasAttribute('onclick')) {
            cartBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              addToCart(product.id, 1);
            });
          }
        }
      }
    });

    // Mobile floating action buttons on mobile-san-pham.html
    const mobileCartBtn = document.querySelector('button[aria-label="Giỏ hàng"]');
    if (mobileCartBtn && !mobileCartBtn.onclick) {
      mobileCartBtn.onclick = () => window.location.href = 'gio-hang.html';
    }
    const mobileAdvisorBtn = document.querySelector('button[aria-label="Tư vấn trực tiếp"]');
    if (mobileAdvisorBtn && !mobileAdvisorBtn.onclick) {
      mobileAdvisorBtn.onclick = () => window.location.href = 'tel:18006868';
    }

    // Category navigation links (data-path)
    document.querySelectorAll('[data-path="gia-dung-tien-ich"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html#flash-product-grid';
      });
    });
    document.querySelectorAll('[data-path="am-thanh-giai-tri"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html#flash-product-grid';
      });
    });
    document.querySelectorAll('[data-path="dien-dien-tu"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html#flash-product-grid';
      });
    });
    document.querySelectorAll('[data-path="phu-kien-dien-thoai"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html#flash-product-grid';
      });
    });

    // Store network & informative popups
    document.querySelectorAll('[data-path="he-thong-cua-hang"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Hệ thống 45 chi nhánh Gia Dụng Thông Minh 3AE sẵn sàng phục vụ tại TP.HCM, Hà Nội, Đà Nẵng, Hải Phòng!', 'info');
      });
    });
    document.querySelectorAll('[data-path="danh-sach-yeu-thich"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Danh sách sản phẩm yêu thích của bạn đang được lưu trữ!', 'info');
      });
    });
    document.querySelectorAll('[data-path="dang-nhap"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Cổng đăng nhập thành viên đang được nâng cấp tính năng tích điểm!', 'info');
      });
    });
    document.querySelectorAll('[data-path="tin-tuc-cong-nghe"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Cập nhật tin tức công nghệ và gia dụng mới nhất mỗi ngày!', 'info');
      });
    });
    document.querySelectorAll('[data-path="tra-cuu-don-hang"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Vui lòng liên hệ tổng đài 1800 6868 kèm mã đơn hàng để tra cứu tiến độ giao.', 'info');
      });
    });
    document.querySelectorAll('[data-path^="chinh-sach-"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Chính sách 3AE: Bảo hành 12-24 tháng chính hãng, đổi mới tận nhà trong 30 ngày.', 'info');
      });
    });
  }

  // 12. On DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    initUniversalSearch();
    initNewsletterForm();

    if (window.location.pathname.includes('gio-hang')) {
      renderCartPage();
    } else if (window.location.pathname.includes('thanh-toan')) {
      initCheckoutPage();
    } else if (window.location.pathname.includes('da-thanh-toan')) {
      initOrderConfirmationPage();
    } else if (window.location.pathname.includes('san-pham')) {
      hydrateProductDetail();
    }

    bindAllProductCards();
  });

})();
