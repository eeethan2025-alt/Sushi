// Configuración
const CONFIG = {
  whatsappNumber: "59898258768", // Reemplaza por tu número en formato internacional sin '+'
  callNumber: "59898258768",     // Reemplaza por el mismo número si corresponde
  deliveryFlat: 60,              // costo estimado de delivery (UYU). Puedes ajustar dinámicamente por zona.
  };

// Estado
const state = {
  cart: []
};

// Utilidades
function formatCurrency(value) {
  return `$${value} UYU`;
}
function getCartSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
function updateTotals() {
  const subtotal = getCartSubtotal();
  const delivery = state.cart.length ? CONFIG.deliveryFlat : 0;
  const total = subtotal + delivery;

  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("delivery").textContent = formatCurrency(delivery);
  document.getElementById("total").textContent = formatCurrency(total);
}
function updateCount() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
}
function renderCart() {
  const ul = document.getElementById("cartItems");
  ul.innerHTML = "";
  state.cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">${formatCurrency(item.price)} x <span class="qty">${item.qty}</span></div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-action="dec" data-id="${item.id}">–</button>
        <button class="icon-btn" data-action="inc" data-id="${item.id}">+</button>
        <button class="icon-btn" data-action="del" data-id="${item.id}">✕</button>
      </div>
    `;
    ul.appendChild(li);
  });
  updateTotals();
  updateCount();
}
function addToCart(product) {
  const exists = state.cart.find((i) => i.id === product.id);
  if (exists) {
    exists.qty += 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }
  renderCart();
}
function changeQty(id, delta) {
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((i) => i.id !== id);
  }
  renderCart();
}
function removeItem(id) {
  state.cart = state.cart.filter((i) => i.id !== id);
  renderCart();
}

function isOpenNow() {
  // Chequea si ahora está dentro de alguno de los rangos
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return CONFIG.hours.some(({ start, end }) => current >= start && current <= end);
}
function updateHoursStatus() {
  const el = document.getElementById("hoursStatus");
  const dot = el.querySelector(".dot");
  const text = el.querySelector(".hours-text");
  dot.style.background = isOpenNow() ? "var(--success)" : "var(--muted)";
  dot.style.boxShadow = isOpenNow() ? "0 0 0 3px rgba(42,157,143,0.15)" : "none";
  text.textContent = "Jue a Dom | 19:30–23:30 hs";
}

function buildOrderText() {
  const items = state.cart.map(i => `• ${i.name} x${i.qty} - ${formatCurrency(i.price * i.qty)}`).join("\n");
  const subtotal = formatCurrency(getCartSubtotal());
  const delivery = formatCurrency(state.cart.length ? CONFIG.deliveryFlat : 0);
  const total = formatCurrency(getCartSubtotal() + (state.cart.length ? CONFIG.deliveryFlat : 0));
  const address = document.getElementById("address").value.trim() || "Sin dirección";
  const notes = document.getElementById("notes").value.trim() || "Sin notas";

  return [
    "Pedido Sushi Costa",
    "",
    items || "Sin productos",
    "",
    `Subtotal: ${subtotal}`,
    `Delivery: ${delivery}`,
    `Total: ${total}`,
    "",
    `Dirección: ${address}`,
    `Notas: ${notes}`
  ].join("\n");
}

function openWhatsapp(withSummary = false) {
  const text = buildOrderText();
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`;
  window.open(url, "_blank");
  if (withSummary) closeModal();
}

function renderOrderModal() {
  const modalBody = document.getElementById("orderSummary");
  const list = document.createElement("ul");
  list.className = "order-list";

  state.cart.forEach(item => {
    const row = document.createElement("li");
    row.className = "order-row";
    row.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <strong>${formatCurrency(item.price * item.qty)}</strong>
    `;
    list.appendChild(row);
  });

  const totals = document.createElement("div");
  totals.style.marginTop = "8px";
  totals.innerHTML = `
    <div class="order-row"><span>Subtotal</span><strong>${formatCurrency(getCartSubtotal())}</strong></div>
    <div class="order-row"><span>Delivery</span><strong>${formatCurrency(state.cart.length ? CONFIG.deliveryFlat : 0)}</strong></div>
    <div class="order-row"><span>Total</span><strong>${formatCurrency(getCartSubtotal() + (state.cart.length ? CONFIG.deliveryFlat : 0))}</strong></div>
    <hr />
    <div class="order-row"><span>Dirección</span><strong>${(document.getElementById("address").value || "Sin dirección")}</strong></div>
    <div class="order-row"><span>Notas</span><strong>${(document.getElementById("notes").value || "Sin notas")}</strong></div>
  `;

  modalBody.innerHTML = "";
  modalBody.appendChild(list);
  modalBody.appendChild(totals);
}

function openModal() {
  document.getElementById("orderModal").classList.add("show");
  document.getElementById("orderModal").setAttribute("aria-hidden", "false");
  renderOrderModal();
}
function closeModal() {
  document.getElementById("orderModal").classList.remove("show");
  document.getElementById("orderModal").setAttribute("aria-hidden", "true");
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  // Botón de llamada directa
  const callBtns = [document.getElementById("callNow"), document.getElementById("callFooter")].filter(Boolean);
  callBtns.forEach(btn => {
    btn.href = `tel:${CONFIG.callNumber}`;
  });

  // WhatsApp rápido desde header/footer
  const waQuick = document.getElementById("whatsappQuick");
  if (waQuick) {
    waQuick.addEventListener("click", (e) => {
      e.preventDefault();
      openWhatsapp(false);
    });
  }
  const waFooter = document.getElementById("waFooter");
  if (waFooter) {
    waFooter.addEventListener("click", (e) => {
      e.preventDefault();
      openWhatsapp(false);
    });
  }

  // Filtros por chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const category = chip.dataset.filter;
      chip.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const container = chip.closest(".category");
      container.querySelectorAll(".product-card").forEach(card => {
        const tags = (card.dataset.tags || "all").split(",").map(s => s.trim());
        card.style.display = (category === "all" || tags.includes(category)) ? "" : "none";
      });
    });
  });

  // Agregar al carrito
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        img: btn.dataset.img
      };
      addToCart(product);
    });
  });

  // Acciones del carrito
  document.getElementById("cartItems").addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    if (!action || !id) return;
    if (action === "inc") changeQty(id, +1);
    if (action === "dec") changeQty(id, -1);
    if (action === "del") removeItem(id);
  });

  // Toggle carrito
  const cartToggle = document.getElementById("cartToggle");
  const cartBody = document.getElementById("cartBody");
  cartToggle.addEventListener("click", () => {
    const expanded = cartToggle.getAttribute("aria-expanded") === "true";
    cartToggle.setAttribute("aria-expanded", String(!expanded));
    cartBody.style.display = expanded ? "none" : "block";
  });

  // Revisar pedido (modal)
  document.getElementById("reviewOrder").addEventListener("click", () => {
    openModal();
  });
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("editOrder").addEventListener("click", closeModal);
  document.getElementById("confirmAndSend").addEventListener("click", () => openWhatsapp(true));

  // Realizar pedido directo (WhatsApp)
  document.getElementById("sendWhatsapp").addEventListener("click", () => openWhatsapp(false));

  // Horarios
  updateHoursStatus();
  setInterval(updateHoursStatus, 60 * 1000);

  // Inicial
  renderCart();
});
