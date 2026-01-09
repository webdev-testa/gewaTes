function renderHandBouquetPage(currentProduct) {
  const specDiv = document.getElementById("orderSpecifications");
  specDiv.innerHTML = "";

  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    // 1. Header outside
    const sizeHeader = document.createElement("div");
    sizeHeader.className = "order-item-header";
    sizeHeader.innerText = `${productEmojis[currentProduct.type]} ${sizeObj.size} (Qty: ${sizeObj.quantity})`;
    specDiv.appendChild(sizeHeader);

    for (let i = 0; i < sizeObj.quantity; i++) {
        // 2. Item Container
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";

      // Status Buttons
      const buyRentHtml = buyRentOptions
        .map(
          (opt) =>
            `<button class="color-btn" onclick="selectHandBouquetStatus(this)" data-value="${opt}">${opt}</button>`
        )
        .join("");

      itemDiv.innerHTML = `
            <div><strong>Item #${i + 1}</strong></div>
            
            <div class="form-group">
                <label>Flower Color *</label>
                <input type="text" id="hb-color-${sizeIdx}-${i}" placeholder="Enter flower color details" />
                <div style="margin-top:8px;">
                  <label style="font-size:14px;">Reference Image (Optional)</label>
                  <input type="file" accept="image/*" id="hb-ref-img-${sizeIdx}-${i}" 
                        style="font-size: 14px;" onchange="handleImageUpload(this)">
                  <div style="font-size: 12px; color: #718096; margin-top: 4px;">
                    Max size 2MB. Need to compress? <a href="https://www.iloveimg.com/compress-image" target="_blank" style="text-decoration: underline; color: #718096;">Click here</a>
                  </div>
                  <input type="hidden" id="hb-ref-img-data-${sizeIdx}-${i}">
                </div>
                ${
                  i > 0
                    ? `
                <div style="margin-top:4px;">
                    <input type="checkbox" id="hb-copy-${sizeIdx}-${i}" onchange="copyHandBouquetColor(${sizeIdx}, ${i})"> 
                    <label for="hb-copy-${sizeIdx}-${i}" style="display:inline; font-weight:normal;">Same color as Item #1</label>
                </div>`
                    : ""
                }
            </div>

            <div class="form-group">
                <label>Beli atau Sewa? *</label>
                <div class="color-options" id="hb-status-container-${sizeIdx}-${i}">
                    ${buyRentHtml}
                </div>
            </div>
        `;
      specDiv.appendChild(itemDiv);
    }
  });

  showPage(3);
}

function selectHandBouquetStatus(btn) {
  // sibling buttons
  const container = btn.parentElement;
  container
    .querySelectorAll(".color-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function copyHandBouquetColor(sizeIdx, itemIdx) {
  const sourceInput = document.getElementById(`hb-color-${sizeIdx}-0`);
  const targetInput = document.getElementById(`hb-color-${sizeIdx}-${itemIdx}`);
  const checkbox = document.getElementById(`hb-copy-${sizeIdx}-${itemIdx}`);

  if (checkbox.checked) {
    targetInput.value = sourceInput.value;
    targetInput.readOnly = true;
    targetInput.style.backgroundColor = "#f7fafc";
  } else {
    targetInput.readOnly = false;
    targetInput.style.backgroundColor = "";
  }
}

function validateAndSaveHandBouquetOrder(currentProduct) {
  let allValid = true;
  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    sizeObj.items = [];
    for (let i = 0; i < sizeObj.quantity; i++) {
      const statusContainer = document.getElementById(
        `hb-status-container-${sizeIdx}-${i}`
      );
      const selectedBtn = statusContainer.querySelector(".selected");
      const status = selectedBtn ? selectedBtn.dataset.value : null; // or textContent

      const colorInput = document.getElementById(`hb-color-${sizeIdx}-${i}`);
      const flowerColor = colorInput.value.trim();
      const imgData = document.getElementById(
        `hb-ref-img-data-${sizeIdx}-${i}`
      ).value;

      if (!flowerColor || !status) {
        allValid = false;
      } else {
        sizeObj.items.push({
          status: status,
          color: flowerColor,
          referenceImage: imgData || "",
          isHandBouquet: true,
        });
      }
    }
  });
  return allValid;
}

function getHandBouquetReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx) {
  let html = "";

  if (isEdit) {
    const brOpts = buyRentOptions
      .map(
        (opt) =>
          `<option value="${opt}" ${
            it.status === opt ? "selected" : ""
          }>${opt}</option>`
      )
      .join("");

    html += `
          <div style="font-weight:bold; margin-bottom:4px;">${sz.size}</div>
          <div style="margin-top:8px;">
            <label style="font-size:14px;">Flower Color</label>
            <input type="text" value="${it.color}" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
              oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)">
          </div>
          <div style="margin-top:8px;">
            <label style="font-size:14px;">Status</label>
            <select style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                onchange="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'status', this.value)">
                ${brOpts}
            </select>
          </div>`;
  } else {
    html += `<div style="font-weight:bold; margin-bottom:4px;">${sz.size}</div>
          Flower Color: ${it.color}<br>
          Status: ${it.status}`;
  }
  return html;
}

function handleImageUpload(input) {
  const file = input.files[0];
  const hiddenInput = input.nextElementSibling; // The hidden input field

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
