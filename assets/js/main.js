// ============================================================
// DATA & STATE
// ============================================================
const DEFAULT_PRODUCTS = [
    { id: 1, name: 'أميرة الأحلام', price: 250, img: 'https://placehold.co/300x300/f8a5a5/fff?text=👸' },
    { id: 2, name: 'ملكة الثلج', price: 320, img: 'https://placehold.co/300x300/e07a5f/fff?text=❄️' },
    { id: 3, name: 'لولو الصغيرة', price: 180, img: 'https://placehold.co/300x300/f8a5a5/fff?text=🎀' },
    { id: 4, name: 'فارس الأحلام', price: 290, img: 'https://placehold.co/300x300/e07a5f/fff?text=🛡️' },
    { id: 5, name: 'جوري الجميلة', price: 210, img: 'https://placehold.co/300x300/f8a5a5/fff?text=🌸' },
    { id: 6, name: 'ملك الغابة', price: 340, img: 'https://placehold.co/300x300/e07a5f/fff?text=🦁' },
];

const DEFAULT_TEXTS = {
    heroTitle: 'Dis Ney – العرائس الفاخرة',
    heroDesc: 'اكتشفي أجمل العرائس والألعاب الأصلية، صناعة يدوية بجودة استثنائية ✨',
    handmadeTitle: 'ركن الأشغال اليدوية',
    productsTitle: 'منتجاتنا الأصلية',
    footerAbout: 'العرائس الفاخرة – منتجات أصلية مصنوعة بحب ❤️',
};

let products = [];
let cart = [];
let texts = {};
let orders = [];
let revenue = 0;
let isLoggedIn = false;
let uploadedImages = [];

// ============================================================
// HELPERS
// ============================================================
function loadData() {
    try {
        const p = localStorage.getItem('disney_products');
        products = p ? JSON.parse(p) : [...DEFAULT_PRODUCTS];
        const c = localStorage.getItem('disney_cart');
        cart = c ? JSON.parse(c) : [];
        const t = localStorage.getItem('disney_texts');
        texts = t ? JSON.parse(t) : { ...DEFAULT_TEXTS };
        const o = localStorage.getItem('disney_orders');
        orders = o ? JSON.parse(o) : [];
        const r = localStorage.getItem('disney_revenue');
        revenue = r ? parseFloat(r) : 0;
        const imgs = localStorage.getItem('disney_images');
        uploadedImages = imgs ? JSON.parse(imgs) : [];
    } catch (e) {
        products = [...DEFAULT_PRODUCTS];
        cart = [];
        texts = { ...DEFAULT_TEXTS };
        orders = [];
        revenue = 0;
        uploadedImages = [];
    }
    for (let key in DEFAULT_TEXTS) {
        if (!(key in texts)) texts[key] = DEFAULT_TEXTS[key];
    }
    saveAll();
}

function saveAll() {
    localStorage.setItem('disney_products', JSON.stringify(products));
    localStorage.setItem('disney_cart', JSON.stringify(cart));
    localStorage.setItem('disney_texts', JSON.stringify(texts));
    localStorage.setItem('disney_orders', JSON.stringify(orders));
    localStorage.setItem('disney_revenue', JSON.stringify(revenue));
    localStorage.setItem('disney_images', JSON.stringify(uploadedImages));
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #2d1f18;
        color: #fff;
        padding: 16px 28px;
        border-radius: 60px;
        font-weight: 700;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        border-right: 6px solid var(--gold);
        animation: slideIn 0.3s ease;
        direction: rtl;
        font-family: 'Cairo', sans-serif;
    `;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.remove(); }, 3000);
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
        <div class="product-card" data-id="${p.id}">
            <img src="${p.img || 'https://placehold.co/300x300/f0eae7/2d1f18?text=🧸'}" alt="${p.name}" class="product-img" loading="lazy" />
            <div class="product-name">${p.name}</div>
            <div class="badge-original"><i class="fas fa-check-circle"></i> أصلي</div>
            <div class="product-price">${p.price} ج.م</div>
            <button class="add-to-cart" data-id="${p.id}"><i class="fas fa-plus-circle"></i> إضافة للسلة</button>
        </div>
    `).join('');
    grid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const id = parseInt(this.dataset.id);
            addToCart(id);
        });
    });
}

