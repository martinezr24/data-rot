console.log("Data Rot is active and watching...");

const cookieImages = [
  "images/cookie1.png",
  "images/cookie2.png",
  "images/cookie3.png",
  "images/cookie4.png",
];

let trackerCount = 0;
let trackerStats = {};
let currentMode = "cookies"; // Default mode

// Get the initial mode when page loads
chrome.storage.local.get(["rotMode"], (result) => {
  if (result.rotMode) {
    currentMode = result.rotMode;
  }
});

// Listen for live changes (so you can switch modes without refreshing the page)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.rotMode) {
    currentMode = changes.rotMode.newValue;
    clearRot();
  }
  if (changes.isActive !== undefined) {
    if (changes.isActive.newValue === false) {
      clearRot(); // Instantly wipe the screen if toggled off
    }
  }
});

chrome.runtime.onMessage.addListener((message) => {
  // Check if system is active before injecting
  chrome.storage.local.get(["isActive"], (result) => {
    if (result.isActive === false) return;

    if (message.type === "TRACKER_DETECTED") {
      trackerCount++;
      const name = message.trackerName;
      trackerStats[name] = (trackerStats[name] || 0) + 1;
      updateCounterUI();

      // Pass the payload to the inject functions!
      if (currentMode === "cookies") {
        injectCookie(message.payload, name);
      } else if (currentMode === "blackout") {
        injectBlackout(message.payload, name);
      }
    }
  });
});

// Clears all previous rot on screen if switched modes
function clearRot() {
  const existingRot = document.querySelectorAll(
    ".data-rot-cookie, .data-rot-block",
  );
  existingRot.forEach((element) => element.remove());

  trackerCount = 0;
  trackerStats = {};

  const counterBox = document.getElementById("data-rot-counter-box");
  if (counterBox) counterBox.remove(); // Remove the UI completely
}

function updateCounterUI() {
  let counterBox = document.getElementById("data-rot-counter-box");

  // Build the container if it doesn't exist
  if (!counterBox) {
    counterBox = document.createElement("div");
    counterBox.id = "data-rot-counter-box";

    // The clickable header
    const header = document.createElement("div");
    header.id = "data-rot-header";
    header.style.cursor = "pointer";
    header.title = "Click to view the surveillance receipt";

    // The hidden details container
    const details = document.createElement("div");
    details.id = "data-rot-details";
    details.style.display = "none";

    // Toggle logic for the dropdown
    header.addEventListener("click", () => {
      const isHidden = details.style.display === "none";
      details.style.display = isHidden ? "block" : "none";
    });

    counterBox.appendChild(header);
    counterBox.appendChild(details);
    document.body.appendChild(counterBox);
  }

  // Update the data inside the UI
  const header = document.getElementById("data-rot-header");
  const details = document.getElementById("data-rot-details");

  // Update total count
  header.innerText = `SURVEILLANCE TRACKERS: ${trackerCount} ▼`;

  // Build the itemized receipt
  let detailsHTML = '<hr style="border-color:#ff3333; margin: 10px 0;">';
  for (const [domain, count] of Object.entries(trackerStats)) {
    detailsHTML += `
      <div style="display:flex; justify-content:space-between; font-size:16px; margin-bottom: 5px;">
        <span style="opacity: 0.8;">${domain}</span>
        <span style="font-weight: bold;">${count}</span>
      </div>`;
  }
  details.innerHTML = detailsHTML;
}

// Inject a Cookie
function injectCookie(payload, trackerName) {
  const img = document.createElement("img");
  img.className = "data-rot-cookie";

  const randomImage =
    cookieImages[Math.floor(Math.random() * cookieImages.length)];
  img.src = chrome.runtime.getURL(randomImage);

  const size = Math.floor(Math.random() * 140) + 60;
  img.style.width = size + "px";
  img.style.height = "auto";

  positionElementRandomly(img, size);

  const rotation = Math.floor(Math.random() * 360);
  img.style.transform = `rotate(${rotation}deg)`;

  // Add the data payload to the element
  img.dataset.payload = `[INTERCEPTED: ${trackerName.toUpperCase()}]\n${payload}`;

  // Add hover effects for the tooltip
  img.style.pointerEvents = "auto";
  img.addEventListener("mouseenter", showDataTooltip);
  img.addEventListener("mouseleave", hideDataTooltip);

  document.body.appendChild(img);
}

// Inject a Blackout Square
function injectBlackout(payload, trackerName) {
  const square = document.createElement("div");
  square.className = "data-rot-block glitch";

  const size = Math.floor(Math.random() * 150) + 50;
  square.style.width = size + "px";
  square.style.height = size + "px";

  positionElementRandomly(square, size);

  // Add the data payload to the element
  square.dataset.payload = `[INTERCEPTED: ${trackerName.toUpperCase()}]\n${payload}`;

  // Add hover effects for the tooltip
  square.style.pointerEvents = "auto";
  square.addEventListener("mouseenter", showDataTooltip);
  square.addEventListener("mouseleave", hideDataTooltip);

  document.body.appendChild(square);
}

function showDataTooltip(e) {
  let tooltip = document.getElementById("data-rot-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "data-rot-tooltip";
    document.body.appendChild(tooltip);
  }

  tooltip.innerText = e.target.dataset.payload;
  tooltip.style.display = "block";

  // Track mouse movement to lock the tooltip to the cursor
  document.addEventListener("mousemove", moveTooltip);
}

function hideDataTooltip() {
  const tooltip = document.getElementById("data-rot-tooltip");
  if (tooltip) {
    tooltip.style.display = "none";
    document.removeEventListener("mousemove", moveTooltip);
  }
}

function moveTooltip(e) {
  const tooltip = document.getElementById("data-rot-tooltip");
  // Offset slightly from the cursor so it doesn't block the mouse
  tooltip.style.left = e.clientX + 15 + "px";
  tooltip.style.top = e.clientY + 15 + "px";
}

// Helper function to handle random positioning for both shapes
function positionElementRandomly(element, size) {
  const posX = Math.floor(Math.random() * window.innerWidth);
  const posY = Math.floor(
    Math.random() * document.documentElement.scrollHeight,
  );

  element.style.left = posX - size / 2 + "px";
  element.style.top = posY - size / 2 + "px";
}
