const products = [
  {id:1,name:"Arroz familiar 2 kg",category:"Abarrotes",price:2.85,icon:"🍚",tag:"Popular"},
  {id:2,name:"Aceite vegetal 1 L",category:"Abarrotes",price:2.10,icon:"🫒",tag:"Ahorro"},
  {id:3,name:"Leche entera 1 L",category:"Bebidas",price:1.15,icon:"🥛",tag:""},
  {id:4,name:"Jugo de naranja 1 L",category:"Bebidas",price:1.65,icon:"🧃",tag:""},
  {id:5,name:"Detergente familiar",category:"Limpieza",price:3.40,icon:"🧼",tag:"Oferta"},
  {id:6,name:"Lavavajillas",category:"Limpieza",price:1.75,icon:"🫧",tag:""},
  {id:7,name:"Papel higiénico 4 rollos",category:"Hogar",price:2.60,icon:"🧻",tag:""},
  {id:8,name:"Galletas surtidas",category:"Abarrotes",price:1.20,icon:"🍪",tag:"Nuevo"}
];
let cart = [];
let activeCategory = "Todos";
let searchTerm = "";

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");

function money(value){ return "$" + value.toFixed(2); }

function renderProducts(){
  const shown = products.filter(p =>
    (activeCategory === "Todos" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm)
  );
  productGrid.innerHTML = shown.map(p => `
    <article class="product-card">
      <div class="product-image">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
        <span aria-hidden="true">${p.icon}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <div class="product-quantity" aria-label="Cantidad de ${p.name}">
            <button class="qty-btn qty-minus" data-card-change="-1" data-id="${p.id}" aria-label="Quitar una unidad de ${p.name}" ${((cart.find(item => item.id === p.id)?.quantity || 0) === 0) ? "disabled" : ""}>−</button>
            <span class="qty-value">${cart.find(item => item.id === p.id)?.quantity || 0}</span>
            <button class="qty-btn qty-plus" data-card-change="1" data-id="${p.id}" aria-label="Agregar una unidad de ${p.name}">+</button>
          </div>
        </div>
      </div>
    </article>`).join("");
  emptyState.hidden = shown.length !== 0;
}

function renderCart(){
  const count = cart.reduce((sum,item) => sum + item.quantity,0);
  const total = cart.reduce((sum,item) => sum + item.price * item.quantity,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("checkoutButton").disabled = count === 0;
  const container = document.getElementById("cartItems");
  if(!cart.length){
    container.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.icon}</div>
      <div>
        <h4>${item.name}</h4>
        <small>${money(item.price)} por unidad</small>
        <div class="quantity">
          <button data-change="-1" data-id="${item.id}" aria-label="Quitar uno">−</button>
          <span>${item.quantity}</span>
          <button data-change="1" data-id="${item.id}" aria-label="Agregar uno">+</button>
        </div>
      </div>
      <span class="cart-item-price">${money(item.price * item.quantity)}</span>
    </div>`).join("");
}

let toastTimer;
function showCartToast(message){
  const toast = document.getElementById("cartToast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function addToCart(id){
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if(existing) existing.quantity++;
  else cart.push({...product,quantity:1});
  renderCart();
  showCartToast(product.name + " agregado al carrito ✓");
}

function changeQuantity(id,amount){
  const item = cart.find(p => p.id === id);
  if(!item) return;
  item.quantity += amount;
  if(item.quantity <= 0) cart = cart.filter(p => p.id !== id);
  renderCart();
}

function openCart(){
  cartPanel.classList.add("open");
  overlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden","false");
}
function closeCart(){
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden","true");
}

productGrid.addEventListener("click",event => {
  const button = event.target.closest("[data-card-change]");
  if(!button) return;
  const id = Number(button.dataset.id);
  const amount = Number(button.dataset.cardChange);
  if(amount > 0) addToCart(id);
  else changeQuantity(id, amount);
  renderProducts();
});
document.getElementById("cartItems").addEventListener("click",event => {
  const button = event.target.closest("[data-change]");
  if(button) {
    changeQuantity(Number(button.dataset.id),Number(button.dataset.change));
    renderProducts();
  }
});
document.getElementById("filters").addEventListener("click",event => {
  const button = event.target.closest("[data-category]");
  if(!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active",b === button));
  renderProducts();
});
document.getElementById("searchForm").addEventListener("submit",event => {
  event.preventDefault();
  searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  renderProducts();
  document.getElementById("productos").scrollIntoView({behavior:"smooth"});
});
document.getElementById("searchInput").addEventListener("input",event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);

const modal = document.getElementById("checkoutModal");
document.getElementById("checkoutButton").addEventListener("click",() => {
  if(!cart.length) return;
  const total = cart.reduce((sum,item) => sum + item.price * item.quantity,0);
  const count = cart.reduce((sum,item) => sum + item.quantity,0);
  document.getElementById("orderSummary").textContent = `Has agregado ${count} producto(s), con un total de ${money(total)}.`;
  closeCart();
  modal.classList.add("show");
});
function closeModal(){modal.classList.remove("show");}
document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("finishOrder").addEventListener("click",() => {
  cart = [];
  renderCart();
  closeModal();
});
renderProducts();
renderCart();


/* Acceso de demostración: valida los campos y revela la tienda */
const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  loginScreen.classList.add("login-hidden");
  appContent.classList.add("app-visible");
  document.body.classList.add("app-unlocked");
  window.scrollTo({top:0,behavior:"instant"});
});
