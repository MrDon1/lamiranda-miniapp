// Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// API sozlamalari
const API_URL = "https://lamiranda.uz/wp-json/wc/v3";
const USERNAME = "lamiranda_admin";
const APP_PASSWORD = "QvII 4pmm xl8s puLi JknE amyC";

// Holat
let cart = [];
let user = null;
let allProducts = [];
let coinsUsed = false;

// Sahifalar
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById('page-' + page).style.display = 'flex';
}

// Ro'yxatdan o'tish
function register() {
  const name = document.getElementById('reg-name').value.trim();
  const surname = document.getElementById('reg-surname').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();

  if (!name || !surname || !phone || !address) {
    alert('Barcha maydonlarni to\'ldiring!');
    return;
  }

  user = {
    name,
    surname,
    phone,
    address,
    coins: 0,
    telegram_id: tg.initDataUnsafe?.user?.id || 0
  };

  localStorage.setItem('lm_user', JSON.stringify(user));
  initHome();
  showPage('home');
}

// Bosh sahifani yuklash
async function initHome() {
  updateCabinetUI();
  loadCategories();
  loadProducts();
}

// Kategoriyalarni yuklash
async function loadCategories() {
  try {
    const res = await fetch(`${API_URL}/products/categories?per_page=20`, {
      headers: {
        'Authorization': 'Basic ' + btoa(USERNAME + ':' + APP_PASSWORD)
      }
    });
    const cats = await res.json();
    const container = document.getElementById('categories');
    container.innerHTML = '';

    const allowedIds = ['Основные торты', 'Бенто торты', 'Бенто-торты', 'Пирожные', 'Продукции в таре', 'Выпечки'];

    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'Hammasi';
    allBtn.onclick = () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      renderProducts(allProducts);
    };
    container.appendChild(allBtn);

    cats.forEach(cat => {
      const cleanName = cat.name.replace(/^\[?\d+\]?\s*/, '').replace(/🎂\s*/, '').trim();
      if (!allowedIds.includes(cleanName)) return;

      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.textContent = cleanName;
      btn.onclick = () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filtered = allProducts.filter(p =>
          p.categories.some(c => c.id === cat.id)
        );
        renderProducts(filtered);
      };
      container.appendChild(btn);
    });
  } catch (e) {
    console.log('Kategoriya xato:', e);
  }
}

// Mahsulotlarni yuklash
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products?per_page=50&status=publish`, {
      headers: {
        'Authorization': 'Basic ' + btoa(USERNAME + ':' + APP_PASSWORD)
      }
    });
    allProducts = await res.json();
    console.log(allProducts[0]?.name, allProducts[0]?.images?.[0]?.src);
    renderProducts(allProducts);
  } catch (e) {
    document.getElementById('products').innerHTML = '<p class="empty-text">Mahsulotlar yuklanmadi</p>';
  }
}

// Mahsulotlarni ko'rsatish
function renderProducts(products) {
  const container = document.getElementById('products');
  if (!products.length) {
    container.innerHTML = '<p class="empty-text">Mahsulotlar yo\'q</p>';
    return;
  }

  container.innerHTML = '';
  products.forEach(p => {
    const inStock = p.stock_status === 'instock';
    const img = p.images?.[0]?.src || '';
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <div style="width:100%;height:120px;overflow:hidden;background:#fce8ee;border-radius:14px 14px 0 0;">
        ${img ? `<img src="${img}" style="width:100%;height:120px;object-fit:cover;display:block;">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:40px;">🎂</div>'}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${Number(p.price).toLocaleString()} so'm</div>
        <button class="product-btn" ${!inStock ? 'disabled style="opacity:0.5"' : ''}
          onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${img}')">
          ${inStock ? 'Savatga +' : 'Tugagan'}
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}
// Savatga qo'shish
function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price: Number(price), img, qty: 1 });
  }
  updateCartCount();
  alert(`${name} savatga qo'shildi!`);
}

// Savat sonini yangilash
function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

