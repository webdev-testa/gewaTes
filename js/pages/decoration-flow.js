function renderDecorationPage2() {
  const sizeOptionsDiv = document.getElementById("sizeOptions");
  sizeOptionsDiv.innerHTML = "";
  sizeOptionsDiv.className = ""; // Remove grid class so it spans full width


  // Update Header for Page 2 (Optional but good UX)
  document.querySelector("#page2 h1").innerText = "Event Details";
  document.querySelector("#page2 .description").innerText =
    "Tell us about your event.";

  const container = document.createElement("div");
  container.innerHTML = `
    <div class="form-group">
        <label>Berapa orang yang akan hadir di acara kamu?</label>
        <p style="font-size: 14px; color: #718096; margin-bottom: 8px;">1 pax = 1 orang</p>
        
        <div class="size-item" style="border:none; padding:0; margin-bottom:16px; justify-content: center;">
            <div class="size-img" style="width:100%; height:auto; background:transparent;">
                <img src="${getSizeImage('decoration', 'Table Decoration')}" alt="Table Decoration" style="width:100%; height:auto; border-radius:8px;">
            </div>
        </div>

        <div class="quantity-control" style="justify-content: center;">
            <button class="qty-btn" onclick="changeDecorationPax(-1)">−</button>
            <input type="number" class="qty-input" id="dec-pax-display" value="0" min="0" onchange="manualDecorationPaxChange(this.value)" oninput="checkPaxMismatch()" onfocus="this.select()">
            <button class="qty-btn" onclick="changeDecorationPax(1)">+</button>
        </div>
    </div>

    <div class="form-group" style="margin-top: 24px;">
        <label>📃 Sertakan List Nama Orang yang Menghadiri Acara</label>
        <p style="font-size: 14px; color: #718096; margin-bottom: 8px;">Masukkan juga nama kamu, jika kamu menjadi tuan acara. Pisahkan dengan Enter.</p>
        <textarea rows="6" id="dec-guest-list-input" 
          placeholder="List names here (separated by enter or comma)..." 
          onblur="cleanGuestListInput(this)" 
          oninput="updateGuestCounter(this)"></textarea>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
            <div id="pax-mismatch-warning" style="font-size: 13px; color: #e53e3e; display:none; flex: 1; padding-right: 8px;">
                ⚠️ Mismatch: List has <span id="list-count-val">0</span> names but Pax is <span id="pax-val">0</span>.
            </div>
            <div id="guest-list-counter" style="font-size: 13px; color: #2d3748; font-weight: 600; white-space: nowrap;">
                ✅ 0 names detected
            </div>
        </div>
    </div>
  `;
  sizeOptionsDiv.appendChild(container);

  showPage(2);
}

function cleanGuestListInput(textarea) {
    const raw = textarea.value;
    if (!raw.trim()) return;

    // Split by newlines, commas, or semicolons
    const lines = raw.split(/[\n,;]+/);
    
    const cleaned = lines
        .map(line => {
            // Remove leading bullets, numbers (1., 2.), dashes, etc.
            return line.replace(/^[\s\d\.\-\•\*]+/, '').trim();
        })
        .filter(line => line.length > 0); // Remove empty lines

    // Join back with newlines
    textarea.value = cleaned.join("\n");
    updateGuestCounter(textarea);
}

function updateGuestCounter(textarea) {
    const raw = textarea.value;
    const count = raw.split(/[\n,;]+/)
        .map(l => l.trim())
        .filter(l => l.length > 0).length;

    const counterEl = document.getElementById("guest-list-counter");
    if (counterEl) {
        if (count > 0) {
          // Always visible if > 0 to match user request context usually,
          // or we can hide if 0. Structure above assumes it might be hidden initially.
          counterEl.style.display = "block";
          counterEl.innerText = `✅ ${count} name${count !== 1 ? 's' : ''} detected`;
        } else {
          counterEl.style.display = "none";
        }
    }
    
    checkPaxMismatch(count);
}