function renderHandmade() {
    const grid = document.getElementById('handmadeGrid');
    if (!grid) return;
    const items = [
        { icon: 'fa-hand-sparkles', title: 'دمى يدوية', desc: 'صناعة فريدة بحب', badge: 'صنع يدوي' },
        { icon: 'fa-star', title: 'إصدار محدود', desc: 'عدد محدود جداً', badge: 'محدود' },
        { icon: 'fa-crown', title: 'عرائس فاخرة', desc: 'جودة استثنائية', badge: 'فاخر' },
        { icon: 'fa-gift', title: 'هدايا مميزة', desc: 'مناسبة لكل الأعمار', badge: 'هدية' },
    ];
    grid.innerHTML = items.map(item => `
        <div class="handmade-card">
            <i class="fas ${item.icon}"></i>
            <h4>${item.title}</h4>
            <p style="opacity:0.7;">${item.desc}</p>
            <span class="badge">${item.badge}</span>
        </div>
    `).join('');
}

function renderCart() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCount');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center;padding:30px 0;opacity:0.5;">السلة فارغة 🛒</p>';
        totalEl.textContent = 'الإجمالي: 0 ج.م';
        countEl.textContent = '0';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach((item, index) => {
        const sub = item.price * item.qty;
        total += sub;
        html += `
            <div class="cart-item" data-index="${index}">
                <img src="${item.img || 'https://placehold.co/60x60/f0eae7/2d1f18?text=🧸'}" alt="${item.name}" />
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price} ج.م</div>
                </div>
                <div class="qty-control">
                    <button class="qty-minus" data-index="${index}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-plus" data-index="${index}">+</button>
                </div>
                <span class="remove-item" data-index="${index}"><i class="fas fa-trash-alt"></i></span>
            </div>
        `;
    });
    list.innerHTML = html;
    totalEl.textContent = `الإجمالي: ${total} ج.م`;
    countEl.textContent = cart.reduce((acc, i) => acc + i.qty, 0);

    list.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            if (cart[idx].qty > 1) { cart[idx].qty--; } else { cart.splice(idx, 1); }
            saveAll();
            renderCart();
            renderProducts();
        });
    });
    list.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            cart[idx].qty++;
            saveAll();
            renderCart();
            renderProducts();
        });
    });
    list.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            cart.splice(idx, 1);
            saveAll();
            renderCart();
            renderProducts();
        });
    });
}

function renderDashboard() {
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statOrders').textContent = orders.length;
    document.getElementById('statCustomers').textContent = Math.floor(Math.random() * 20) + 5;
    document.getElementById('statRevenue').textContent = revenue + ' ج.م';

    const list = document.getElementById('dashProductList');
    if (!list) return;
    list.innerHTML = products.map(p => `
        <div class="dash-product-item" data-id="${p.id}">
            <img src="${p.img || 'https://placehold.co/40x40/f0eae7/2d1f18?text=🧸'}" alt="${p.name}" />
            <span class="pname">${p.name} (${p.price} ج.م)</span>
            <button class="edit-btn" data-id="${p.id}"><i class="fas fa-edit"></i></button>
            <button class="del-btn" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    list.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                products = products.filter(p => p.id !== id);
                saveAll();
                renderDashboard();
                renderProducts();
                renderCart();
                showNotification('تم حذف المنتج ✅');
            }
        });
    });
    list.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const p = products.find(pr => pr.id === id);
            if (!p) return;
            const newName = prompt('اسم المنتج الجديد:', p.name);
            if (newName && newName.trim()) p.name = newName.trim();
            const newPrice = prompt('السعر الجديد:', p.price);
            if (newPrice && !isNaN(parseFloat(newPrice))) p.price = parseFloat(newPrice);
            const newImg = prompt('رابط الصورة الجديد (اختياري):', p.img);
            if (newImg !== null) p.img = newImg.trim() || p.img;
            saveAll();
            renderDashboard();
            renderProducts();
            renderCart();
            showNotification('تم تحديث المنتج ✅');
        });
    });

    renderTextsList();
    renderImagesGrid();
}

function renderTextsList() {
    const textsList = document.getElementById('textsList');
    if (!textsList) return;
    textsList.innerHTML = Object.keys(texts).map(key => `
        <li>
            <span>${key}:</span>
            <input type="text" value="${texts[key]}" data-key="${key}" class="text-input" />
            <span class="save-text" data-key="${key}"><i class="fas fa-save"></i></span>
        </li>
    `).join('');
    textsList.querySelectorAll('.save-text').forEach(el => {
        el.addEventListener('click', function() {
            const key = this.dataset.key;
            const input = this.parentElement.querySelector('.text-input');
            if (input) {
                texts[key] = input.value;
                saveAll();
                renderTexts();
                showNotification('تم حفظ النص ✅');
            }
        });
    });
    textsList.querySelectorAll('.text-input').forEach(inp => {
        inp.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const key = this.dataset.key;
                texts[key] = this.value;
                saveAll();
                renderTexts();
                showNotification('تم حفظ النص ✅');
            }
        });
    });
}

function renderImagesGrid() {
    const grid = document.getElementById('imageGrid');
    if (!grid) return;
    if (uploadedImages.length === 0) {
        grid.innerHTML = '<p style="opacity:0.5;grid-column:1/-1;text-align:center;">لا توجد صور مرفوعة</p>';
        return;
    }
    grid.innerHTML = uploadedImages.map((img, index) => `
        <div class="image-item">
            <img src="${img}" alt="صورة ${index + 1}" loading="lazy" />
            <button class="delete-image" data-index="${index}"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
    grid.querySelectorAll('.delete-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index);
            uploadedImages.splice(idx, 1);
            saveAll();
            renderImagesGrid();
            showNotification('تم حذف الصورة 🗑️');
        });
    });
}

