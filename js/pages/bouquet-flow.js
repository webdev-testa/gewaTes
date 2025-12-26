function renderBouquetPage(currentProduct) {
  const specDiv = document.getElementById("orderSpecifications");
  specDiv.innerHTML = "";

  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    for (let i = 0; i < sizeObj.quantity; i++) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";

      // Flower Color Input
      let colorHtml = `<div class="form-group">
        <label>Flower Color *</label>
        <input type="text" id="flower-color-${sizeIdx}-${i}" placeholder="Enter flower color details" />`;
      
      colorHtml += `
        <div style="margin-top:8px;">
          <label style="font-size:14px;">Reference Image (Optional)</label>
          <input type="file" accept="image/*" id="ref-img-${sizeIdx}-${i}" 
                style="font-size: 14px;" onchange="handleImageUpload(this)">
          <input type="hidden" id="ref-img-data-${sizeIdx}-${i}">
        </div>`;
      
      if (i > 0) {
        colorHtml += `<div style="margin-top:4px;">
          <input type="checkbox" id="copy-check-${sizeIdx}-${i}" onchange="copyColor(${sizeIdx}, ${i})"> 
          <label for="copy-check-${sizeIdx}-${i}" style="display:inline; font-weight:normal;">Same color as Item #1</label>
        </div>`;
      }
      colorHtml += `</div>`;

      // Wrap Color Buttons
      const wrapHtml = wrapOptions
        .map(
          (c) =>
            `<button class="color-btn" data-wrap-color="${c}" onclick="selectWrap(this)">${c}</button>`
        )
        .join("");

      itemDiv.innerHTML = `
              <div class="order-item-header">${currentProduct.type} - ${
        sizeObj.size
      } (Item #${i + 1})</div>
              
              ${colorHtml}

              <div class="form-group">
                <label>Wrap Color *</label>
                <div class="color-options" id="wrap-colors-${sizeIdx}-${i}">${wrapHtml}</div>
              </div>

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

function validateAndSaveBouquetOrder(currentProduct) {
    let allValid = true;
    currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
      sizeObj.items = [];
      for (let i = 0; i < sizeObj.quantity; i++) {
        const colorInput = document.getElementById(`flower-color-${sizeIdx}-${i}`);
        const wrapContainer = document.getElementById(`wrap-colors-${sizeIdx}-${i}`);
        const selectedWrap = wrapContainer ? wrapContainer.querySelector(".selected") : null;
        const greeting = document
          .getElementById(`greeting-${sizeIdx}-${i}`)
          .value.trim();
        const flowerColor = colorInput.value.trim();
        const imgData = document.getElementById(`ref-img-data-${sizeIdx}-${i}`).value;

        if (!flowerColor || !selectedWrap) {
          allValid = false;
        } else {
          sizeObj.items.push({
            color: flowerColor,
            wrapColor: selectedWrap.textContent,
            greeting: greeting,
            referenceImage: imgData || ""
          });
        }
      }
    });
    return allValid;
}

function getBouquetReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx) {
     let html = '';
     if (isEdit) {
         const wrapOpts = wrapOptions.map(c => 
            `<option value="${c}" ${it.wrapColor === c ? 'selected' : ''}>${c}</option>`
          ).join('');
          
          html += `
            <strong>(${sz.size})</strong>
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Flower Color</label>
              <input type="text" value="${it.color}" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)">
            </div>
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Wrap Color</label>
              <select style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                onchange="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'wrapColor', this.value)">
                ${wrapOpts}
              </select>
            </div>
            <div style="margin-top:8px;">
              <label style="font-size:14px;">Greeting Card</label>
              <textarea rows="2" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'greeting', this.value)"
              >${it.greeting || ''}</textarea>
            </div>`;
      } else {
        html += `<strong>(${sz.size})</strong><br>
            Flower Color: ${it.color}<br>
            Wrap Color: ${it.wrapColor}`;
          if (it.greeting) html += `<br><i>"${it.greeting}"</i>`;
      }
      return html;
}

function copyColor(sizeIdx, itemIdx) {
  const sourceInput = document.getElementById(`flower-color-${sizeIdx}-0`);
  const targetInput = document.getElementById(`flower-color-${sizeIdx}-${itemIdx}`);
  const checkbox = document.getElementById(`copy-check-${sizeIdx}-${itemIdx}`);

  if (checkbox.checked) {
    targetInput.value = sourceInput.value;
    targetInput.readOnly = true;
    targetInput.style.backgroundColor = "#f7fafc";
  } else {
    targetInput.readOnly = false;
    targetInput.style.backgroundColor = "";
  }
}

function selectWrap(btn) {
  btn.parentElement
    .querySelectorAll(".color-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
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
  reader.onload = function(e) {
    hiddenInput.value = e.target.result;
  };
  reader.readAsDataURL(file);
}