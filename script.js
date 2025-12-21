// Variables
let currentPage = 1;
let orderData = {
  customerName: "",
  instagram: "",
  selectedProducts: [],
  deliveryDate: "",
  deliveryAddress: "",
};

const productSizes = {
  bouquet: ["Petite", "Midi", "Largo", "Grande", "Human size"],
  vase: ["Petite", "Midi", "Largo", "Grande", "Gardenia"],
  signature: ["Yoona", "Marii", "Bomi", "Bloom box", "Acrylic Bloom box"],
  "hand-bouquet": ["Petite", "Midi", "Largo"],
  decoration: ["Table Decoration"],
};

const productEmojis = {
  bouquet: "💐",
  "hand-bouquet": "🌹",
  vase: "🏺",
  decoration: "🎀",
  signature: "✨",
};

const colorOptions = [
  "Red",
  "Blue",
  "Pink",
  "White",
  "Yellow",
  "Purple",
  "Mixed",
];

// Init
document.addEventListener("DOMContentLoaded", function () {
  console.log("App initialized.");

  // Handle click
  const cards = document.querySelectorAll("#productGrid .product-card");
  cards.forEach((card) => {
    card.addEventListener("click", function () {
      cards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  updateProgressBar(1);
});

// Navigation
function goToPage2() {
  const name = document.getElementById("customerName").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const selectedCard = document.querySelector(
    "#productGrid .product-card.selected"
  );

  if (!name || !instagram) {
    alert("Please enter your Name and Instagram handle.");
    return;
  }
  if (!selectedCard) {
    alert("Please select a product type.");
    return;
  }

  orderData.customerName = name;
  orderData.instagram = instagram;

  const productType = selectedCard.dataset.product;
  // Add new product or update existing last entry
  const currentProduct = { type: productType, sizes: [] };

  if (orderData.selectedProducts.length === 0) {
    orderData.selectedProducts.push(currentProduct);
  } else {
    orderData.selectedProducts[orderData.selectedProducts.length - 1] =
      currentProduct;
  }

  // Generate size options
  const sizeOptionsDiv = document.getElementById("sizeOptions");
  sizeOptionsDiv.innerHTML = "";

  productSizes[productType].forEach((size) => {
    const sizeDiv = document.createElement("div");
    sizeDiv.className = "size-item";
    sizeDiv.innerHTML = `
            <div class="size-img">${productEmojis[productType]}</div>
            <div class="size-info">
              <div class="size-name">${size}</div>
              <div class="quantity-control">
                <button class="qty-btn" onclick="changeQty('${size}', -1)">−</button>
                <div class="qty-display" id="qty-${size}">0</div>
                <button class="qty-btn" onclick="changeQty('${size}', 1)">+</button>
              </div>
            </div>`;
    sizeOptionsDiv.appendChild(sizeDiv);
  });

  showPage(2);
}

function changeQty(size, delta) {
  const qtyEl = document.getElementById(`qty-${size}`);
  let qty = parseInt(qtyEl.textContent) || 0;
  qty = Math.max(0, qty + delta);
  qtyEl.textContent = qty;
}

function goToPage3() {
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const sizes = productSizes[currentProduct.type];

  currentProduct.sizes = [];

  sizes.forEach((size) => {
    const qtyEl = document.getElementById(`qty-${size}`);
    const qty = parseInt(qtyEl ? qtyEl.textContent : 0) || 0;
    if (qty > 0) {
      currentProduct.sizes.push({ size, quantity: qty, items: [] });
    }
  });

  if (currentProduct.sizes.length === 0) {
    alert("Please select at least one item quantity.");
    return;
  }

  const specDiv = document.getElementById("orderSpecifications");
  specDiv.innerHTML = "";

  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    for (let i = 0; i < sizeObj.quantity; i++) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";

      const buttonsHtml = colorOptions
        .map(
          (color) =>
            `<button class="color-btn" onclick="selectColor(this)">${color}</button>`
        )
        .join("");

      itemDiv.innerHTML = `
              <div class="order-item-header">${currentProduct.type} - ${
        sizeObj.size
      } (Item #${i + 1})</div>
              <label>Color *</label>
              <div class="color-options" id="colors-${sizeIdx}-${i}">${buttonsHtml}</div>
              <div class="greeting-card">
                <label>Greeting Card (Optional)</label>
                <textarea rows="2" maxlength="300" id="greeting-${sizeIdx}-${i}" 
                  placeholder="Message..." oninput="updateCharCount(this)"></textarea>
                <div class="char-count">0/300</div>
              </div>`;
      specDiv.appendChild(itemDiv);
    }
  });

  showPage(3);
}

function selectColor(btn) {
  btn.parentElement
    .querySelectorAll(".color-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function updateCharCount(textarea) {
  textarea.nextElementSibling.textContent = `${textarea.value.length}/300`;
}

function goToPage4() {
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  let allValid = true;

  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    sizeObj.items = [];
    for (let i = 0; i < sizeObj.quantity; i++) {
      const colorContainer = document.getElementById(`colors-${sizeIdx}-${i}`);
      const selectedBtn = colorContainer.querySelector(".selected");
      const greeting = document
        .getElementById(`greeting-${sizeIdx}-${i}`)
        .value.trim();

      if (!selectedBtn) {
        allValid = false;
      } else {
        sizeObj.items.push({
          color: selectedBtn.textContent,
          greeting: greeting,
        });
      }
    }
  });

  if (!allValid) {
    alert("Please select a color for every item.");
    return;
  }
  showPage(4);
}

