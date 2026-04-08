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

  img.dataset.payload = `[INTERCEPTED: ${trackerName.toUpperCase()}]\n${payload}`;
  img.style.pointerEvents = "auto";

  img.addEventListener("mouseenter", showHoverPrompt);
  img.addEventListener("mouseleave", hideHoverPrompt);

  img.addEventListener("click", (e) => {
    e.stopPropagation();
    hideHoverPrompt(e); // Hide the prompt when they actually click!
    openDataTerminal(e.target.dataset.payload);
  });

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

  square.dataset.payload = `[INTERCEPTED: ${trackerName.toUpperCase()}]\n${payload}`;
  square.style.pointerEvents = "auto";

  ssquare.addEventListener("mouseenter", showHoverPrompt);
  square.addEventListener("mouseleave", hideHoverPrompt);

  square.addEventListener("click", (e) => {
    e.stopPropagation();
    hideHoverPrompt(e); // Hide the prompt when they actually click!
    openDataTerminal(e.target.dataset.payload);
  });

  document.body.appendChild(square);
}

// Click-to-Inspect Terminal Functions
function openDataTerminal(payloadData) {
  let terminal = document.getElementById("data-rot-terminal");

  // Build the terminal if it doesn't exist
  if (!terminal) {
    terminal = document.createElement("div");
    terminal.id = "data-rot-terminal";

    // Build the Close Button header
    const header = document.createElement("div");
    header.id = "data-rot-terminal-header";
    header.innerText = "[X] CLOSE";
    header.onclick = () => (terminal.style.display = "none");

    // Build the scrollable content area
    const content = document.createElement("div");
    content.id = "data-rot-terminal-content";

    terminal.appendChild(header);
    terminal.appendChild(content);
    document.body.appendChild(terminal);
  }

  // Inject the data and show the terminal
  document.getElementById("data-rot-terminal-content").innerText = payloadData;
  terminal.style.display = "flex"; // Use flex so the header stays at top
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

// NEW: Hover Prompt Functions
function showHoverPrompt(e) {
  let prompt = document.getElementById("data-rot-hover-prompt");
  if (!prompt) {
    prompt = document.createElement("div");
    prompt.id = "data-rot-hover-prompt";
    prompt.innerText = "[ CLICK TO INSPECT ]";
    document.body.appendChild(prompt);
  }
  prompt.style.display = "block";
  prompt.style.left = e.clientX + 15 + "px";
  prompt.style.top = e.clientY + 15 + "px";

  // Lock the prompt to the mouse movement
  e.target.addEventListener("mousemove", moveHoverPrompt);
}

function hideHoverPrompt(e) {
  const prompt = document.getElementById("data-rot-hover-prompt");
  if (prompt) {
    prompt.style.display = "none";
    e.target.removeEventListener("mousemove", moveHoverPrompt);
  }
}

function moveHoverPrompt(e) {
  const prompt = document.getElementById("data-rot-hover-prompt");
  if (prompt) {
    prompt.style.left = e.clientX + 15 + "px";
    prompt.style.top = e.clientY + 15 + "px";
  }
}
