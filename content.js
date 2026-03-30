console.log("Data Rot is active and watching...");

const cookieImages = [
  "images/cookie1.png",
  "images/cookie2.png",
  "images/cookie3.png",
  "images/cookie4.png",
]

let trackerCount = 0; 
let currentMode = "cookies"; // Default mode

// Get the initial mode when page loads
chrome.storage.local.get(['rotMode'], (result) => {
  if (result.rotMode) {
    currentMode = result.rotMode;
  }
});

// Listen for live changes (so you can switch modes without refreshing the page)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.rotMode) {
    currentMode = changes.rotMode.newValue;
    console.log("Mode switched to:", currentMode);
  }
});

// Listen for the tracker signal
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TRACKER_DETECTED") {
    trackerCount++;      
    updateCounterUI();   
    
    // Inject based on the current toggle setting
    if (currentMode === "cookies") {
      injectCookie();      
    } else if (currentMode === "blackout") {
      injectBlackout();
    }
  }
});

function updateCounterUI() {
  let counter = document.getElementById('data-rot-counter');
  
  // If the counter doesn't exist on the page yet, build it
  if (!counter) {
    counter = document.createElement('div');
    counter.id = 'data-rot-counter';
    document.body.appendChild(counter);
  }
  
  // Update the text with the current count
  counter.innerText = `SURVEILLANCE COOKIES: ${trackerCount}`;
}

// Inject a Cookie
function injectCookie() {
  const img = document.createElement('img');
  img.className = 'data-rot-cookie';
  
  const randomImage = cookieImages[Math.floor(Math.random() * cookieImages.length)];
  img.src = chrome.runtime.getURL(randomImage);
  
  const size = Math.floor(Math.random() * 140) + 60; 
  img.style.width = size + 'px';
  img.style.height = 'auto'; 
  
  positionElementRandomly(img, size);
  
  const rotation = Math.floor(Math.random() * 360);
  img.style.transform = `rotate(${rotation}deg)`;
  
  document.body.appendChild(img);
}

// Inject a Blackout Square
function injectBlackout() {
  const square = document.createElement('div');
  square.className = 'data-rot-block glitch'; 
  
  const size = Math.floor(Math.random() * 150) + 50; 
  square.style.width = size + 'px';
  square.style.height = size + 'px';
  
  positionElementRandomly(square, size);
  
  document.body.appendChild(square);
}

// Helper function to handle random positioning for both shapes
function positionElementRandomly(element, size) {
  const posX = Math.floor(Math.random() * window.innerWidth);
  const posY = Math.floor(Math.random() * document.documentElement.scrollHeight);
  
  element.style.left = (posX - (size / 2)) + 'px';
  element.style.top = (posY - (size / 2)) + 'px';
}