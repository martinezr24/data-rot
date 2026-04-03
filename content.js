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
    console.log("Mode switched to:", currentMode);

    clearRot();
  }
});

// Listen for the tracker signal
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TRACKER_DETECTED") {
    trackerCount++;

    // Tally the specific tracker domain
    const name = message.trackerName;
    trackerStats[name] = (trackerStats[name] || 0) + 1;

    updateCounterUI();

    // Inject based on the current toggle setting
    if (currentMode === "cookies") {
      injectCookie();
    } else if (currentMode === "blackout") {
      injectBlackout();
    }
  }
});

// Clears all previous rot on screen if switched modes
function clearRot() {
  // Find all cookies and blackout blocks currently on the page
  const existingRot = document.querySelectorAll(
    ".data-rot-cookie, .data-rot-block",
  );

  // Remove each one from the DOM
  existingRot.forEach((element) => element.remove());

  // Reset the counter to 0 and update the UI
  trackerCount = 0;
  trackerStats = {};
  updateCounterUI();
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
function injectCookie() {
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

  document.body.appendChild(img);
}

// Inject a Blackout Square
function injectBlackout() {
  const square = document.createElement("div");
  square.className = "data-rot-block glitch";

  const size = Math.floor(Math.random() * 150) + 50;
  square.style.width = size + "px";
  square.style.height = size + "px";

  positionElementRandomly(square, size);

  document.body.appendChild(square);
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
