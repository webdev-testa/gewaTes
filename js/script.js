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
  // Reset Header to default (in case Decoration flow changed it)
  document.querySelector("#page2 h1").innerText = "Select Sizes";
  document.querySelector("#page2 .description").innerText =
    "Choose the sizes and quantities you'd like to order.";

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
  // Reset class to default grid
  sizeOptionsDiv.className = "size-options";

  // Set Theme
  setTheme(productType);

  renderSizeOptionsHTML(sizeOptionsDiv, productType);

  // Intercept for Decoration Flow
  if (productType === "decoration") {
    renderDecorationPage2(); // Defined in decoration-flow.js
    return;
  }

  showPage(2);
}

function setTheme(type) {
  if (type) {
    document.body.setAttribute("data-theme", type);
  } else {
    document.body.removeAttribute("data-theme");
  }
}

function changeQty(size, delta) {
  const qtyEl = document.getElementById(`qty-${size}`);
  let qty = parseInt(qtyEl.value) || 0;
  qty = Math.max(0, qty + delta);
  qtyEl.value = qty;
}

function manualQtyChange(size, val) {
  const qtyEl = document.getElementById(`qty-${size}`);
  let qty = parseInt(val) || 0;
  qty = Math.max(0, qty); // Ensure not negative
  qtyEl.value = qty;
}

