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
function goBackFromPage2() {
  if (orderData.selectedProducts.length > 1) {
    orderData.selectedProducts.pop();
    showPage(5);
  } else {
    showPage(1);
  }
}
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

  // Branch
  if (currentProduct.type === 'vase') {
    renderVasePage(currentProduct);
    return;
  } else if (currentProduct.type === 'hand-bouquet') {
    renderHandBouquetPage(currentProduct);
    return;
  } else if (currentProduct.type === 'decoration') {
    renderDecorationPage(currentProduct);
    return;
  } else {
    renderBouquetPage(currentProduct);
    return;
  }
}

function updateCharCount(textarea) {
  textarea.nextElementSibling.textContent = `${textarea.value.length}/300`;
}

function goToPage4() {
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  let allValid = true;

  // Check if it's vase flow
  if (currentProduct.type === 'vase') {
    allValid = validateAndSaveVaseOrder(currentProduct);
    if (!allValid) {
      alert("Please select at least one main flower and fill in Dominant Color for every item.");
      return;
    }
  } else if (currentProduct.type === 'hand-bouquet') {
    allValid = validateAndSaveHandBouquetOrder(currentProduct);
    if (!allValid) {
        alert("Please select a Status and Flower Color for every item.");
        return;
    }
  } else if (currentProduct.type === 'decoration') {
    allValid = validateAndSaveDecorationOrder(currentProduct);
     if (!allValid) {
        alert("Please fill in Warna, list of guest, and event info for every item.");
        return;
    }
  } else {
    // Standard Flow
    allValid = validateAndSaveBouquetOrder(currentProduct);
    if (!allValid) {
      alert("Please fill in Flower Color and select a Wrap Color for every item.");
      return;
    }
  }

  // Setup Page 4 (Delivery)
  // Check if this is the 2nd+ product
  const isFirstProduct = orderData.selectedProducts.length === 1;
  const sameDeliveryGroup = document.getElementById("sameDeliveryGroup");
  const sameDeliveryCheckbox = document.getElementById("sameDelivery");
  
  // Clear previous values if it's a new entry (or reload existing if editing?) 
  document.getElementById("deliveryDate").value = currentProduct.delivery?.date || "";
  document.getElementById("deliveryTime").value = currentProduct.delivery?.time || "";
  document.getElementById("deliveryAddress").value = currentProduct.delivery?.address || "";

  if (!isFirstProduct) {
    sameDeliveryGroup.style.display = "block";
    sameDeliveryCheckbox.checked = false; // Reset by default
    toggleInputState(false); // Enable inputs
  } else {
    sameDeliveryGroup.style.display = "none";
    toggleInputState(false);
  }

  showPage(4);
}

function toggleSameDelivery() {
  const checkbox = document.getElementById("sameDelivery");
  const isChecked = checkbox.checked;
  const firstProd = orderData.selectedProducts[0];

  if (isChecked && firstProd && firstProd.delivery) {
    document.getElementById("deliveryDate").value = firstProd.delivery.date;
    document.getElementById("deliveryTime").value = firstProd.delivery.time;
    document.getElementById("deliveryAddress").value = firstProd.delivery.address;
    toggleInputState(true);
  } else {
    toggleInputState(false);
  }
}

function toggleInputState(disabled) {
  document.getElementById("deliveryDate").disabled = disabled;
  document.getElementById("deliveryTime").disabled = disabled;
  document.getElementById("deliveryAddress").disabled = disabled;
  
  // Visual feedback
  const bg = disabled ? "#f7fafc" : "";
  document.getElementById("deliveryDate").style.backgroundColor = bg;
  document.getElementById("deliveryTime").style.backgroundColor = bg;
  document.getElementById("deliveryAddress").style.backgroundColor = bg;
}

