/*****************************************************************
 * 初始数据
 *****************************************************************/
const defaultProducts = [
  {id:1,name:"ink noise",price:99.99,image:"assets/sprites/inkdoise.png",description:"橡皮管动画制作师",sound:"sfx_noisewoah.ogg",creator:"官方",isCustom:false},
  {id:2,name:"ink doise",price:79.99,image:"assets/sprites/ink noise.png",description:"冒牌货综合症",sound:"sfx_pizzacoin.ogg",creator:"官方",isCustom:false},
  {id:3,name:"ink noise doll",price:149.99,image:"assets/sprites/ink noise doll.png",description:"玩偶",sound:"sfx_noisewoah.ogg",creator:"官方",isCustom:false},
  {id:4,name:"ink noisette",price:199.99,image:"assets/sprites/inknoisette.png",description:"中式餐馆的店主",sound:"sfx_pizzacoin.ogg",creator:"官方",isCustom:false},
  {id:5,name:"inkkino",price:179.99,image:"assets/sprites/inkkino.png",description:"英式意大利餐馆店主",sound:"sfx_pizzacoin.ogg",creator:"官方",isCustom:false},
  {id:6,name:"tetoise",price:129.99,image:"assets/sprites/tetoise.png",description:"七十一搞笑的teto+pizza tower的noise结合体",sound:"sfx_pizzacoin.ogg",creator:"官方",isCustom:false}
];
let products = [...defaultProducts, ...loadCustomProducts()];
let cart = [];
let currentUser = null;
let isAdmin = false;
let money = parseInt(localStorage.getItem("money") || "0");
let perClick = parseInt(localStorage.getItem("perClick") || "1");
let autoClick = parseInt(localStorage.getItem("autoClick") || "0");
let clickPrice = parseInt(localStorage.getItem("clickPrice") || "10");
let autoPrice = parseInt(localStorage.getItem("autoPrice") || "50");
let skinPrice = parseInt(localStorage.getItem("skinPrice") || "100");
let currentSkin = localStorage.getItem("currentSkin") || "";

/*****************************************************************
 * 入口
 *****************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  renderProducts();
  setupCart();
  setupPayment();
  setupCustom();
  setupGroup();
  setupMusic();
  setupTheme();
  setupMoney();
  setupFilter();
  setupFixedCart();
  setInterval(autoEarn, 1000);
});

/*****************************************************************
 * 登录/注册/退出
 *****************************************************************/
function checkAuth() {
  const saved = localStorage.getItem("currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    isAdmin = localStorage.getItem("isAdmin") === "true";
    afterLogin();
  } else showAuthModal();
}
function showAuthModal() {
  const modal = document.getElementById("authModal");
  const form = document.getElementById("authForm");
  const switchBtn = document.getElementById("switchAuthMode");
  let isLogin = true;
  switchBtn.onclick = e => {
    e.preventDefault();
    isLogin = !isLogin;
    document.getElementById("authTitle").textContent = isLogin ? "登录" : "注册";
    switchBtn.textContent = isLogin ? "没有账号？点击注册" : "已有账号？点击登录";
  };
  form.onsubmit = e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    const exist = users.find(u => u.username === username);
    if (isLogin) {
      if (!exist || exist.password !== password) return alert("用户名或密码错误");
      currentUser = exist;
    } else {
      if (exist) return alert("用户名已存在");
      currentUser = {username, password};
      users.push(currentUser);
      localStorage.setItem("users", JSON.stringify(users));
    }
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    afterLogin();
  };
}
function afterLogin() {
  document.getElementById("authModal").style.display = "none";
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("customProductBtn").disabled = false;
  playSound("sfx_noisewoah.ogg");
}
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isAdmin");
  alert("已退出登录");
  location.reload();
};

/*****************************************************************
 * 金币系统
 *****************************************************************/
