function renderHandBouquetPage(currentProduct) {
  const specDiv = document.getElementById("orderSpecifications");
  specDiv.innerHTML = "";

  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    for (let i = 0; i < sizeObj.quantity; i++) {
        const itemDiv = document.createElement("div");
        itemDiv.className = "order-item";
        
        // Status Buttons
        const buyRentHtml = buyRentOptions.map(opt => 
            `<button class="color-btn" onclick="selectHandBouquetStatus(this)" data-value="${opt}">${opt}</button>`
        ).join('');

        itemDiv.innerHTML = `
            <div class="order-item-header">${currentProduct.type} - ${sizeObj.size} (Item #${i + 1})</div>
            
            <div class="form-group">
                <label>Flower Color *</label>
                <input type="text" id="hb-color-${sizeIdx}-${i}" placeholder="Enter flower color details" />
                ${i > 0 ? `
                <div style="margin-top:4px;">
                    <input type="checkbox" id="hb-copy-${sizeIdx}-${i}" onchange="copyHandBouquetColor(${sizeIdx}, ${i})"> 
                    <label for="hb-copy-${sizeIdx}-${i}" style="display:inline; font-weight:normal;">Same color as Item #1</label>
                </div>` : ''}
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
    container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
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
        const statusContainer = document.getElementById(`hb-status-container-${sizeIdx}-${i}`);
        const selectedBtn = statusContainer.querySelector('.selected');
        const status = selectedBtn ? selectedBtn.dataset.value : null; // or textContent

        const colorInput = document.getElementById(`hb-color-${sizeIdx}-${i}`);
        const flowerColor = colorInput.value.trim();

        if (!flowerColor || !status) {
          allValid = false;
        } else {
          sizeObj.items.push({
            status: status,
            color: flowerColor,
            isHandBouquet: true
          });
        }
      }
    });
    return allValid;
}

function getHandBouquetReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx) {
    let html = '';
    
    if (isEdit) {
         // Using dropdown in review edit for compactness, or buttons? 
         // Let's stick to dropdown for review edit to save space, but update the label order to match input page?
         // User didn't strictly say reorder review, but it's good practice. I'll reorder.
         
        const brOpts = buyRentOptions.map(opt => 
            `<option value="${opt}" ${it.status === opt ? 'selected' : ''}>${opt}</option>`
        ).join('');

        html += `
          <strong>(${sz.size})</strong>
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
        html += `<strong>(${sz.size})</strong><br>
          Flower Color: ${it.color}<br>
          Status: ${it.status}`;
    }
    return html;
}