function checkPaxMismatch(listCount) {
    // If listCount is not passed, calculate it
    if (listCount === undefined) {
        const textarea = document.getElementById("dec-guest-list-input");
        const raw = textarea ? textarea.value : "";
        listCount = raw.split(/[\n,;]+/)
            .map(l => l.trim())
            .filter(l => l.length > 0).length;
    }

    const paxInput = document.getElementById("dec-pax-display");
    const pax = parseInt(paxInput.value) || 0;
    
    const warningEl = document.getElementById("pax-mismatch-warning");
    const listCountVal = document.getElementById("list-count-val");
    const paxVal = document.getElementById("pax-val");

    if (warningEl && listCount > 0) { // Only warn if there is a list
        if (listCount !== pax) {
            warningEl.style.display = "block";
            if(listCountVal) listCountVal.innerText = listCount;
            if(paxVal) paxVal.innerText = pax;
        } else {
            warningEl.style.display = "none";
        }
    } else if (warningEl) {
        warningEl.style.display = "none";
    }
}

function changeDecorationPax(delta) {
  const display = document.getElementById("dec-pax-display");
  let val = parseInt(display.value) || 0;
  val = Math.max(0, val + delta);
  display.value = val;
  checkPaxMismatch();
}

function manualDecorationPaxChange(val) {
  const display = document.getElementById("dec-pax-display");
  let v = parseInt(val) || 0;
  v = Math.max(0, v);
  display.value = v;
  checkPaxMismatch();
}

function handleDecorationPage2Next(currentProduct) {
  const pax = parseInt(
    document.getElementById("dec-pax-display").value
  ) || 0;
  const guestList = document.getElementById("dec-guest-list-input").value.trim();

  if (pax <= 0) {
    alert("Please specify the number of guests (Pax).");
    return;
  }
  if (!guestList) {
    alert("Please provide the guest list.");
    return;
  }

  // Save to temporary storage on the product object
  currentProduct.decorationData = { pax, guestList };

  // Set a dummy size object so the rest of the flow works (1 item to configure)
  currentProduct.sizes = [{ size: "Decoration", quantity: 1, items: [] }];

  renderDecorationPage(currentProduct);
}

function renderDecorationPage(currentProduct) {
  const specDiv = document.getElementById("orderSpecifications");
  specDiv.innerHTML = "";

  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    for (let i = 0; i < sizeObj.quantity; i++) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";

      // Event Options
      const eventOpts = eventOptions
        .map((opt) => `<option value="${opt}">${opt}</option>`)
        .join("");

      itemDiv.innerHTML = `
            <div class="order-item-header">${currentProduct.type} - ${
        sizeObj.size
      } (Item #${i + 1})</div>
            
            <div class="form-group">
                <label>Warna *</label>
                <input type="text" id="dec-color-${sizeIdx}-${i}" placeholder="Enter decoration color" />
                <div style="margin-top:8px;">
                  <label style="font-size:14px;">Reference Image (Optional)</label>
                  <input type="file" accept="image/*" id="dec-ref-img-${sizeIdx}-${i}" 
                        style="font-size: 14px;" onchange="handleImageUpload(this)">
                  <div style="font-size: 12px; color: #718096; margin-top: 4px;">
                    Max size 2MB. Need to compress? <a href="https://www.iloveimg.com/compress-image" target="_blank" style="text-decoration: underline; color: #718096;">Click here</a>
                  </div>
                  <input type="hidden" id="dec-ref-img-data-${sizeIdx}-${i}">
                </div>
            </div>

            <div class="form-group">
                <input type="hidden" id="dec-guests-${sizeIdx}-${i}" value="PREFILLED_FROM_PAGE_2"> 
                <!-- Hidden input just to keep ID consistency if needed, but we will ignore it in validation -->
            </div>

            <div class="form-group">
                <label>Kebutuhan acara apa?*</label>
                <select id="dec-event-${sizeIdx}-${i}" style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:8px;" onchange="toggleDecorationOther(${sizeIdx}, ${i})">
                    ${eventOpts}
                </select>
            </div>

            <div class="form-group" id="dec-other-container-${sizeIdx}-${i}" style="display:none;">
                <label>What's The Event?*</label>
                <input type="text" id="dec-other-${sizeIdx}-${i}" placeholder="Isi" />
            </div>
        `;
      specDiv.appendChild(itemDiv);
    }
  });

  showPage(3);
}

function toggleDecorationOther(sizeIdx, itemIdx) {
  const select = document.getElementById(`dec-event-${sizeIdx}-${itemIdx}`);
  const otherContainer = document.getElementById(
    `dec-other-container-${sizeIdx}-${itemIdx}`
  );
  if (select.value === "Other") {
    otherContainer.style.display = "block";
  } else {
    otherContainer.style.display = "none";
  }
}

