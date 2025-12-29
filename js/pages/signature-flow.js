function renderSignaturePage(product) {
  const container = document.getElementById("signatureSpecifications");
  container.innerHTML = "";

  product.sizes.forEach((sizeObj, sIdx) => {
    // Group items by size
    const sizeHeader = document.createElement("div");
    sizeHeader.className = "order-item-header";
    sizeHeader.innerHTML = `${productEmojis[product.type]} ${sizeObj.size} (Qty: ${sizeObj.quantity})`;
    container.appendChild(sizeHeader);

    // Initialize items if they don't exist yet (first render)
    if (sizeObj.items.length === 0) {
        for (let k = 0; k < sizeObj.quantity; k++) {
            sizeObj.items.push({});
        }
    }

    sizeObj.items.forEach((item, iIdx) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";
      
      const uniqueId = `sig-${sIdx}-${iIdx}`;
      itemDiv.id = uniqueId; // Add ID for direct access
      
      let content = `<div><strong>Item #${iIdx + 1}</strong></div>`;

      // Branch based on Size Name
      const sizeName = sizeObj.size;

      if (sizeName === "Yoona") {
        // Yoona Flow
        content += renderYoonaInputs(item, sIdx, iIdx);
      } else if (sizeName === "Marii" || sizeName === "Bomi") {
        // Marii/Bomi Flow (Basket Color)
        content += renderBasketFlowInputs(item, sIdx, iIdx, sizeName);
      } else if (sizeName === "Bloom box") {
        // Bloom box (Like Bouquet)
        content += renderBloomBoxInputs(item, sIdx, iIdx);
      } else if (sizeName === "Acrylic Bloom box") {
        // Acrylic Flow
        content += renderAcrylicInputs(item, sIdx, iIdx);
      }

      itemDiv.innerHTML = content;
      container.appendChild(itemDiv);
    });
  });

  showPage(3);
}

// --- Yoona Helpers ---
function renderYoonaInputs(item, sIdx, iIdx) {
  // Main Flower Selection (Lily/Anthurium)
  const flowers = [
    { name: "Lily", image: "Form Assets/Main Flower Assets/Signature Lily.png" },
    { name: "Anthurium", image: "Form Assets/Main Flower Assets/Signature Anthurium.png" }
  ];
  
  let html = `<div class="form-group">
    <label>Main Flower Preference *</label>
    <div class="flower-choice-grid">`;
  
  flowers.forEach(f => {
    const isSelected = item.mainFlower === f.name ? "selected" : "";
    // Note: We use onclick attribute to call global update function
    html += `
      <div class="flower-choice-card ${isSelected}" 
           onclick="updateSignatureItem(${sIdx}, ${iIdx}, 'mainFlower', '${f.name}')">
        <img src="${f.image}" alt="${f.name}" class="flower-choice-img">
        <div>${f.name}</div>
      </div>
    `;
  });
  html += `</div></div>`;

  // Color
  html += `<div class="form-group">
    <label>Color Nuance *</label>
    <input type="text" placeholder="e.g. Pink Pastel" 
           value="${item.color || ''}" 
           oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'color', this.value)">
  </div>`;

  // Photo Upload (Simulated with text for now, or just a file input that doesn't really upload to server in this demo context, relying on JS object)
  // But user said "upload foto". 
  // Since we are posting to Google Sheet, we might can't easily upload distinct files. 
  // Usually we might just ask for a link or use a dummy file input. 
  // The Prompt says "upload foto". I will add a file input.
  html += `<div class="form-group">
    <label>Upload Reference Photo (Optional)</label>
    <input type="file" accept="image/*" class="file-upload-label">
  </div>`;

  // Greeting Card (Vase style)
  html += `<div class="form-group greeting-card">
    <label>Greeting Card Message</label>
    <textarea rows="3" maxlength="300" 
      placeholder="Write your message here..." 
      oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'greeting', this.value); updateCharCount(this)">${item.greeting || ''}</textarea>
    <div class="char-count">${(item.greeting || '').length}/300</div>
  </div>`;

  return html;
}