function goToPage3() {
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const sizes = productSizes[currentProduct.type];

  currentProduct.sizes = [];

  sizes.forEach((size) => {
    const qtyEl = document.getElementById(`qty-${size}`);
    const qty = parseInt(qtyEl ? qtyEl.value : 0) || 0;
    if (qty > 0) {
      currentProduct.sizes.push({ size, quantity: qty, items: [] });
    }
  });

  // Intercept for Decoration Flow
  if (currentProduct.type === "decoration") {
    handleDecorationPage2Next(currentProduct);
    return;
  }

  if (currentProduct.sizes.length === 0) {
    alert("Please select at least one item quantity.");
    return;
  }

  // Branch
  if (currentProduct.type === "vase") {
    renderVasePage(currentProduct);
    return;
  } else if (currentProduct.type === "hand-bouquet") {
    renderHandBouquetPage(currentProduct);
    return;
  } else if (currentProduct.type === "decoration") {
    renderDecorationPage(currentProduct);
    return;
  } else if (currentProduct.type === "signature") {
    renderSignaturePage(currentProduct);
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
  if (currentProduct.type === "vase") {
    allValid = validateAndSaveVaseOrder(currentProduct);
    if (!allValid) {
      alert(
        "Please select at least one main flower and fill in Dominant Color for every item."
      );
      return;
    }
  } else if (currentProduct.type === "hand-bouquet") {
    allValid = validateAndSaveHandBouquetOrder(currentProduct);
    if (!allValid) {
      alert("Please select a Status and Flower Color for every item.");
      return;
    }
  } else if (currentProduct.type === "decoration") {
    allValid = validateAndSaveDecorationOrder(currentProduct);
    if (!allValid) {
      alert(
        "Please fill in Warna, list of guest, and event info for every item."
      );
      return;
    }
  } else if (currentProduct.type === "signature") {
    allValid = validateAndSaveSignatureOrder(currentProduct);
    if (!allValid) {
      alert(
        "Please complete all required fields (Flower/Basket/Color) for your Signature items."
      );
      return;
    }
  } else {
    // Standard Flow
    allValid = validateAndSaveBouquetOrder(currentProduct);
    if (!allValid) {
      alert(
        "Please fill in Flower Color and select a Wrap Color for every item."
      );
      return;
    }
  }

  // Setup Page 4 (Delivery)

  // Set min date to today for native date input
  const dateInput = document.getElementById("deliveryDate");
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Set Info Text
  const infoEl = document.getElementById("deliveryDateInfo");
  if (
    currentProduct.type === "hand-bouquet" ||
    currentProduct.type === "decoration"
  ) {
    infoEl.innerText =
      "Pre Order H-7. Jika kurang dari itu (maksimal H-5) dikenakan additional service fee IDR 35K/hari. Harap konfirmasi kestersediaan dengan admin By Gewa.";
  } else {
    infoEl.innerText =
      "Pre Order H-3. Jika kurang dari itu, diharap konfirmasi kestersediaan dengan admin By Gewa.";
  }

  // Check if this is the 2nd+ product
  const isFirstProduct = orderData.selectedProducts.length === 1;
  const sameDeliveryGroup = document.getElementById("sameDeliveryGroup");
  const sameDeliveryCheckbox = document.getElementById("sameDelivery");

  // Clear previous values if it's a new entry (or reload existing if editing?)
  document.getElementById("deliveryDate").value =
    currentProduct.delivery?.date || "";
  document.getElementById("deliveryTime").value =
    currentProduct.delivery?.time || "";

  // Handle Address Fields
  const stdAddrGroup = document.getElementById("std-address-group");
  const decAddrGroup = document.getElementById("decorationDeliveryFields");

  if (currentProduct.type === "decoration") {
    stdAddrGroup.style.display = "none";
    decAddrGroup.style.display = "block";

    // Try to parse existing address if it exists
    let venue = "",
      vAddr = "",
      vFloor = "",
      vRoom = "";
    try {
      if (currentProduct.delivery?.address) {
        const parsed = JSON.parse(currentProduct.delivery.address);
        venue = parsed.venue || "";
        vAddr = parsed.address || "";
        vFloor = parsed.floor || "";
        vRoom = parsed.room || "";
      }
    } catch (e) {
      // Fallback if not JSON (legacy or error)
      venue = currentProduct.delivery?.address || "";
    }

    document.getElementById("decVenueName").value = venue;
    document.getElementById("decVenueAddress").value = vAddr;
    document.getElementById("decVenueFloor").value = vFloor;
    document.getElementById("decVenueRoom").value = vRoom;
  } else {
    stdAddrGroup.style.display = "block";
    decAddrGroup.style.display = "none";
    document.getElementById("deliveryAddress").value =
      currentProduct.delivery?.address || "";
  }

  if (!isFirstProduct) {
    sameDeliveryGroup.style.display = "block";
    sameDeliveryCheckbox.checked = false; // Reset by default
    toggleInputState(false); // Enable inputs
    const addr = currentProduct.delivery?.address;
    if (!addr && window.resetMap) {
      window.resetMap();
    }
  } else {
    sameDeliveryGroup.style.display = "none";
    toggleInputState(false);
    if (!currentProduct.delivery?.address && window.resetMap) {
      window.resetMap();
    }
  }

  showPage(4);

  if (window.refreshMap) {
    window.refreshMap();
  }

  // Initial render of delivery options if address exists
  // For standard flow (not decoration)
  if (currentProduct.type !== "decoration") {
    const addr = currentProduct.delivery?.address;
    if (addr) {
      renderDeliveryOptions(addr);
    } else {
      // Ensure hidden if no address
      renderDeliveryOptions("");
    }
  }
}

function toggleSameDelivery() {
  const checkbox = document.getElementById("sameDelivery");
  const isChecked = checkbox.checked;
  const firstProd = orderData.selectedProducts[0];

  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const manualToggle = document.getElementById("manualAddressToggle");
  const manualInput = document.getElementById("deliveryAddress");

  if (isChecked && firstProd && firstProd.delivery) {
    // Fill values
    document.getElementById("deliveryDate").value = firstProd.delivery.date;
    document.getElementById("deliveryTime").value = firstProd.delivery.time;

    // Disable Date/Time interactions
    toggleInputState(true);

    const addr = firstProd.delivery.address;

    // For Decoration flow, we might need to parse, but usually we just fill the fields
    if (currentProduct.type === "decoration") {
      // Re-use logic to fill venue fields
      try {
        const parsed = JSON.parse(addr);
        document.getElementById("decVenueName").value = parsed.venue || "";
        document.getElementById("decVenueAddress").value = parsed.address || "";
        document.getElementById("decVenueFloor").value = parsed.floor || "";
        document.getElementById("decVenueRoom").value = parsed.room || "";
      } catch (e) {
        document.getElementById("decVenueAddress").value = addr;
      }
    } else {
      // Standard flow
      document.getElementById("deliveryAddress").value = addr;

      // Auto-check "I want to correct manualy" so the textarea is shown
      if (manualToggle) {
        manualToggle.checked = true;
        // We need to trigger the UI update that toggleManualAddress does
        if (window.toggleManualAddress) {
          window.toggleManualAddress();
        } else {
          // Fallback if function not accessible (though it should be)
          if (manualInput) manualInput.style.display = "block";
          const displayEl = document.getElementById("selectedAddressDisplay");
          if (displayEl) displayEl.style.display = "none";
        }
      }
    }
  } else {
    toggleInputState(false);

    if (manualToggle) {
      manualToggle.checked = false;
      if (window.toggleManualAddress) window.toggleManualAddress();
    }
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

  // Address Handling
  let dAddr = "";
  const currentProd =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];

  if (currentProd.type === "decoration") {
    const vName = document.getElementById("decVenueName").value.trim();
    const vAddr = document.getElementById("decVenueAddress").value.trim();
    const vFloor = document.getElementById("decVenueFloor").value.trim();
    const vRoom = document.getElementById("decVenueRoom").value.trim();

    if (!vName || !vAddr) {
      // Floor and Room strictly required? Maybe just warnings or assume required based on 'Alamat Venue *' label implies structure
      alert("Please fill in Venue Name and Address.");
      return;
    }

    // Store as JSON
    dAddr = JSON.stringify({
      venue: vName,
      address: vAddr,
      floor: vFloor,
      room: vRoom,
    });
  } else {
    if (window.getFinalDeliveryAddress) {
      dAddr = window.getFinalDeliveryAddress();
    } else {
      dAddr = document.getElementById("deliveryAddress").value.trim();
    }
    if (!dAddr) {
      alert("Please fill in Delivery Address.");
      return;
    }
  }

  if (!dDate || !dTime) {
    alert("Please fill in Delivery Date and Time.");
    return;
  }

  // Save to current product
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];

  // Validate Delivery Option if visible
  const delOptionsWrapper = document.getElementById("deliveryOptionsWrapper");
  let selectedMethod = "";

  if (delOptionsWrapper && delOptionsWrapper.style.display !== "none") {
    const selectedRadio = document.querySelector(
      'input[name="deliveryMethod"]:checked'
    );
    if (!selectedRadio) {
      alert("Please select a Delivery Method.");
      return;
    }
    selectedMethod = selectedRadio.value;
  }

  currentProduct.delivery = {
    date: dDate,
    time: dTime,
    address: dAddr,
    method: selectedMethod,
  };

  // Show additional products
  const selectedTypes = orderData.selectedProducts.map((p) => p.type);
  const allProducts = [
    "bouquet",
    "vase",
    "signature",
    "hand-bouquet",
    "decoration",
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
      card.innerHTML = `<div class="product-img"><img src="${
        productImages[prod]
      }" alt="${prod}"></div><div>${formatName(prod)}</div>`;
      card.onclick = function () {
        orderData.selectedProducts.push({ type: prod, sizes: [] });

        // Intercept for Decoration Flow
        if (prod === "decoration") {
          renderDecorationPage2();
          return;
        }

        // Re-trigger page 2 setup manually
        const sizeDiv = document.getElementById("sizeOptions");
        renderSizeOptionsHTML(sizeDiv, prod);
        showPage(2);
      };
      addDiv.appendChild(card);
    });
  }
  showPage(5);
}

