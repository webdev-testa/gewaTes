function renderVasePage(product) {
  const container = document.getElementById("vaseSpecifications");
  container.innerHTML = "";

  product.sizes.forEach((sizeObj, sizeIdx) => {
    const limits = vaseLimits[sizeObj.size]; // e.g. "Petite"
    const maxTotal = limits.maxTotal;

    for (let i = 0; i < sizeObj.quantity; i++) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";
      itemDiv.innerHTML = `<div class="order-item-header">Vase - ${
        sizeObj.size
      } (Item #${i + 1})</div>`;

      // Limits description
      let limitDesc = `Max ${maxTotal} main flowers.`;
      if (limits.maxPerType < maxTotal)
        limitDesc += ` (Max ${limits.maxPerType} of same type)`;
      itemDiv.innerHTML += `<p style="font-size:14px; color:#718096; margin-bottom:12px;">${limitDesc}</p>`;

      // Flower Selection
      itemDiv.innerHTML += `<label>Main Flower Selection *</label>`;
      vaseFlowers.forEach((flower) => {
        if (flower === "Hydrangea" && !limits.allowHydrangea) return;

        itemDiv.innerHTML += `
            <div class="size-item" style="padding: 8px; margin-bottom: 8px;">
                <div class="size-info"><div class="size-name" style="font-size:16px;">${flower}</div></div>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="changeVaseQty(${sizeIdx}, ${i}, '${flower}', -1)">−</button>
                    <input type="number" class="qty-input" id="vase-qty-${sizeIdx}-${i}-${flower}" value="0" min="0" 
                        onchange="manualVaseQtyChange(${sizeIdx}, ${i}, '${flower}', this.value)">
                    <button class="qty-btn" onclick="changeVaseQty(${sizeIdx}, ${i}, '${flower}', 1)">+</button>
                </div>
            </div>`;
      });

      // Color
      itemDiv.innerHTML += `
        <div class="form-group" style="margin-top:16px;">
            <label>Dominant Color Preference *</label>
            <input type="text" id="vase-color-${sizeIdx}-${i}" placeholder="E.g. Paste, White, Red..." />
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Reference Image (Optional)</label>
              <input type="file" accept="image/*" id="vase-ref-img-${sizeIdx}-${i}" 
                    style="font-size: 14px;" onchange="handleImageUpload(this)">
              <input type="hidden" id="vase-ref-img-data-${sizeIdx}-${i}">
            </div>
        </div>`;

      // Greeting Card
      itemDiv.innerHTML += `
        <div class="greeting-card">
            <label>Greeting Card (Optional)</label>
            <textarea rows="2" maxlength="300" id="vase-greeting-${sizeIdx}-${i}" 
                placeholder="Message..." oninput="updateCharCount(this)"></textarea>
            <div class="char-count">0/300</div>
        </div>
        `;

      container.appendChild(itemDiv);
    }
  });

  // Switch to page 3 vase
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page3-vase").classList.add("active");
  currentPage = 3;
  updateProgressBar(3);
  window.scrollTo(0, 0);
}

function changeVaseQty(sizeIdx, itemIdx, flower, delta) {
  const currentProduct =
    orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const sizeObj = currentProduct.sizes[sizeIdx];
  const limits = vaseLimits[sizeObj.size];

  // Get all flower counts for this item
  let totalCount = 0;
  const currentFlowerEl = document.getElementById(
    `vase-qty-${sizeIdx}-${itemIdx}-${flower}`
  );
  let currentFlowerVal = parseInt(currentFlowerEl.value) || 0;

  // Calculate total across all allowed flowers
  vaseFlowers.forEach((f) => {
    if (f === "Hydrangea" && !limits.allowHydrangea) return;

    const el = document.getElementById(`vase-qty-${sizeIdx}-${itemIdx}-${f}`);
    if (el) {
      totalCount += parseInt(el.value) || 0;
    }
  });

  // Proposed new value
  let newVal = currentFlowerVal + delta;

  if (newVal < 0) return; // Cannot go below 0

  // Check constraints if adding
  if (delta > 0) {
    if (totalCount >= limits.maxTotal) {
      alert(
        `You can only select up to ${limits.maxTotal} main flowers for ${sizeObj.size}.`
      );
      return;
    }
    if (newVal > limits.maxPerType) {
      alert(
        `You can only select up to ${limits.maxPerType} of ${flower} for ${sizeObj.size}.`
      );
      return;
    }
  }

  // Update
  currentFlowerEl.value = newVal;
}

