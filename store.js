// 3AE Gia Dung Thong Minh - Universal Store & Product Interaction Engine

(function() {
  // 1. Initial State & Helper Functions
  const DEFAULT_PRODUCT_ID = "noi-da-nang-gaabor-ec30t01a";

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function formatVND(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
  }

  function findProduct(idOrSlug) {
    if (typeof PRODUCTS_DB === 'undefined' || !PRODUCTS_DB.length) return null;
    if (!idOrSlug) return PRODUCTS_DB[8] || PRODUCTS_DB[0];
    const query = idOrSlug.toString().toLowerCase().trim();

    // 1. Exact match by id or slug
    let found = PRODUCTS_DB.find(p => p.id === query || p.slug === query);
    if (found) return found;

    // 2. Exact keyword / model matching
    const models = [
      { key: "gws-m02a", id: "can-dien-tu-gaabor" },
      { key: "fp03t", id: "may-xay-gaabor-fp03t" },
      { key: "ec-15m01a", id: "noi-da-nang-gaabor-ec15m01a" },
      { key: "jm-m01a", id: "may-xay-gaabor-jm-m01a" },
      { key: "ec-20m01a", id: "noi-da-nang-gaabor-ec20m01a" },
      { key: "ek-20m01a", id: "am-sieu-toc-gaabor-ek20m01a" },
      { key: "gfd-n400a02", id: "quat-dung-gaabor-gfd-n400a02" },
      { key: "quạt", id: "quat-dung-gaabor-gfd-n400a02" },
      { key: "cw-18m01a", id: "may-hut-bui-gaabor-cw-18m01a" },
      { key: "ec-30t01a", id: "noi-da-nang-gaabor-ec30t01a" },
      { key: "mslovelux", id: "may-nau-sua-hat-masuto" },
      { key: "sữa hạt", id: "may-nau-sua-hat-masuto" },
      { key: "cable kit", id: "bo-cap-mophie-kit" },
      { key: "universal", id: "hub-sac-mophie-universal" },
      { key: "pac4000bk", id: "bom-dien-energizer-pac4000bk" },
      { key: "bơm hơi", id: "bom-dien-energizer-pac4000bk" },
      { key: "mfi", id: "cap-lightning-mophie-1m" },
      { key: "pd100x", id: "micro-maono-rgb-pd100x" },
      { key: "bts121bk", id: "loa-di-dong-bts121bk" },
      { key: "pd200x", id: "micro-maono-pd200x" },
      { key: "xlr", id: "cap-maono-xlr-18m" },
      { key: "datic", id: "cong-tac-hunonic-datic" },
      { key: "2 nút", id: "cong-tac-2-nut-hunonic" },
      { key: "chống giật", id: "cong-tac-chong-giat-hunonic" },
      { key: "cửa cuốn", id: "cong-tac-cua-cuon-hunonic" },
      { key: "roborock", id: "may-hut-bui-gaabor-cw-18m01a" }
    ];

    for (const m of models) {
      if (query.includes(m.key)) {
        const p = PRODUCTS_DB.find(prod => prod.id === m.id);
        if (p) return p;
      }
    }

    // 3. Substring match
    return PRODUCTS_DB.find(p => p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase())) || PRODUCTS_DB[8];
  }

  // 2. Cart State Management
  function getCart() {
    try {
      const data = localStorage.getItem('3ae_cart');
      if (data) return JSON.parse(data);
    } catch (e) {}
    // Initial sample cart items
    return [
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
  }

  function saveCart(cart) {
    try {
      localStorage.setItem('3ae_cart', JSON.stringify(cart));
      updateCartUI();
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

  function updateQuantity(index, delta) {
    const cart = getCart();
    if (cart[index]) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart(cart);
    }
  }

  function removeFromCart(index) {
    const cart = getCart();
    if (cart[index]) {
      const removed = cart.splice(index, 1);
      saveCart(cart);
      showToast(`Đã xóa "${removed[0].name}" khỏi giỏ hàng!`, 'info');
    }
  }

  // 3. UI Update for Badges and Drawer
  function updateCartUI() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update badges
    document.querySelectorAll('[data-path="gio-hang"] .bg-tertiary, #headerCartCount').forEach(badge => {
      badge.textContent = totalCount;
    });

    // Update subtotal text in header
    document.querySelectorAll('[data-path="gio-hang"] .text-label-md').forEach(span => {
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
            <a href="index.html" onclick="closeQuickCart()" class="mt-4 px-6 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md font-bold hover:brightness-105 transition-all">Mua sắm ngay</a>
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
                  <span class="font-body-sm text-body-sm text-on-surface-variant/70 line-through text-[11px]">${formatVND(item.oldPrice)}</span>
                </div>
                <!-- Stepper -->
                <div class="flex items-center bg-surface-container-lowest rounded-lg shadow-sm p-0.5 border border-outline-variant/30">
                  <button onclick="window.updateQuantity(${index}, -1)" class="w-7 h-7 flex items-center justify-center rounded text-on-surface hover:bg-surface-container-high transition-colors">
                    <span class="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span class="w-8 text-center font-label-md text-label-md text-on-surface font-bold">${item.qty}</span>
                  <button onclick="window.updateQuantity(${index}, 1)" class="w-7 h-7 flex items-center justify-center rounded text-on-surface hover:bg-surface-container-high transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>
            <button onclick="window.removeFromCart(${index})" class="absolute top-space-md right-space-md text-on-surface-variant/50 hover:text-error transition-colors p-1" title="Xóa">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        `).join('');
      }

      // Update drawer subtotal
      const subtotalEl = document.querySelector('#quick-cart-backdrop .font-headline-md.text-on-surface');
      if (subtotalEl) subtotalEl.textContent = formatVND(totalPrice);
    }
  }

  // 4. Dynamic Page Hydration on Product Details
  function hydrateProductDetail() {
    const isMobilePage = window.location.pathname.includes('mobile');
    const spParam = getQueryParam('sp');
    const product = findProduct(spParam);
    if (!product) return;

    document.title = `${product.name} - Gia Dụng Thông Minh 3AE`;

    // 1. Breadcrumb
    const breadcrumbCurrent = document.querySelector('nav[aria-label="Breadcrumb"] .text-on-surface, .breadcrumb-item.active');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

    // 2. Title & Brand
    const titleEl = document.querySelector('h1, h2.font-headline-lg');
    if (titleEl && !titleEl.textContent.includes('Giới Thiệu') && !titleEl.textContent.includes('Khuyến Mãi')) {
      titleEl.textContent = product.name;
    }

    const brandEl = document.querySelector('.bg-primary-container.text-on-primary-container, .brand-label');
    if (brandEl) brandEl.textContent = product.brand.toUpperCase() + ' OFFICIAL';

    // 3. Prices
    const priceEl = document.querySelector('#display-price, .font-price-hero.text-tertiary, .product-price');
    if (priceEl) priceEl.textContent = formatVND(product.price);

    const oldPriceEl = document.querySelector('#display-original-price, .line-through');
    if (oldPriceEl) oldPriceEl.textContent = formatVND(product.originalPrice);

    const discountEl = document.querySelector('.bg-tertiary.text-on-tertiary');
    if (discountEl && product.discount) discountEl.textContent = product.discount;

    // 4. Main Photo
    const mainImg = document.getElementById('main-product-img') || document.querySelector('.aspect-square img');
    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    // 5. Specs Table
    const specsContainer = document.querySelector('#specs-table tbody, table.w-full tbody');
    if (specsContainer && product.specs) {
      specsContainer.innerHTML = Object.entries(product.specs).map(([key, val]) => `
        <tr class="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors">
          <td class="py-3 px-4 font-semibold text-on-surface-variant w-1/3">${key}</td>
          <td class="py-3 px-4 text-on-surface font-medium">${val}</td>
        </tr>
      `).join('');
    }

    // 6. Color Pills
    const colorContainer = document.getElementById('color-options') || document.querySelector('.flex.flex-wrap.gap-space-sm');
    if (colorContainer && product.colors) {
      colorContainer.innerHTML = product.colors.map((c, i) => `
        <button onclick="window.selectColor('${c}', this)" class="color-pill px-4 py-2 rounded-xl border border-outline-variant/60 font-label-md text-label-md transition-all flex items-center gap-2 ${i === 0 ? 'ring-2 ring-primary-container bg-surface-container-lowest shadow-sm' : 'hover:border-primary'}">
          <span>${c}</span>
          ${i === 0 ? '<span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>' : ''}
        </button>
      `).join('');
      const colorLabel = document.getElementById('selected-color-label');
      if (colorLabel) colorLabel.textContent = product.colors[0];
    }

    // 7. Connect Buy Buttons
    const buyNowBtn = document.querySelector('[data-path="mua-ngay"], a:has-text("Mua ngay")') || document.getElementById('btn-buy-now');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product.id, 1);
        window.location.href = 'thanh-toan.html';
      });
    }

    const addCartBtn = document.querySelector('[data-path="them-vao-gio"], #btn-add-cart');
    if (addCartBtn) {
      addCartBtn.onclick = (e) => {
        e.preventDefault();
        const qtyEl = document.getElementById('product-qty');
        const qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;
        addToCart(product.id, qty);
      };
    }
  }

  // 5. Automatic Card Click Binding Across Site
  function bindAllProductCards() {
    const isMobile = window.location.pathname.includes('mobile');
    const targetPage = isMobile ? 'mobile-san-pham.html' : 'chi-tiet-san-pham.html';

    // 1. Flash product grid items on index.html
    document.querySelectorAll('.product-item, #flash-product-grid > div').forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.classList.add('hover:shadow-xl', 'hover:-translate-y-1', 'transition-all');

      const h4 = card.querySelector('h4, h3');
      const title = h4 ? h4.textContent.trim() : '';
      const product = findProduct(title) || (PRODUCTS_DB && PRODUCTS_DB[index % PRODUCTS_DB.length]);

      if (product) {
        // Entire card click
        card.addEventListener('click', (e) => {
          // If clicking buttons inside card, handled separately
          if (e.target.closest('button')) return;
          window.location.href = `${targetPage}?sp=${product.id}`;
        });

        // "Mua ngay" button inside card
        const buyBtn = card.querySelector('button:last-child');
        if (buyBtn && buyBtn.textContent.includes('Mua ngay')) {
          buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `thanh-toan.html?sp=${product.id}`;
          });
        }

        // "Thêm" button inside card
        const addBtn = card.querySelector('button:first-child');
        if (addBtn && (addBtn.textContent.includes('Thêm') || addBtn.querySelector('.material-symbols-outlined'))) {
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product.id, 1);
          });
        }
      }
    });

    // 2. Brand Spotlight cards (Mophie, Energizer, Maono, Hunonic)
    document.querySelectorAll('section .rounded-xl.bg-surface-container-lowest').forEach(card => {
      const h4 = card.querySelector('h4, h3');
      if (h4) {
        const title = h4.textContent.trim();
        const product = findProduct(title);
        if (product) {
          card.style.cursor = 'pointer';
          card.classList.add('hover:shadow-xl', 'transition-all');
          card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            window.location.href = `${targetPage}?sp=${product.id}`;
          });

          const cartBtn = card.querySelector('button');
          if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              addToCart(product.id, 1);
            });
          }
        }
      }
    });

    // 3. Cards in dai-tiec-khuyen-mai.html
    document.querySelectorAll('#flash-deals .bg-surface-container-lowest, section:has(#flash-deals) .bg-surface-container-lowest').forEach(card => {
      const h3 = card.querySelector('h3, h4');
      if (h3) {
        const title = h3.textContent.trim();
        const product = findProduct(title) || PRODUCTS_DB[8];
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          window.location.href = `chi-tiet-san-pham.html?sp=${product.id}`;
        });

        const buyBtn = card.querySelector('button');
        if (buyBtn && buyBtn.textContent.includes('MUA NGAY')) {
          buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `chi-tiet-san-pham.html?sp=${product.id}`;
          });
        }
      }
    });

    // 4. Cards in mobile-trang-chu.html
    document.querySelectorAll('.grid-cols-2 .bg-surface-container-lowest').forEach(card => {
      const h3 = card.querySelector('h3, h4');
      if (h3) {
        const title = h3.textContent.trim();
        const product = findProduct(title) || PRODUCTS_DB[0];
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          window.location.href = `mobile-san-pham.html?sp=${product.id}`;
        });

        const addBtn = card.querySelector('button[aria-label="Thêm vào giỏ"]');
        if (addBtn) {
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product.id, 1);
          });
        }
      }
    });

    // 5. Category Navigation links
    document.querySelectorAll('[data-path="gia-dung-tien-ich"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof filterFlash === 'function') {
          const tabBtn = document.querySelector('#flash-tabs button:nth-child(2)');
          if (tabBtn) filterFlash(tabBtn, 'gadget');
        }
        const grid = document.getElementById('flash-product-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = 'index.html#flash-product-grid';
      });
    });

    document.querySelectorAll('[data-path="am-thanh-giai-tri"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof filterFlash === 'function') {
          const tabBtn = document.querySelector('#flash-tabs button:nth-child(3)');
          if (tabBtn) filterFlash(tabBtn, 'audio');
        }
        const grid = document.getElementById('flash-product-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = 'index.html#flash-product-grid';
      });
    });

    document.querySelectorAll('[data-path="dien-dien-tu"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof filterFlash === 'function') {
          const tabBtn = document.querySelector('#flash-tabs button:nth-child(4)');
          if (tabBtn) filterFlash(tabBtn, 'electronics');
        }
        const grid = document.getElementById('flash-product-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = 'index.html#flash-product-grid';
      });
    });

    document.querySelectorAll('[data-path="phu-kien-dien-thoai"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof filterFlash === 'function') {
          const tabBtn = document.querySelector('#flash-tabs button:nth-child(5)');
          if (tabBtn) filterFlash(tabBtn, 'accessories');
        }
        const grid = document.getElementById('flash-product-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = 'index.html#flash-product-grid';
      });
    });

    // 6. Store network popup
    document.querySelectorAll('[data-path="he-thong-cua-hang"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Hệ thống 45 chi nhánh Gia Dụng Thông Minh 3AE sẵn sàng phục vụ tại TP.HCM, Hà Nội, Đà Nẵng, Hải Phòng!', 'info');
      });
    });
  }

  // Export to window
  window.PRODUCTS_DB = window.PRODUCTS_DB || (typeof PRODUCTS_DB !== 'undefined' ? PRODUCTS_DB : []);
  window.addToCart = addToCart;
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;
  window.formatVND = formatVND;
  window.findProduct = findProduct;

  function filterCategory(cat) {
    const parent = document.getElementById('flash-tabs');
    if (!parent) return;
    const catMap = {
      'gadget': 1,
      'audio': 2,
      'electronics': 3,
      'accessories': 4,
      'all': 0
    };
    const index = catMap[cat] ?? 0;
    const buttons = parent.querySelectorAll('button');
    if (buttons[index] && typeof filterFlash === 'function') {
      filterFlash(buttons[index], cat);
    }
  }
  window.filterCategory = filterCategory;


  // On DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    if (window.location.pathname.includes('san-pham')) {
      hydrateProductDetail();
    }
    bindAllProductCards();
  });

})();