// --- Marii/Bomi Helpers ---
function renderBasketFlowInputs(item, sIdx, iIdx, sizeName) {
  // Treated like bouquet: Needs Flower Color
  let html = `<div class="form-group">
    <label>Flower Color *</label>
    <input type="text" placeholder="e.g. Red and White" 
           value="${item.color || ''}" 
           oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'color', this.value)">
    <div style="margin-top: 8px;">
        <label>Upload Reference Photo (Optional)</label>
        <input type="file" accept="image/*" class="file-upload-label">
    </div>
  </div>`;

  // Basket Color
  const basketColors = [
    { name: "Lilac", hex: "#f3cbff" },
    { name: "Pink", hex: "#fad9db" },
    { name: "Buttercup", hex: "#feffcb" },
    { name: "Mint", hex: "#d9ffd6" },
    { name: "Black", hex: "#0d0d0d" }
  ];

  html += `<div class="form-group">
    <label>Basket Color *</label>
    <div class="basket-colors-grid">`;
  
  basketColors.forEach(c => {
    const isSelected = item.basketColor === c.name ? "selected" : "";
    html += `<div class="basket-color-btn ${isSelected}" 
                  data-color="${c.name}"
                  title="${c.name}"
                  onclick="updateSignatureItem(${sIdx}, ${iIdx}, 'basketColor', '${c.name}')"></div>`;
  });
  
  html += `</div><div class="basket-selection-text" style="font-size:14px; color:#718096">Selected: ${item.basketColor || 'None'}</div></div>`;

  // Greeting Card
  html += `<div class="form-group greeting-card">
    <label>Greeting Card Message</label>
    <textarea rows="3" maxlength="300" 
      placeholder="Write your message here..." 
      oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'greeting', this.value); updateCharCount(this)">${item.greeting || ''}</textarea>
    <div class="char-count">${(item.greeting || '').length}/300</div>
  </div>`;

  return html;
}

// --- Bloom box Helpers ---
function renderBloomBoxInputs(item, sIdx, iIdx) {
  // Exactly like bouquet
  // Flower Color
  let html = `<div class="form-group">
    <label>Flower Color *</label>
    <input type="text" placeholder="e.g. Red and White" 
           value="${item.color || ''}" 
           oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'color', this.value)">
    <div style="margin-top: 8px;">
        <label>Upload Reference Photo (Optional)</label>
        <input type="file" accept="image/*" class="file-upload-label">
    </div>
  </div>`;

  // Wrap Color (Reuse wrapOptions from constants.js)
  html += `<div class="form-group">
    <label>Box/Wrap Color *</label>
    <div class="color-options">`;
  
  wrapOptions.forEach(opt => {
     const isSelected = item.wrapColor === opt ? "selected" : "";
     html += `<button class="color-btn ${isSelected}" data-wrap-color="${opt}"
          onclick="updateSignatureItem(${sIdx}, ${iIdx}, 'wrapColor', '${opt}')">${opt}</button>`;
  });
  
  html += `</div></div>`;

  // Greeting Card
  html += `<div class="form-group greeting-card">
    <label>Greeting Card Message</label>
    <textarea rows="3" maxlength="300" 
      placeholder="Write your message here..." 
      oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'greeting', this.value); updateCharCount(this)">${item.greeting || ''}</textarea>
    <div class="char-count">${(item.greeting || '').length}/300</div>
  </div>`;

  return html;
}