function setupMoney() {
  updateMoneyBar();
  document.getElementById("petBtn").onclick = () => {
    document.getElementById("earnModal").style.display = "block";
    updateEarnPanel();
  };
  document.getElementById("closeEarnBtn").onclick = () => {
    document.getElementById("earnModal").style.display = "none";
  };
  document.getElementById("petImg").onclick = () => {
    money += perClick;
    localStorage.setItem("money", money);
    updateMoneyBar();
    updateEarnPanel();
    playSound("sfx_pizzacoin.ogg");
    const img = document.getElementById("petImg");
    img.style.transform = "scale(0.9)";
    setTimeout(() => img.style.transform = "scale(1)", 100);
  };
  document.querySelectorAll(".upgrade-btn").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      if (type === "click") {
        if (money < clickPrice) return alert("金币不足");
        money -= clickPrice;
        perClick += 1;
        clickPrice = Math.floor(clickPrice * 1.5);
        localStorage.setItem("money", money);
        localStorage.setItem("perClick", perClick);
        localStorage.setItem("clickPrice", clickPrice);
        updateEarnPanel();
        updateMoneyBar();
      } else if (type === "auto") {
        if (money < autoPrice) return alert("金币不足");
        money -= autoPrice;
        autoClick += 1;
        autoPrice = Math.floor(autoPrice * 1.5);
        localStorage.setItem("money", money);
        localStorage.setItem("autoClick", autoClick);
        localStorage.setItem("autoPrice", autoPrice);
        updateEarnPanel();
        updateMoneyBar();
      } else if (type === "skin") {
        if (money < skinPrice) return alert("金币不足");
        money -= skinPrice;
        // 简单换色：黄色部分换随机色
        const colors = ["#ff0","#f0f","#0ff","#90f","#f90"];
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        currentSkin = newColor;
        localStorage.setItem("money", money);
        localStorage.setItem("currentSkin", currentSkin);
        applySkin();
        updateEarnPanel();
        updateMoneyBar();
      }
    };
  });
  applySkin();
}
function applySkin() {
  if (!currentSkin) return;
  // 把黄色部分换掉（简单示例：给petImg加滤镜）
  document.getElementById("petImg").style.filter = `hue-rotate(${Math.random() * 360}deg)`;
}
function updateMoneyBar() {
  document.getElementById("moneyCount").textContent = money;
}
function updateEarnPanel() {
  document.getElementById("earnCount").textContent = money;
  document.getElementById("perClick").textContent = perClick;
  document.getElementById("autoClick").textContent = autoClick;
  document.getElementById("clickPrice").textContent = clickPrice;
  document.getElementById("autoPrice").textContent = autoPrice;
  document.getElementById("skinPrice").textContent = skinPrice;
}
function autoEarn() {
  if (autoClick > 0) {
    money += autoClick;
    localStorage.setItem("money", money);
    updateMoneyBar();
    if (document.getElementById("earnModal").style.display === "block") updateEarnPanel();
  }
}

/*****************************************************************
 * 筛选
 *****************************************************************/