function goToPage5() {
  const dDate = document.getElementById("deliveryDate").value;
  const dTime = document.getElementById("deliveryTime").value;
  const dAddr = document.getElementById("deliveryAddress").value.trim();

  if (!dDate || !dTime || !dAddr) {
    alert("Please fill in Delivery Date, Time, and Address.");
    return;
  }

  // Save to current product
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  
  currentProduct.delivery = {
    date: dDate,
    time: dTime,
    address: dAddr
  };

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

function toggleReviewMode(key) {
  reviewMode[key] = !reviewMode[key];
  renderReviewPage();
}

function goToPage6() {
  reviewMode = {}; 
  renderReviewPage();
  showPage(6);
}

function renderReviewPage() {
  const revDiv = document.getElementById("orderReview");
  let html = renderCustomerSection();
  
  orderData.selectedProducts.forEach((prod, pIdx) => {
    html += renderProductBlock(prod, pIdx);
  });
  
  revDiv.innerHTML = html;
}

function renderCustomerSection() {
  const isEdit = reviewMode['customer'];
  let html = `<div class="review-section">
    <div class="review-header">
      <h3>👤 Customer</h3>
      <button class="edit-btn" onclick="toggleReviewMode('customer')" title="${isEdit ? 'Done' : 'Edit'}">${isEdit ? '❌' : '✏️'}</button>
    </div>`;

  if (isEdit) {
    html += `
      <div class="review-item">
        <label>Name</label>
        <input type="text" value="${orderData.customerName}" oninput="updateOrderData('customerName', this.value)">
      </div>
      <div class="review-item">
        <label>Instagram</label>
        <input type="text" value="${orderData.instagram}" oninput="updateOrderData('instagram', this.value)">
      </div>`;
  } else {
    html += `
      <div class="review-item">Name: ${orderData.customerName}</div>
      <div class="review-item">IG: ${orderData.instagram}</div>`;
  }
  html += `</div>`;
  return html;
}

function renderProductBlock(prod, pIdx) {
  const isEdit = reviewMode[`product-${pIdx}`];
  
  let html = `<div class="review-section">
    <div class="review-header">
      <h3 style="text-transform: capitalize;">📦 ${productEmojis[prod.type]} ${formatName(prod.type)}</h3>
      <button class="edit-btn" onclick="toggleReviewMode('product-${pIdx}')" title="${isEdit ? 'Done' : 'Edit'}">${isEdit ? '❌' : '✏️'}</button>
    </div>`;

  // ITEMS
  html += `<h4 style="margin:8px 0; color:#4a5568;">Items</h4>`;
  prod.sizes.forEach((sz, sIdx) => {
    sz.items.forEach((it, iIdx) => {
      html += `<div class="review-item" style="${isEdit ? 'background:#fff; border:1px solid #e2e8f0;' : ''}">`;
      
      if (prod.type === 'vase') {
          html += getVaseReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx);
      } else if (prod.type === 'hand-bouquet') {
          html += getHandBouquetReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx);
      } else if (prod.type === 'decoration') {
          html += getDecorationReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx);
      } else {
          html += getBouquetReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx);
      }
      html += `</div>`;
    });
  });

  // DELIVERY
  html += `<h4 style="margin:16px 0 8px 0; color:#4a5568;">Delivery</h4>`;
  if (isEdit) {
    html += `
      <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
        <label>Date</label>
        <input type="date" value="${prod.delivery.date}" onchange="updateProductDelivery(${pIdx}, 'date', this.value)">
      </div>
      <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
        <label>Time</label>
        <input type="time" value="${prod.delivery.time}" step="60" onchange="updateProductDelivery(${pIdx}, 'time', this.value)">
      </div>
      <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
        <label>Address</label>
        <textarea rows="3" oninput="updateProductDelivery(${pIdx}, 'address', this.value)">${prod.delivery.address}</textarea>
      </div>`;
  } else {
     html += `
      <div class="review-item">Date: ${prod.delivery.date}</div>
      <div class="review-item">Time: ${formatTime(prod.delivery.time)}</div>
      <div class="review-item">Address: ${prod.delivery.address}</div>`;
  }

  html += `</div>`;
  return html;
}

function updateProductDelivery(pIdx, field, value) {
  orderData.selectedProducts[pIdx].delivery[field] = value;
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
}

function updateOrderData(field, value) {
  orderData[field] = value;
}

function updateItemData(pIdx, sIdx, iIdx, field, value) {
  orderData.selectedProducts[pIdx].sizes[sIdx].items[iIdx][field] = value;
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
  
  // Handle Page 3 variants
  if (num === 3) {
      const currentProduct = orderData.selectedProducts[orderData.selectedProducts.length - 1];
      if (currentProduct && currentProduct.type === 'vase') {
          document.getElementById('page3-vase').classList.add("active");
      } else {
          document.getElementById('page3').classList.add("active");
      }
  } else {
      const page = document.getElementById(`page${num}`);
      if (page) page.classList.add("active");
  }
  
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
        if (prod.type === 'vase') {
             const flowersStr = Object.entries(it.mainFlowers || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
             message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${sz.size}) - Main Flowers: ${flowersStr} - Color: ${it.color}`;
        } else if (prod.type === 'hand-bouquet') {
             message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${sz.size}) - Status: ${it.status} - Color: ${it.color}`;
        } else if (prod.type === 'decoration') {
             const ev = it.eventType === 'Other' ? it.eventDetail : it.eventType;
              message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${sz.size}) - Event: ${ev} - Color: ${it.color}\nGuests: ${it.guestList}`;
        } else {
             message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${sz.size}) - Flower Color: ${it.color} - Wrap: ${it.wrapColor}`;
        }
        
        if (it.greeting) message += ` - Greeting: "${it.greeting}"`;
        message += "\n";
      });
    });
    // Add delivery info for this product
    message += `Delivery: ${prod.delivery.date} at ${formatTime(prod.delivery.time)} to ${prod.delivery.address}\n`;
    message += "----------------\n";
  });

  // Encode message
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/6285822220904?text=${encodedMessage}`;

  // Open WhatsApp
  const btn = document.getElementById("whatsappBtn");
  btn.onclick = function() {
    window.open(whatsappUrl, '_blank');
  };
}