function renderSizeOptionsHTML(container, type) {
  container.innerHTML = "";
  const sizes = productSizes[type];

  sizes.forEach((size) => {
    const imgSrc = getSizeImage(type, size);
    const sizeDiv = document.createElement("div");
    sizeDiv.className = "size-item";
    sizeDiv.innerHTML = `
          <div class="size-img"><img src="${imgSrc}" alt="${size}"></div>
          <div class="quantity-control">
            <button class="qty-btn" onclick="changeQty('${size}', -1)">−</button>
            <input type="number" class="qty-input" id="qty-${size}" value="0" min="0" onchange="manualQtyChange('${size}', this.value)" onfocus="this.select()">
            <button class="qty-btn" onclick="changeQty('${size}', 1)">+</button>
          </div>`;
    container.appendChild(sizeDiv);
  });
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
  initReviewFlatpickr();
}

function initReviewFlatpickr() {
  // Native date inputs handle this now
}

function renderCustomerSection() {
  const isEdit = reviewMode["customer"];
  let html = `<div class="review-section">
    <div class="review-header">
      <h3>👤 Customer</h3>
      <button class="edit-btn" onclick="toggleReviewMode('customer')" title="${
        isEdit ? "Done" : "Edit"
      }">${isEdit ? "❌" : "✏️"}</button>
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
  // --- SECTION 1: ITEMS ---
  const isEditItems = reviewMode[`product-${pIdx}-items`];

  let html = `<div class="review-section">
    <div class="review-header">
      <h3 style="text-transform: capitalize;">${
        productEmojis[prod.type]
      } ${formatName(prod.type)}</h3>
      <button class="edit-btn" onclick="toggleReviewMode('product-${pIdx}-items')" title="${
    isEditItems ? "Done" : "Edit"
  }">${isEditItems ? "❌" : "✏️"}</button>
    </div>`;

  // ITEMS
  // html += `<h4 style="margin:8px 0; color:#4a5568;">Items</h4>`; // Optional: "Items" subheader might be redundant now that it has its own block? keeping it clean.
  prod.sizes.forEach((sz, sIdx) => {
    sz.items.forEach((it, iIdx) => {
      html += `<div class="review-item" style="${
        isEditItems ? "background:#fff; border:1px solid #e2e8f0;" : ""
      }">`;

      if (prod.type === "vase") {
        html += getVaseReviewHTML(it, sz, isEditItems, pIdx, sIdx, iIdx);
      } else if (prod.type === "hand-bouquet") {
        html += getHandBouquetReviewHTML(it, sz, isEditItems, pIdx, sIdx, iIdx);
      } else if (prod.type === "decoration") {
        html += getDecorationReviewHTML(it, sz, isEditItems, pIdx, sIdx, iIdx);
      } else if (prod.type === "signature") {
        html += getSignatureReviewHTML(it, sz, isEditItems, pIdx, sIdx, iIdx);
      } else {
        html += getBouquetReviewHTML(it, sz, isEditItems, pIdx, sIdx, iIdx);
      }
      html += `</div>`;
    });
  });
  html += `</div>`; // End Items Section

  // --- SECTION 2: DELIVERY ---
  const isEditDelivery = reviewMode[`product-${pIdx}-delivery`];

  html += `<div class="review-section">
    <div class="review-header">
      <h3 style="text-transform: capitalize;">📦 Delivery Details</h3>
      <button class="edit-btn" onclick="toggleReviewMode('product-${pIdx}-delivery')" title="${
    isEditDelivery ? "Done" : "Edit"
  }">${isEditDelivery ? "❌" : "✏️"}</button>
    </div>`;

  if (isEditDelivery) {
    html += `
      <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
        <label>Date</label>
        <input type="date" class="review-date-input" data-pidx="${pIdx}" value="${
      prod.delivery.date
    }" onchange="updateProductDelivery(${pIdx}, 'date', this.value)" min="${
      new Date().toISOString().split("T")[0]
    }">
      </div>
      <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
        <label>Time</label>
        <input type="time" value="${
          prod.delivery.time
        }" step="60" onchange="updateProductDelivery(${pIdx}, 'time', this.value)">
      </div>`;

    if (prod.type === "decoration") {
      let addrObj = { venue: "", address: "", floor: "", room: "" };
      try {
        addrObj = JSON.parse(prod.delivery.address);
      } catch (e) {}

      html += `
          <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
            <label>📍 Alamat Venue</label>
            <input type="text" placeholder="Nama Venue" value="${addrObj.venue}" style="margin-bottom:4px; width:100%; border:1px solid #ddd; padding:4px;" oninput="updateDecorationDelivery(${pIdx}, 'venue', this.value)">
            <input type="text" placeholder="Alamat" value="${addrObj.address}" style="margin-bottom:4px; width:100%; border:1px solid #ddd; padding:4px;" oninput="updateDecorationDelivery(${pIdx}, 'address', this.value)">
            <input type="text" placeholder="Lantai" value="${addrObj.floor}" style="margin-bottom:4px; width:100%; border:1px solid #ddd; padding:4px;" oninput="updateDecorationDelivery(${pIdx}, 'floor', this.value)">
            <input type="text" placeholder="Ruangan" value="${addrObj.room}" style="width:100%; border:1px solid #ddd; padding:4px;" oninput="updateDecorationDelivery(${pIdx}, 'room', this.value)">
          </div>`;
    } else {
      html += `
          <div class="review-item" style="background:#fff; border:1px solid #e2e8f0;">
            <label>Address</label>
            <textarea rows="3" oninput="updateProductDelivery(${pIdx}, 'address', this.value)">${prod.delivery.address}</textarea>
          </div>`;
    }
  } else {
    let displayAddr = prod.delivery.address;
    if (prod.type === "decoration") {
      try {
        const parsed = JSON.parse(displayAddr);
        displayAddr = `<strong>${parsed.venue}</strong><br>${parsed.address}<br>Lantai: ${parsed.floor}, Ruangan: ${parsed.room}`;
      } catch (e) {}
    }

    html += `
      <div class="review-item">Date: ${prod.delivery.date}</div>
      <div class="review-item">Time: ${formatTime(prod.delivery.time)}</div>
      <div class="review-item">Address: ${displayAddr}</div>`;
  }

  html += `</div>`; // End Delivery Section
  return html;
}