function renderTexts() {
    const heroTitle = document.querySelector('.hero h1');
    const heroDesc = document.querySelector('.hero p');
    const handmadeTitle = document.querySelector('.section-title:first-of-type');
    const productsTitle = document.querySelector('#products .section-title');
    const footerAbout = document.querySelector('.footer-grid p');

    if (heroTitle) heroTitle.innerHTML = `<i class="fas fa-crown"></i> ${texts.heroTitle || 'Dis Ney – العرائس الفاخرة'}`;
    if (heroDesc) heroDesc.textContent = texts.heroDesc || 'اكتشفي أجمل العرائس والألعاب الأصلية، صناعة يدوية بجودة استثنائية ✨';
    if (handmadeTitle) handmadeTitle.innerHTML = `<i class="fas fa-hands"></i> ${texts.handmadeTitle || 'ركن الأشغال اليدوية'}`;
    if (productsTitle) productsTitle.innerHTML = `<i class="fas fa-gem"></i> ${texts.productsTitle || 'منتجاتنا الأصلية'}`;
    if (footerAbout) footerAbout.textContent = texts.footerAbout || 'العرائس الفاخرة – منتجات أصلية مصنوعة بحب ❤️';
}

// ============================================================
// CART ACTIONS
// ============================================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveAll();
    renderCart();
    renderProducts();
    document.getElementById('cartOverlay').classList.add('active');
    showNotification('تمت الإضافة إلى السلة 🛍️');
}

// ============================================================
// IMAGE UPLOAD
// ============================================================
function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('imageUpload');
    
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--gold)';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#3d2b22';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3d2b22';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
        fileInput.value = '';
    });
}

function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Compress image (simple resize)
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const maxSize = 800;
                    let width = img.width;
                    let height = img.height;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    uploadedImages.push(dataUrl);
                    saveAll();
                    renderImagesGrid();
                    showNotification('تم رفع الصورة 📸');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
}

// ============================================================
// CHECKOUT
// ============================================================
document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    if (cart.length === 0) { alert('السلة فارغة!'); return; }
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = {
        id: generateId(),
        items: [...cart],
        total: total,
        date: new Date().toLocaleDateString('ar-EG'),
        status: 'قيد المعالجة'
    };
    orders.push(order);
    revenue += total;
    cart = [];
    saveAll();
    renderCart();
    renderProducts();
    renderDashboard();
    document.getElementById('cartOverlay').classList.remove('active');
    showNotification('✅ تم إتمام الشراء بنجاح! شكراً لك ❤️');
    setTimeout(() => {
        showNotification('🔔 طلب جديد للمالك!');
    }, 1000);
});