function manualVaseQtyChange(sizeIdx, itemIdx, flower, val) {
  // Logic similar to changeVaseQty but for absolute set
  const currentProduct = orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const sizeObj = currentProduct.sizes[sizeIdx];
  const limits = vaseLimits[sizeObj.size];
  const el = document.getElementById(`vase-qty-${sizeIdx}-${itemIdx}-${flower}`);

  let newVal = parseInt(val) || 0;
  if (newVal < 0) newVal = 0;

  // Check limits
  if (newVal > limits.maxPerType) {
    alert(`Max ${limits.maxPerType} of ${flower} allowed for ${sizeObj.size}.`);
    el.value = 0; // Reset or revert? Reset is safer if we don't track old val. 
    // Ideally we revert to 0 or previous acceptable. 0 is safe.
    // Or better: Re-calculate what is max possible? No, just alert and reset to 0 or clamp?
    // Let's clamp to maxPerType.
    el.value = limits.maxPerType;
    newVal = limits.maxPerType;
  }

  // Check Total Limit
  let totalCount = 0;
  vaseFlowers.forEach((f) => {
    if (f === "Hydrangea" && !limits.allowHydrangea) return;
    const otherEl = document.getElementById(`vase-qty-${sizeIdx}-${itemIdx}-${f}`);
    if (otherEl && f !== flower) {
        totalCount += parseInt(otherEl.value) || 0;
    }
  });

  // totalCount is sum of OTHERS.
  if (totalCount + newVal > limits.maxTotal) {
      alert(`Total flowers cannot exceed ${limits.maxTotal}.`);
      // Clamp to remaining
      const remaining = limits.maxTotal - totalCount;
      el.value = remaining < 0 ? 0 : remaining;
  } else {
      el.value = newVal;
  }
}

function validateAndSaveVaseOrder(currentProduct) {
  let allValid = true;
  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    sizeObj.items = [];
    for (let i = 0; i < sizeObj.quantity; i++) {
      const colorInput = document.getElementById(`vase-color-${sizeIdx}-${i}`);
      const greeting = document
        .getElementById(`vase-greeting-${sizeIdx}-${i}`)
        .value.trim();
      const flowerColor = colorInput.value.trim();
      const imgData = document.getElementById(
        `vase-ref-img-data-${sizeIdx}-${i}`
      ).value;

      // Collect Flowers
      const selectedFlowers = {};
      let totalFlowers = 0;
      const limits = vaseLimits[sizeObj.size];

      vaseFlowers.forEach((f) => {
        if (f === "Hydrangea" && !limits.allowHydrangea) return;
        const el = document.getElementById(`vase-qty-${sizeIdx}-${i}-${f}`);
        const qty = parseInt(el ? el.textContent : 0) || 0;
        if (qty > 0) {
          selectedFlowers[f] = qty;
          totalFlowers += qty;
        }
      });

      if (!flowerColor || totalFlowers === 0) {
        allValid = false;
      } else {
        sizeObj.items.push({
          color: flowerColor, 
          referenceImage: imgData || "",
          mainFlowers: selectedFlowers,
          greeting: greeting,
          isVase: true,
        });
      }
    }
  });
  return allValid;
}

function getVaseReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx) {
  const flowersStr = Object.entries(it.mainFlowers || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  let html = "";
  if (isEdit) {
    html += `
            <strong>(${sz.size})</strong>
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Main Flowers (Read Only)</label>
              <div style="padding:8px; background:#f7fafc; border-radius:4px;">${flowersStr}</div>
            </div>
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Dominant Color</label>
              <input type="text" value="${
                it.color
              }" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)">
            </div>
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Greeting Card</label>
              <textarea rows="2" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'greeting', this.value)"
              >${it.greeting || ""}</textarea>
            </div>`;
  } else {
    html += `<strong>(${sz.size})</strong><br>
            Main Flowers: ${flowersStr}<br>
            Dominant Color: ${it.color}`;
    if (it.greeting) html += `<br><i>"${it.greeting}"</i>`;
  }
  return html;
}

function handleImageUpload(input) {
  const file = input.files[0];
  const hiddenInput = input.nextElementSibling; 

  if (!file) {
    hiddenInput.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("File is too large! Please choose an image under 2MB.");
    input.value = "";
    hiddenInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    hiddenInput.value = e.target.result;
  };
  reader.readAsDataURL(file);
}
