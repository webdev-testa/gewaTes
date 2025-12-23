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
                  <input type="hidden" id="dec-ref-img-data-${sizeIdx}-${i}">
                </div>
            </div>

            <div class="form-group">
                <label>List Nama Tamu *</label>
                <textarea rows="4" id="dec-guests-${sizeIdx}-${i}" placeholder="List names here..."></textarea>
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
      const guests = document
        .getElementById(`dec-guests-${sizeIdx}-${i}`)
        .value.trim();
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
          <strong>(${sz.size})</strong>
          <div style="margin-top:8px;">
            <label style="font-size:14px;">Warna</label>
            <input type="text" value="${
              it.color
            }" style="width:100%; padding:8px; border:1px solid #e2e8f0; border-radius:4px;"
              oninput="updateItemData(${pIdx}, ${sIdx}, ${iIdx}, 'color', this.value)">
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
    html += `<strong>(${sz.size})</strong><br>
          Warna: ${it.color}<br>
          Event: ${it.eventType === "Other" ? it.eventDetail : it.eventType}<br>
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
    // Reset content if needed, but safer to keep
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