// --- Acrylic Bloom box Helpers ---
function renderAcrylicInputs(item, sIdx, iIdx) {
  // Initialize acrylic fields if undefined
  if (!item.acrylic) item.acrylic = {};

  // Color
  let html = `<div class="form-group">
    <label>Flower Color *</label>
    <input type="text" placeholder="e.g. Red and White" 
           value="${item.color || ''}" 
           oninput="updateSignatureItem(${sIdx}, ${iIdx}, 'color', this.value)">
  </div>`;

  // Upload Image
  html += `<div class="form-group">
    <label>Upload Reference Photo (Optional)</label>
    <input type="file" accept="image/*" class="file-upload-label">
  </div>`;

  html += `<hr style="margin: 24px 0; border: 0; border-top: 1px solid #e2e8f0;">`;

  // Greeting Card Section
  html += `<div class="form-group">
    <label>Greeting Card Details</label>
    <img src="Form Assets/Signature Contoh Ucapan Akrilik.png" alt="Example" class="acrylic-example-img">
    
    <div style="margin-bottom: 12px;">
      <label style="font-weight:normal; font-size:14px;">Header (Contoh: Selamat dan Sukses)</label>
      <input type="text" value="${item.acrylic.header || ''}" 
             placeholder="Selamat dan Sukses"
             oninput="updateAcrylicField(${sIdx}, ${iIdx}, 'header', this.value)">
    </div>

    <div style="margin-bottom: 12px;">
      <label style="font-weight:normal; font-size:14px;">Event (Contoh: Grand Opening Store)</label>
      <input type="text" value="${item.acrylic.event || ''}" 
             placeholder="Grand Opening..."
             oninput="updateAcrylicField(${sIdx}, ${iIdx}, 'event', this.value)">
    </div>

    <div style="margin-bottom: 12px;">
      <label style="font-weight:normal; font-size:14px;">Nama/Logo Penerima</label>
      <input type="text" value="${item.acrylic.receiver || ''}" 
             placeholder="Toko Bunga ABC"
             oninput="updateAcrylicField(${sIdx}, ${iIdx}, 'receiver', this.value)">
    </div>

    <div style="margin-bottom: 12px;">
      <label style="font-weight:normal; font-size:14px;">Nama Pemberi (Dari)</label>
      <input type="text" value="${item.acrylic.sender || ''}" 
             placeholder="Budi & Keluarga"
             oninput="updateAcrylicField(${sIdx}, ${iIdx}, 'sender', this.value)">
    </div>

     <div style="margin-bottom: 12px;">
      <label style="font-weight:normal; font-size:14px;">Unggah Logo (Jika Ada)</label>
      <input type="file" accept="image/*">
    </div>

  </div>`;

  return html;
}

// --- Updates ---