function setupFilter() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      renderProducts(filter);
    };
  });
}
function renderProducts(filter = "all") {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  let list = products;
  if (filter === "official") list = products.filter(p => !p.isCustom);
  if (filter === "player") list = products.filter(p => p.isCustom);
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" class="product-image"/>
      <div class="product-name">${p.name}</div>
      <div class="product-price">¥${p.price}</div>
      <div class="product-description">${p.description}</div>
      <div class="product-creator">创作者：${p.creator}</div>
      <div class="quantity-selector">
        <button class="quantity-btn" onclick="changeQty(${p.id},-1)">-</button>
        <span id="qty-${p.id}">1</span>
        <button class="quantity-btn" onclick="changeQty(${p.id},+1)">+</button>
      </div>
      <button class="add-to-cart" onclick="addToCart(${p.id})">加入购物车</button>
    `;
    // 删除按钮
    if (isAdmin || (currentUser && p.creator === currentUser.username)) {
      const del = document.createElement("button");
      del.className = "admin-del"; del.textContent = "×";
      del.onclick = e => { e.stopPropagation(); deleteProduct(p.id); };
      card.appendChild(del);
    }
    grid.appendChild(card);
  });
}
window.changeQty = (id, d) => {
  const el = document.getElementById(`qty-${id}`);
  let v = Math.max(1, parseInt(el.textContent) + d);
  el.textContent = v;
};
window.addToCart = id => {
  const qty = parseInt(document.getElementById(`qty-${id}`).textContent);
  const p = products.find(x => x.id === id);
  const ex = cart.find(x => x.id === id);
  if (ex) ex.quantity += qty; else cart.push({...p, quantity: qty});
  updateCartCount();
  playSound(p.sound || "sfx_pizzacoin.ogg");
  // 添加到购物车提示
  showToast(`已添加 ${p.name} x${qty}`);
};
function showToast(msg) {
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:.5rem 1rem;border-radius:20px;z-index:2000;";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}
function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  const custom = loadCustomProducts().filter(p => p.id !== id);
  localStorage.setItem("customProducts", JSON.stringify(custom));
  renderProducts();
}

/*****************************************************************
 * 固定购物车
 *****************************************************************/
function setupFixedCart() {
  const fixed = document.getElementById("fixedCart");
  fixed.onclick = () => {
    renderCart(); document.getElementById("cartModal").style.display = "block";
  };
  updateCartCount();
}
function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  document.getElementById("fixedCount").textContent = count;
  document.getElementById("cartCount").textContent = count;
}

/*****************************************************************
 * 购物车
 *****************************************************************/
function setupCart() {
  document.getElementById("clearCartBtn").onclick = () => {
    cart = []; updateCartCount(); renderCart(); playSound("sfx_ohman.ogg");
  };
  document.getElementById("closeCartBtn").onclick = () => {
    document.getElementById("cartModal").style.display = "none"; playSound("sfx_woosh.ogg");
  };
  document.getElementById("checkoutBtn").onclick = () => {
    if (cart.length === 0) return alert("购物车为空");
    document.getElementById("cartModal").style.display = "none";
    showPaymentModal();
  };
}
function renderCart() {
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (cart.length === 0) {
    box.innerHTML = "<p>购物车是空的</p>"; totalEl.textContent = "0"; return;
  }
  box.innerHTML = cart.map(i => `
    <div class="cart-item"><span>${i.name} x${i.quantity}</span><span>¥${(i.price * i.quantity).toFixed(2)}</span></div>
  `).join("");
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  totalEl.textContent = total.toFixed(2);
}

/*****************************************************************
 * 支付
 *****************************************************************/
function setupPayment() {
  document.getElementById("confirmPayBtn").onclick = handlePay;
  document.getElementById("cancelPayBtn").onclick = () => {
    document.getElementById("paymentModal").style.display = "none"; playSound("sfx_woosh.ogg");
  };
}
function showPaymentModal() {
  const modal = document.getElementById("paymentModal");
  modal.style.display = "block";
  document.getElementById("payPassword").value = "";
  // 清除选中
  document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("selected"));
  selectedPay = null;
}
let selectedPay = null;
document.querySelectorAll(".pay-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPay = btn.dataset.method;
  };
});
function handlePay() {
  const password = document.getElementById("payPassword").value;
  if (password === "I'm ink noise very good") {
    isAdmin = true; localStorage.setItem("isAdmin", "true");
    alert("管理员权限已激活！");
    renderProducts(); document.getElementById("paymentModal").style.display = "none";
    playSound("sfx_thatsprettygood.ogg"); return;
  }
  if (!selectedPay) return alert("请选择支付方式");
  playSound("sfx_pizzafacelaugh2.ogg");
  alert("支付成功！感谢您的购买");
  cart = []; updateCartCount(); document.getElementById("paymentModal").style.display = "none";
}

/*****************************************************************
 * 自定义商品
 *****************************************************************/
function setupCustom() {
  const btn = document.getElementById("customProductBtn");
  const modal = document.getElementById("customProductModal");
  btn.onclick = () => {
    if (!currentUser) return alert("请先登录");
    modal.style.display = "block";
  };
  document.getElementById("customSound").onchange = e => {
    document.getElementById("customSoundFile").style.display = e.target.value === "custom" ? "block" : "none";
  };
  document.getElementById("customProductForm").onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById("customName").value;
    const imageFile = document.getElementById("customImage").files[0];
    const description = document.getElementById("customDescription").value;
    const price = parseFloat(document.getElementById("customPrice").value);
    const maxQty = parseInt(document.getElementById("customMaxQuantity").value) || 10;
    const soundSelect = document.getElementById("customSound").value;
    const soundFile = document.getElementById("customSoundFile").files[0];

    const imageUrl = URL.createObjectURL(imageFile);
    const soundUrl = soundSelect === "custom" && soundFile ? URL.createObjectURL(soundFile) : (soundSelect || "sfx_pizzacoin.ogg");

    const newProduct = { id: Date.now(), name, price, image: imageUrl, description, sound: soundUrl, creator: currentUser.username, maxQuantity: maxQty, isCustom: true };
    products.push(newProduct);
    saveCustomProduct(newProduct);
    renderProducts();
    modal.style.display = "none"; e.target.reset();
    playSound("sfx_thatsprettygood.ogg");
  };
}
function saveCustomProduct(p) {
  const list = loadCustomProducts();
  list.push(p);
  localStorage.setItem("customProducts", JSON.stringify(list));
}
function loadCustomProducts() {
  return JSON.parse(localStorage.getItem("customProducts") || "[]");
}

/*****************************************************************
 * 群聊
 *****************************************************************/
function setupGroup() {
  document.getElementById("joinGroupBtn").onclick = () => {
    playSound("sfx_thatsprettygood.ogg");
    document.getElementById("qqModal").style.display = "block";
  };
  document.getElementById("closeQQBtn").onclick = () => {
    document.getElementById("qqModal").style.display = "none";
  };
}

/*****************************************************************
 * 音乐 & 主题 & 工具
 *****************************************************************/
function setupMusic() {
  const tracks = ["mu_chase.ogg","mu_dungeon.ogg","mu_editor.ogg","mu_noiseentrance.ogg"];
  const src = `assets/music/${tracks[Math.floor(Math.random() * tracks.length)]}`;
  const bg = document.getElementById("bgMusic");
  bg.volume = 0.25; bg.src = src; bg.play().catch(() => {});
}
function setupTheme() {
  const toggle = document.getElementById("themeToggle");
  toggle.onclick = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
    toggle.textContent = dark ? "🌙" : "☀️";
  };
}
function playSound(file) {
  const audio = new Audio(file.startsWith("blob:") ? file : `assets/sound/${file}`);
  audio.volume = 0.4; audio.play().catch(() => {});
}

/*****************************************************************
 * 模态框通用关闭
 *****************************************************************/
document.querySelectorAll(".close").forEach(btn => {
  btn.onclick = () => btn.closest(".modal").style.display = "none";
});
window.onclick = e => {
  if (e.target.classList.contains("modal")) e.target.style.display = "none";
};