// Savatni ko'rsatish
function renderCart() {
  const container = document.getElementById('cart-items');
  if (!cart.length) {
    container.innerHTML = '<p class="empty-text">Savat bo\'sh</p>';
    document.getElementById('cart-total').textContent = '0 so\'m';
    return;
  }

  container.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">
        ${item.img ? `<img src="${item.img}">` : '🎂'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} so'm</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    `;
    container.appendChild(div);
  });

  updateTotal();
  document.getElementById('coins-balance').textContent =
    (user?.coins || 0).toLocaleString();
}

// Miqdorni o'zgartirish
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

// Jami summani yangilash
function updateTotal() {
  let total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (coinsUsed && user?.coins) {
    total = Math.max(0, total - user.coins);
  }
  document.getElementById('cart-total').textContent =
    total.toLocaleString() + ' so\'m';
}

// Tangadan foydalanish
function useCoins() {
  if (!user?.coins || user.coins === 0) {
    alert('Tangangiz yo\'q!');
    return;
  }
  coinsUsed = !coinsUsed;
  updateTotal();
  alert(coinsUsed
    ? `${user.coins.toLocaleString()} tanga qo'shildi!`
    : 'Tangalar olib tashlandi');
}

// Kabinet UI
function updateCabinetUI() {
  if (!user) return;
  const initials = (user.name[0] + user.surname[0]).toUpperCase();
  document.getElementById('cabinet-avatar').textContent = initials;
  document.getElementById('cabinet-name').textContent = user.name + ' ' + user.surname;
  document.getElementById('cabinet-phone').textContent = user.phone;
  document.getElementById('cabinet-coins').textContent =
    (user.coins || 0).toLocaleString();
}

// Sahifa o'zgarganda
const originalShowPage = showPage;
window.showPage = function(page) {
  originalShowPage(page);
  if (page === 'cart') renderCart();
  if (page === 'cabinet') updateCabinetUI();
};

// Ilovani ishga tushirish
window.onload = function() {
  const saved = localStorage.getItem('lm_user');
  if (saved) {
    user = JSON.parse(saved);
    initHome();
    showPage('home');
  } else {
    showPage('register');
  }
};

function showCheckout() {
  if (!cart.length) {
    alert('Savat bo\'sh!');
    return;
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('co-total').textContent = total.toLocaleString() + ' so\'m';
  document.getElementById('co-name').value = user ? user.name + ' ' + user.surname : '';
  document.getElementById('co-phone').value = user ? user.phone : '';
  document.getElementById('co-address').value = user ? user.address : '';
  showPage('checkout');
}

async function placeOrder() {
  const name = document.getElementById('co-name').value.trim();
  const phone = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const comment = document.getElementById('co-comment').value.trim();

  if (!name || !phone || !address) {
    alert('Barcha maydonlarni to\'ldiring!');
    return;
  }

  const lineItems = cart.map(i => ({
    product_id: i.id,
    quantity: i.qty
  }));

  const orderData = {
    payment_method: "cod",
    payment_method_title: "Naqd pul",
    set_paid: false,
    billing: {
      first_name: name,
      phone: phone,
      address_1: address,
      city: "Toshkent",
      country: "UZ"
    },
    line_items: lineItems,
    customer_note: comment
  };

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(USERNAME + ':' + APP_PASSWORD)
      },
      body: JSON.stringify(orderData)
    });

    const order = await res.json();

    if (order.id) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const earned = Math.floor(total * 0.01);
  user.coins = (user.coins || 0) + earned;
  localStorage.setItem('lm_user', JSON.stringify(user));

  // Telegram'ga ma'lumot yuborish
  const orderData = {
    order_id: order.id,
    name: name,
    phone: phone,
    address: address,
    total: total,
    items: cart.map(i => ({
      name: i.name,
      qty: i.qty,
      price: i.price * i.qty
    }))
  };

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(orderData));
  }

  cart = [];
  updateCartCount();
  alert(`✅ Buyurtma qabul qilindi!\n🪙 +${earned.toLocaleString()} tanga yig'ildi!`);
  showPage('home');
}
  } catch (e) {
    alert('Internet xatosi, qayta urining');
  }
}