function updateSignatureItem(sIdx, iIdx, field, value) {
  const product = orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const item = product.sizes[sIdx].items[iIdx];
  item[field] = value;
  
  // Optimization: Update DOM directly to avoid re-render scroll jumps
  const uniqueId = `sig-${sIdx}-${iIdx}`;
  const container = document.getElementById(uniqueId);
  if (!container) return; // Should not happen

  if (field === 'mainFlower') {
    const cards = container.querySelectorAll('.flower-choice-card');
    cards.forEach(card => {
        // Check if this card matches the selected value (name in text)
        if (card.textContent.includes(value)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

  } else if (field === 'basketColor') {
    const btns = container.querySelectorAll('.basket-color-btn');
    btns.forEach(btn => {
        if (btn.dataset.color === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    // Update text
    const txt = container.querySelector('.basket-selection-text');
    if (txt) txt.textContent = `Selected: ${value}`;

  } else if (field === 'wrapColor') {
    const btns = container.querySelectorAll('.color-btn');
    btns.forEach(btn => {
        if (btn.textContent.trim() === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
  }
  // For text inputs 'color', 'greeting', etc., no DOM update needed as they are standard inputs value preserved.
}

function updateAcrylicField(sIdx, iIdx, field, value) {
  const product = orderData.selectedProducts[orderData.selectedProducts.length - 1];
  const item = product.sizes[sIdx].items[iIdx];
  if (!item.acrylic) item.acrylic = {};
  item.acrylic[field] = value;
}

// --- Validation ---

function validateAndSaveSignatureOrder(product) {
  let isValid = true;

  product.sizes.forEach(sizeObj => {
    sizeObj.items.forEach(item => {
      const sName = sizeObj.size;
      
      if (sName === "Yoona") {
        if (!item.mainFlower || !item.color) isValid = false;
      } else if (sName === "Marii" || sName === "Bomi") {
        if (!item.basketColor || !item.color) isValid = false;
      } else if (sName === "Bloom box") {
        if (!item.wrapColor || !item.color) isValid = false;
      } else if (sName === "Acrylic Bloom box") {
         if (!item.color) isValid = false;
      }
    });
  });

  return isValid;
}

// --- Review HTML ---

function getSignatureReviewHTML(item, size, isEdit, pIdx, sIdx, iIdx) {
  const sName = size.size;
  const uniqueId = `rev-sig-${pIdx}-${sIdx}-${iIdx}`;
  
  // Wrapper for DOM targeting
  let html = `<div id="${uniqueId}">`;
  
  if (isEdit) {
    html += `<div style="font-weight:bold; margin-bottom:4px;">${sName}</div>`;
    if (sName === "Yoona") {
        html += renderYoonaReviewInputs(item, pIdx, sIdx, iIdx);
    } else if (sName === "Marii" || sName === "Bomi") {
        html += renderBasketReviewInputs(item, pIdx, sIdx, iIdx);
    } else if (sName === "Bloom box") {
        html += renderBloomBoxReviewInputs(item, pIdx, sIdx, iIdx);
    } else if (sName === "Acrylic Bloom box") {
        html += renderAcrylicReviewInputs(item, pIdx, sIdx, iIdx);
    }
  } else {
    // Read-only view
      html += `<div style="font-weight:bold; margin-bottom:4px;">${sName}</div>`;
      if (sName === "Yoona") {
        html += `<div>Main Flower: ${item.mainFlower || '-'}</div>`;
        html += `<div>Color: ${item.color || '-'}</div>`;
        if (item.greeting) html += `<div>Card: "${item.greeting}"</div>`;
      } else if (sName === "Marii" || sName === "Bomi") {
        html += `<div>Flower Color: ${item.color || '-'}</div>`;
        html += `<div>Basket Color: ${item.basketColor || '-'}</div>`;
        if (item.greeting) html += `<div>Card: "${item.greeting}"</div>`;
      } else if (sName === "Bloom box") {
         html += `<div>Flower Color: ${item.color || '-'}</div>`;
         html += `<div>Wrap Color: ${item.wrapColor || '-'}</div>`;
         if (item.greeting) html += `<div>Card: "${item.greeting}"</div>`;
      } else if (sName === "Acrylic Bloom box") {
        html += `<div>Color: ${item.color || '-'}</div>`;
        if (item.acrylic) {
          html += `<div>Acrylic: ${item.acrylic.header || ''} ${item.acrylic.receiver ? 'for ' + item.acrylic.receiver : ''}</div>`;
        }
      }
  }
  html += `</div>`;
  return html;
}

// --- Review Render Helpers ---

function renderYoonaReviewInputs(item, pIdx, sIdx, iIdx) {
  const flowers = [
    { name: "Lily", image: "Form Assets/Main Flower Assets/Signature Lily.png" },
    { name: "Anthurium", image: "Form Assets/Main Flower Assets/Signature Anthurium.png" }
  ];
  let html = `<div class="form-group"><label>Main Flower Preference</label><div class="flower-choice-grid">`;
  flowers.forEach(f => {
    const isSelected = item.mainFlower === f.name ? "selected" : "";
    html += `<div class="flower-choice-card ${isSelected}" onclick="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'mainFlower', '${f.name}')">
        <img src="${f.image}" alt="${f.name}" class="flower-choice-img"><div>${f.name}</div></div>`;
  });
  html += `</div></div>`;
  html += `<div class="form-group"><label>Color Nuance</label><input type="text" value="${item.color || ''}" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)"></div>`;
  html += `<div class="form-group"><label>Greeting Card</label><textarea rows="2" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'greeting', this.value)">${item.greeting || ''}</textarea></div>`;
  return html;
}

function renderBasketReviewInputs(item, pIdx, sIdx, iIdx) {
  const basketColors = [{ name: "Lilac" }, { name: "Pink" }, { name: "Buttercup" }, { name: "Mint" }, { name: "Black" }];
  let html = `<div class="form-group"><label>Flower Color</label><input type="text" value="${item.color || ''}" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)"></div>`;
  html += `<div class="form-group"><label>Basket Color</label><div class="basket-colors-grid">`;
  basketColors.forEach(c => {
    const isSelected = item.basketColor === c.name ? "selected" : "";
    // Re-using basket-color-btn class for styling, assuming it relies on data-color or specific class names? 
    // In signature-flow.js renderBasketFlowInputs, it uses data-color for styling (bg color). The map had hex values.
    // I need the HEX values or the css class to show colors.
    // Let's hardcode or lookup. The original code used inline style or class based on name?
    // Looking at renderBasketFlowInputs, it generates: <div class="basket-color-btn..." data-color="${c.name}">
    // Style.css probably handles the background-color based on data-color OR the js function didn't set style?
    // Wait, in Step 198 line 135, it iterates objects with hex. 
    // I need those hexes here to replicate the look if it's inline, or relies on css.
    // Checking previous file view: line 123 defined the array with hex.
    // I should provide the style manually here.
    const hexMap = { "Lilac": "#f3cbff", "Pink": "#fad9db", "Buttercup": "#feffcb", "Mint": "#d9ffd6", "Black": "#0d0d0d" };
    html += `<div class="basket-color-btn ${isSelected}" style="background-color:${hexMap[c.name]}" data-color="${c.name}" onclick="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'basketColor', '${c.name}')"></div>`;
  });
  html += `</div><div class="basket-selection-text" style="font-size:12px; color:#718096">Selected: ${item.basketColor || 'None'}</div></div>`;
  html += `<div class="form-group"><label>Greeting Card</label><textarea rows="2" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'greeting', this.value)">${item.greeting || ''}</textarea></div>`;
  return html;
}

function renderBloomBoxReviewInputs(item, pIdx, sIdx, iIdx) {
  let html = `<div class="form-group"><label>Flower Color</label><input type="text" value="${item.color || ''}" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)"></div>`;
  html += `<div class="form-group"><label>Box/Wrap Color</label><div class="color-options">`;
  wrapOptions.forEach(opt => {
     const isSelected = item.wrapColor === opt ? "selected" : "";
     html += `<button class="color-btn ${isSelected}" onclick="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'wrapColor', '${opt}')">${opt}</button>`;
  });
  html += `</div></div>`;
  html += `<div class="form-group"><label>Greeting Card</label><textarea rows="2" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'greeting', this.value)">${item.greeting || ''}</textarea></div>`;
  return html;
}

function renderAcrylicReviewInputs(item, pIdx, sIdx, iIdx) {
  if (!item.acrylic) item.acrylic = {};
  let html = `<div class="form-group"><label>Flower Color</label><input type="text" value="${item.color || ''}" oninput="updateSignatureReviewItem(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)"></div>`;
  html += `<hr style="margin:12px 0; border-top:1px solid #ddd;">`;
  html += `<div class="form-group"><label>Header</label><input type="text" placeholder="Selamat..." value="${item.acrylic.header || ''}" oninput="updateSignatureReviewAcrylic(${pIdx}, ${sIdx}, ${iIdx}, 'header', this.value)"></div>`;
  html += `<div class="form-group"><label>Event</label><input type="text" placeholder="Grand Opening..." value="${item.acrylic.event || ''}" oninput="updateSignatureReviewAcrylic(${pIdx}, ${sIdx}, ${iIdx}, 'event', this.value)"></div>`;
  html += `<div class="form-group"><label>Nama/Logo Penerima</label><input type="text" placeholder="Toko..." value="${item.acrylic.receiver || ''}" oninput="updateSignatureReviewAcrylic(${pIdx}, ${sIdx}, ${iIdx}, 'receiver', this.value)"></div>`;
  html += `<div class="form-group"><label>Nama Pemberi</label><input type="text" placeholder="Budi..." value="${item.acrylic.sender || ''}" oninput="updateSignatureReviewAcrylic(${pIdx}, ${sIdx}, ${iIdx}, 'sender', this.value)"></div>`;
  return html;
}

function updateSignatureReviewItem(pIdx, sIdx, iIdx, field, value) {
  const item = orderData.selectedProducts[pIdx].sizes[sIdx].items[iIdx];
  item[field] = value;
  
  const container = document.getElementById(`rev-sig-${pIdx}-${sIdx}-${iIdx}`);
  if (!container) return;

  if (field === 'mainFlower') {
    container.querySelectorAll('.flower-choice-card').forEach(card => {
        if (card.innerText.includes(value)) card.classList.add('selected');
        else card.classList.remove('selected');
    });
  } else if (field === 'basketColor') {
    container.querySelectorAll('.basket-color-btn').forEach(btn => {
        if (btn.dataset.color === value) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
    const txt = container.querySelector('.basket-selection-text');
    if(txt) txt.textContent = `Selected: ${value}`;
  } else if (field === 'wrapColor') {
    container.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.innerText.trim() === value) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
  }
}

function updateSignatureReviewAcrylic(pIdx, sIdx, iIdx, field, value) {
    const item = orderData.selectedProducts[pIdx].sizes[sIdx].items[iIdx];
    if (!item.acrylic) item.acrylic = {};
    item.acrylic[field] = value;
}