function validateAndSaveDecorationOrder(currentProduct) {
  let allValid = true;
  currentProduct.sizes.forEach((sizeObj, sizeIdx) => {
    sizeObj.items = [];
    for (let i = 0; i < sizeObj.quantity; i++) {
      const color = document
        .getElementById(`dec-color-${sizeIdx}-${i}`)
        .value.trim();
      const imgData = document.getElementById(
        `dec-ref-img-data-${sizeIdx}-${i}`
      ).value;
      const guests = currentProduct.decorationData ? currentProduct.decorationData.guestList : "";
      const pax = currentProduct.decorationData ? currentProduct.decorationData.pax : 0;
      const eventType = document.getElementById(
        `dec-event-${sizeIdx}-${i}`
      ).value;
      let otherDetail = "";

      if (eventType === "Other") {
        otherDetail = document
          .getElementById(`dec-other-${sizeIdx}-${i}`)
          .value.trim();
        if (!otherDetail) allValid = false;
      }

      if (!color || !guests || !eventType) {
        allValid = false;
      } else {
        sizeObj.items.push({
          color: color,
          referenceImage: imgData || "",
          guestList: guests,
          pax: pax,
          eventType: eventType,
          eventDetail: eventType === "Other" ? otherDetail : eventType,
          isDecoration: true,
        });
      }
    }
  });
  return allValid;
}

function getDecorationReviewHTML(it, sz, isEdit, pIdx, sIdx, iIdx) {
  let html = "";

  if (isEdit) {
    const evOpts = eventOptions
      .map(
        (opt) =>
          `<option value="${opt}" ${
            it.eventType === opt ? "selected" : ""
          }>${opt}</option>`
      )
      .join("");

    const isOther = it.eventType === "Other";

    html += `
          <div style="font-weight:bold; margin-bottom:4px;">${sz.size}</div>
          <div style="margin-top:8px;">
            <label style="font-size:14px;">Warna</label>
            <input type="text" value="${
              it.color
            }" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
              oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)">
          </div>
            <label style="font-size:14px;">Pax</label>
            <input type="number" value="${it.pax}" 
                  style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                  oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'pax', this.value)"
                  onfocus="this.select()">
          </div>
          <div style="margin-top:8px;">
            <label style="font-size:14px;">List Nama Tamu</label>
            <textarea rows="4" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
              oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'guestList', this.value)">${
      it.guestList
    }</textarea>
          </div>
          <div style="margin-top:8px;">
            <label style="font-size:14px;">Event Type</label>
            <select style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                id="rev-event-${pIdx}-${sIdx}-${iIdx}"
                onchange="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'eventType', this.value); toggleReviewDecorationOther(${pIdx}, ${sIdx}, ${iIdx});">
                ${evOpts}
            </select>
          </div>
          <div style="margin-top:8px; display:${
            isOther ? "block" : "none"
          };" id="rev-other-container-${pIdx}-${sIdx}-${iIdx}">
              <label style="font-size:14px;">Other Detail</label>
              <input type="text" value="${
                it.eventDetail === "Other" ? "" : it.eventDetail
              }" 
                style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
                oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'eventDetail', this.value)">
          </div>
          `;
  } else {
    html += `<div style="font-weight:bold; margin-bottom:4px;">${sz.size}</div>
          Warna: ${it.color}<br>
          Event: ${it.eventType === "Other" ? it.eventDetail : it.eventType}<br>
          Pax: ${it.pax}<br>
          Guests: <pre style="margin:0; font-family:inherit;">${
            it.guestList
          }</pre>`;
  }
  return html;
}

function toggleReviewDecorationOther(pIdx, sIdx, iIdx) {
  const val = document.getElementById(
    `rev-event-${pIdx}-${sIdx}-${iIdx}`
  ).value;
  const cont = document.getElementById(
    `rev-other-container-${pIdx}-${sIdx}-${iIdx}`
  );
  if (val === "Other") {
    cont.style.display = "block";
    // Clear previous value so input is empty
    updateItemData(pIdx, sIdx, iIdx, "eventDetail", "");
    const input = cont.querySelector("input");
    if (input) input.value = "";
  } else {
    cont.style.display = "none";
    updateItemData(pIdx, sIdx, iIdx, "eventDetail", val);
  }
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