function goToPage5() {
  const dDate = document.getElementById("deliveryDate").value;
  const dAddr = document.getElementById("deliveryAddress").value.trim();

  if (!dDate || !dAddr) {
    alert("Please fill in Delivery Date and Address.");
    return;
  }

  orderData.deliveryDate = dDate;
  orderData.deliveryAddress = dAddr;

  // Show additional products
  const selectedTypes = orderData.selectedProducts.map((p) => p.type);
  const allProducts = [
    "bouquet",
    "hand-bouquet",
    "vase",
    "decoration",
    "signature",
  ];
  const available = allProducts.filter((p) => !selectedTypes.includes(p));

  const addDiv = document.getElementById("additionalProducts");
  addDiv.innerHTML = "";

  if (available.length === 0) {
    addDiv.innerHTML = "<p>You have selected all types!</p>";
  } else {
    available.forEach((prod) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `<div class="product-img">${
        productEmojis[prod]
      }</div><div>${formatName(prod)}</div>`;
      card.onclick = function () {
        orderData.selectedProducts.push({ type: prod, sizes: [] });
        // Re-trigger page 2 setup manually
        const sizes = productSizes[prod];
        const sizeDiv = document.getElementById("sizeOptions");
        sizeDiv.innerHTML = "";
        sizes.forEach((size) => {
          sizeDiv.innerHTML += `
                  <div class="size-item">
                    <div class="size-img">${productEmojis[prod]}</div>
                    <div class="size-info">
                      <div class="size-name">${size}</div>
                      <div class="quantity-control">
                        <button class="qty-btn" onclick="changeQty('${size}', -1)">−</button>
                        <div class="qty-display" id="qty-${size}">0</div>
                        <button class="qty-btn" onclick="changeQty('${size}', 1)">+</button>
                      </div>
                    </div>
                  </div>`;
        });
        showPage(2);
      };
      addDiv.appendChild(card);
    });
  }
  showPage(5);
}

function formatName(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function goToPage6() {
  const revDiv = document.getElementById("orderReview");
  let html = `<div class="review-section"><h3>👤 Customer</h3>
          <div class="review-item">Name: ${orderData.customerName}</div>
          <div class="review-item">IG: ${orderData.instagram}</div></div>
          <div class="review-section"><h3>🛍️ Items</h3>`;

  orderData.selectedProducts.forEach((prod) => {
    prod.sizes.forEach((sz) => {
      sz.items.forEach((it) => {
        html += `<div class="review-item"><strong>${
          productEmojis[prod.type]
        } ${formatName(prod.type)} (${sz.size})</strong><br>Color: ${it.color}`;
        if (it.greeting) html += `<br><i>"${it.greeting}"</i>`;
        html += `</div>`;
      });
    });
  });

  html += `</div><div class="review-section"><h3>🚚 Delivery</h3>
          <div class="review-item">Date: ${orderData.deliveryDate}</div>
          <div class="review-item">Address: ${orderData.deliveryAddress}</div></div>`;

  revDiv.innerHTML = html;
  showPage(6);
}

function submitOrder() {
  const btn = document.getElementById("btnSubmit");
  const err = document.getElementById("errorMsg");
  btn.disabled = true;
  btn.innerText = "Processing...";
  err.innerHTML = "";

  // Back End Sheet
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzb_KW-89KZSY3_R4H_VqqOJ3Bh19Sv3aUBzpGaTUIjN7VAYjmI97WZ-DLjgol0YZ83fQ/exec";

  // Append data to sheet
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(orderData),
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(() => {
      prepareWhatsApp();
      showPage(7);
      btn.innerText = "Confirm Order";
      btn.disabled = false;
    })
    .catch((error) => {
      err.innerText = "Network Error. Please try again.";
      console.error(error);
      btn.disabled = false;
      btn.innerText = "Confirm Order";
    });
}

function showPage(num) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(`page${num}`).classList.add("active");
  currentPage = num;
  updateProgressBar(num);
  window.scrollTo(0, 0);
}

function updateProgressBar(num) {
  document.getElementById("progressBar").style.width = (num / 7) * 100 + "%";
}

function prepareWhatsApp() {
  // Order summary
  let message = `New Order from ${orderData.customerName} (@${orderData.instagram})\n\n`;
  message += "Items:\n";
  orderData.selectedProducts.forEach((prod) => {
    prod.sizes.forEach((sz) => {
      sz.items.forEach((it, idx) => {
        message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${sz.size}) - Color: ${it.color}`;
        if (it.greeting) message += ` - Greeting: "${it.greeting}"`;
        message += "\n";
      });
    });
  });
  message += `\nDelivery: ${orderData.deliveryDate} to ${orderData.deliveryAddress}`;

  // Encode message
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/6285822220904?text=${encodedMessage}`;

  // Open WhatsApp
  const btn = document.getElementById("whatsappBtn");
  btn.onclick = function() {
    window.open(whatsappUrl, '_blank');
  };
}