function updateProductDelivery(pIdx, field, value) {
  orderData.selectedProducts[pIdx].delivery[field] = value;
}

function updateDecorationDelivery(pIdx, subField, value) {
  const prod = orderData.selectedProducts[pIdx];
  let addrObj = { venue: "", address: "", floor: "", room: "" };
  try {
    addrObj = JSON.parse(prod.delivery.address);
  } catch (e) {}

  addrObj[subField] = value;
  prod.delivery.address = JSON.stringify(addrObj);
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
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzb_KW-89KZSY3_R4H_VqqOJ3Bh19Sv3aUBzpGaTUIjN7VAYjmI97WZ-DLjgol0YZ83fQ/exec";

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
    const currentProduct =
      orderData.selectedProducts[orderData.selectedProducts.length - 1];
    if (currentProduct && currentProduct.type === "vase") {
      document.getElementById("page3-vase").classList.add("active");
    } else if (currentProduct && currentProduct.type === "signature") {
      document.getElementById("page3-signature").classList.add("active");
    } else {
      document.getElementById("page3").classList.add("active");
    }
  } else {
    const page = document.getElementById(`page${num}`);
    if (page) page.classList.add("active");
  }

  currentPage = num;

  // Theme reset for global pages
  if (num === 1 || num === 5) {
    setTheme(null); // Revert to brand default
  }

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
        if (prod.type === "vase") {
          const flowersStr = Object.entries(it.mainFlowers || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${
            sz.size
          }) - Main Flowers: ${flowersStr} - Color: ${it.color}`;
        } else if (prod.type === "hand-bouquet") {
          message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${
            sz.size
          }) - Status: ${it.status} - Color: ${it.color}`;
        } else if (prod.type === "decoration") {
          const ev = it.eventType === "Other" ? it.eventDetail : it.eventType;
          message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${
            sz.size
          }) - Event: ${ev} - Color: ${it.color}\nGuests: ${it.guestList}`;
        } else if (prod.type === "signature") {
          let desc = "";
          if (sz.size === "Yoona")
            desc = `Main: ${it.mainFlower || "-"}, Color: ${it.color}`;
          else if (sz.size === "Marii" || sz.size === "Bomi")
            desc = `Color: ${it.color}, Basket: ${it.basketColor}`;
          else if (sz.size === "Bloom box")
            desc = `Color: ${it.color}, Wrap: ${it.wrapColor}`;
          else if (sz.size === "Acrylic Bloom box")
            desc = `Color: ${it.color}, Acrylic Details Included`;
          message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${
            sz.size
          }) - ${desc}`;
        } else {
          message += `${productEmojis[prod.type]} ${formatName(prod.type)} (${
            sz.size
          }) - Flower Color: ${it.color} - Wrap: ${it.wrapColor}`;
        }

        if (it.greeting) message += ` - Greeting: "${it.greeting}"`;
        message += "\n";
      });
    });
    // Add delivery info for this product
    message += `Delivery: ${prod.delivery.date} at ${formatTime(
      prod.delivery.time
    )} to ${prod.delivery.address}\n`;
    message += "----------------\n";
  });

  // Encode message
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/6285822220904?text=${encodedMessage}`;

  // Open WhatsApp
  const btn = document.getElementById("whatsappBtn");
  btn.onclick = function () {
    window.open(whatsappUrl, "_blank");
  };
}

// --- Delivery Options Logic ---

function checkDeliveryZone(address) {
  if (!address) return "outside";
  const lower = address.toLowerCase();
  // "Malang Raya" check: Kota Malang, Kabupaten Malang, Kota Batu
  if (
    lower.includes("kota malang") ||
    lower.includes("kabupaten malang") ||
    lower.includes("kota batu")
  ) {
    return "malang_raya";
  }
  return "outside";
}

function renderDeliveryOptions(address) {
  const wrapper = document.getElementById("deliveryOptionsWrapper");
  const container = document.getElementById("deliveryOptionsList");
  const feeInfo = document.getElementById("deliveryFeeInfo");

  if (!wrapper || !container) return;

  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];

  // Hide for decoration
  if (currentProduct && currentProduct.type === "decoration") {
    wrapper.style.display = "none";
    return;
  }

  if (!address) {
    wrapper.style.display = "none";
    container.innerHTML = "";
    return;
  }

  const zone = checkDeliveryZone(address);
  let options = [];

  if (zone === "malang_raya") {
    options = [
      {
        id: "Self-pickup",
        label: "Self-pickup",
        sub: "byGewa (Jl. blabla No. 123)",
      },
      {
        id: "Grabsend",
        label: "Grabsend",
        sub: "Delivery fee charged separately",
      },
      {
        id: "Gosend",
        label: "Gosend",
        sub: "Delivery fee charged separately",
      },
    ];
  } else {
    options = [
      { id: "JNT", label: "JNT", sub: "Delivery fee charged separately" },
      { id: "Shopee", label: "Shopee", sub: "Delivery fee charged separately" },
    ];
  }

  container.innerHTML = "";
  wrapper.style.display = "block";

  const existingMethod = currentProduct.delivery?.method;

  options.forEach((opt) => {
    const div = document.createElement("div");
    div.className = "radio-item";
    // Flex container for alignment
    div.style.display = "flex";
    div.style.alignItems = "flex-start"; // Align top so multi-line text doesn't center the radio
    div.style.marginBottom = "12px";
    div.style.cursor = "pointer";

    // Radio Input
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "deliveryMethod";
    input.id = opt.id;
    input.value = opt.id;
    input.style.marginTop = "4px"; // Slight offset to align with text cap-height
    input.style.cursor = "pointer";
    if (existingMethod === opt.id) input.checked = true;

    // Text container
    const textDiv = document.createElement("div");
    textDiv.style.marginLeft = "10px";

    // Main Label
    const label = document.createElement("label");
    label.htmlFor = opt.id;
    label.innerText = opt.label;
    label.style.display = "block";
    label.style.fontWeight = "600";
    label.style.cursor = "pointer";
    label.style.marginBottom = "2px";
    label.style.color = "#2d3748";

    // Subtitle (Fee Info)
    const sub = document.createElement("div");
    sub.style.fontSize = "0.9em"; // Similar to map-instruction
    sub.style.color = "#718096"; // Grey color like map-instruction
    sub.innerText = opt.sub;

    textDiv.appendChild(label);
    if (opt.sub) {
      textDiv.appendChild(sub);
    }

    div.appendChild(input);
    div.appendChild(textDiv);

    // Allow clicking the whole row to select
    div.onclick = function (e) {
      if (e.target !== input) {
        input.checked = true;
      }
    };

    container.appendChild(div);
  });

  if (feeInfo) {
    // Clear the global footer fee info since we moved it to per-item subtitles
    feeInfo.innerText = "* Rate will be shared from WhatsApp by admin By Gewa.";
  }
}

// Hook into address updates
window.onAddressUpdated = function (address) {
  renderDeliveryOptions(address);
};
