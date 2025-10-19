const PRODUCTS_URL = 'data/products.json';
const STORAGE_KEY = 'dulceAlaska_cart_v1';

// Estado
let products = []; 
let cart = [];    

const $ = (selector) => document.querySelector(selector);
const formatCurrency = (n) => n.toFixed(2);

// Guardar/recuperar carrito de localStorage
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  cart = raw ? JSON.parse(raw) : [];
}

// Buscar producto por id
function findProduct(id) {
  return products.find(p => p.id === id);
}

function renderProducts() {
  const container = $('#products');
  container.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h4>${p.name}</h4>
      <p class="desc">${p.desc}</p>
      <p class="price">$${formatCurrency(p.price)}</p>
      <p>Stock: ${p.stock}</p>
      <div>
        <input type="number" min="1" max="${p.stock}" value="1" data-id="${p.id}" class="qty-input" aria-label="cantidad ${p.name}" />
        <button class="btn add-to-cart" data-id="${p.id}">Agregar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCart() {
  const container = $('#cart');
  container.innerHTML = '';
  if (cart.length === 0) {
    container.innerHTML = '<p>Carrito vacío</p>';
  } else {
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.dataset.id = item.id;
      div.innerHTML = `
        <div class="meta">
          <strong>${item.name}</strong>
          <div>Cantidad: <span class="item-qty">${item.qty}</span></div>
          <div>Subtotal: $<span class="item-sub">${formatCurrency(item.qty * item.price)}</span></div>
        </div>
        <div class="controls">
          <button class="btn secondary decrease" data-id="${item.id}">-</button>
          <button class="btn secondary increase" data-id="${item.id}">+</button>
          <button class="btn secondary remove" data-id="${item.id}">Eliminar</button>
        </div>
      `;
      container.appendChild(div);
    });
  }
  const total = cart.reduce((s, it) => s + it.qty * it.price, 0);
  $('#cart-total').textContent = formatCurrency(total);
  saveCart();
}

// --- Lógica del carrito ---
function addToCart(id, qty) {
  const product = findProduct(id);
  if (!product) return;
  const existing = cart.find(it => it.id === id);
  const qtyNumber = Number(qty);
  if (existing) {
    const newQty = existing.qty + qtyNumber;
    existing.qty = Math.min(newQty, product.stock);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: Math.min(qtyNumber, product.stock) });
  }
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(it => it.id === id);
  if (!item) return;
  const product = findProduct(id);
  item.qty = Math.max(1, Math.min(item.qty + delta, product.stock));
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(it => it.id !== id);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

// --- Eventos ---
function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
      const id = Number(addBtn.dataset.id);
      const qtyInput = document.querySelector(`.qty-input[data-id="${id}"]`);
      const qty = qtyInput ? Number(qtyInput.value) : 1;
      addToCart(id, qty);
    }

    const removeBtn = e.target.closest('.remove');
    if (removeBtn) removeItem(Number(removeBtn.dataset.id));
    const inc = e.target.closest('.increase');
    if (inc) changeQty(Number(inc.dataset.id), +1);
    const dec = e.target.closest('.decrease');
    if (dec) changeQty(Number(dec.dataset.id), -1);
  });

  $('#clear-cart').addEventListener('click', () => clearCart());

  $('#checkout-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = $('#customer-name').value.trim();
    const email = $('#customer-email').value.trim();
    const msg = $('#checkout-msg');

    if (cart.length === 0) {
      msg.style.color = 'crimson';
      msg.textContent = 'El carrito está vacío. Agrega productos antes de finalizar.';
      return;
    }
    if (name.length < 2 || !email.includes('@')) {
      msg.style.color = 'crimson';
      msg.textContent = 'Por favor completa nombre y correo válidos.';
      return;
    }

    const order = {
      date: new Date().toISOString(),
      customer: { name, email },
      items: cart.slice(),
      total: cart.reduce((s, it) => s + it.qty * it.price, 0)
    };

    localStorage.setItem('dulceAlaska_lastOrder', JSON.stringify(order));

    msg.style.color = 'green';
    msg.textContent = `Pedido simulado. Total: $${formatCurrency(order.total)}. Gracias ${name}!`;

    clearCart();
    $('#checkout-form').reset();
  });
}

// --- Inicialización ---
async function init() {
  try {
    const res = await fetch(PRODUCTS_URL);
    products = await res.json();
  } catch (err) {
    console.error('Error cargando productos', err);
    products = [];
  }

  loadCart();
  renderProducts();
  renderCart();
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