// ============================================================
// DASHBOARD / LOGIN
// ============================================================
const loginOverlay = document.getElementById('loginOverlay');
const dashboardOverlay = document.getElementById('dashboardOverlay');

document.getElementById('openDashboardBtn')?.addEventListener('click', function() {
    if (isLoggedIn) {
        dashboardOverlay.classList.add('active');
        renderDashboard();
    } else {
        loginOverlay.classList.add('active');
        document.getElementById('loginError').textContent = '';
    }
});

document.getElementById('loginSubmit')?.addEventListener('click', function() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    if (user === 'lolo' && pass === '113114') {
        isLoggedIn = true;
        loginOverlay.classList.remove('active');
        dashboardOverlay.classList.add('active');
        renderDashboard();
        showNotification('مرحباً بك في لوحة التحكم 👑');
    } else {
        document.getElementById('loginError').textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة';
    }
});

document.getElementById('loginPass')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') document.getElementById('loginSubmit').click();
});
document.getElementById('loginUser')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') document.getElementById('loginSubmit').click();
});

document.getElementById('closeDash')?.addEventListener('click', function() {
    dashboardOverlay.classList.remove('active');
});
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    isLoggedIn = false;
    dashboardOverlay.classList.remove('active');
    showNotification('تم تسجيل الخروج 👋');
});

// ============================================================
// ADD PRODUCT (Dashboard)
// ============================================================
document.getElementById('addProductBtn')?.addEventListener('click', function() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value.trim());
    const img = document.getElementById('newProductImg').value.trim();
    if (!name || isNaN(price)) { alert('يرجى إدخال اسم وسعر صحيحين'); return; }
    const newProduct = {
        id: generateId(),
        name: name,
        price: price,
        img: img || 'https://placehold.co/300x300/f0eae7/2d1f18?text=🧸'
    };
    products.push(newProduct);
    saveAll();
    renderDashboard();
    renderProducts();
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductImg').value = '';
    showNotification('تم إضافة المنتج ✅');
});

// ============================================================
// RESTORE TEXTS
// ============================================================
document.getElementById('restoreTextsBtn')?.addEventListener('click', function() {
    if (confirm('سيتم استعادة المسميات الافتراضية. هل أنت متأكد؟')) {
        texts = { ...DEFAULT_TEXTS };
        saveAll();
        renderDashboard();
        renderTexts();
        showNotification('تم استعادة المسميات ✅');
    }
});

// ============================================================
// CLEAR IMAGES
// ============================================================
document.getElementById('clearImagesBtn')?.addEventListener('click', function() {
    if (confirm('هل أنت متأكد من حذف جميع الصور؟')) {
        uploadedImages = [];
        saveAll();
        renderImagesGrid();
        showNotification('تم حذف جميع الصور 🗑️');
    }
});

// ============================================================
// CART SIDEBAR TOGGLE
// ============================================================
document.getElementById('cartIcon')?.addEventListener('click', function() {
    document.getElementById('cartOverlay').classList.toggle('active');
});
document.getElementById('closeCart')?.addEventListener('click', function() {
    document.getElementById('cartOverlay').classList.remove('active');
});
document.getElementById('cartOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
});
document.getElementById('dashboardOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
});

// ============================================================
// NEWSLETTER
// ============================================================
document.getElementById('newsletterBtn')?.addEventListener('click', function() {
    const input = document.getElementById('newsletterEmail');
    if (input && input.value.includes('@')) {
        showNotification('شكراً لاشتراكك في النشرة البريدية 📧');
        input.value = '';
    } else {
        alert('يرجى إدخال بريد إلكتروني صحيح');
    }
});

// ============================================================
// KEYBOARD SHORTCUT: ESC
// ============================================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('cartOverlay').classList.remove('active');
        document.getElementById('dashboardOverlay').classList.remove('active');
        document.getElementById('loginOverlay').classList.remove('active');
    }
});

// ============================================================
// INIT
// ============================================================
loadData();
renderHandmade();
renderProducts();
renderCart();
renderTexts();
setupImageUpload();
if (isLoggedIn) renderDashboard();

console.log('✨ Dis Ney – الموقع جاهز للاستخدام!');
console.log('📸 نظام رفع الصور متاح في لوحة التحكم');
console.log('🔐 تسجيل الدخول: lolo / 113114');
