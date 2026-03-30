console.log("Data Rot is active and watching...");

const cookieImages = [
  "images/cookie1.png",
  "images/cookie2.png",
  "images/cookie3.png",
  "images/cookie4.png",
]

let trackerCount = 0; 

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACKER_DETECTED") {
    trackerCount++;      // Increment the count
    updateCounterUI();   // Update the number on screen
    injectCookie();      // Drop the cookie
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

function injectRot() {
    const rot = document.createElement('div');
    rot.className = 'data-rot-block glitch';
    
    // Randomize size
    const size = Math.floor(Math.random() * 150) + 50; // 50px to 200px
    rot.style.width = size + 'px';
    rot.style.height = size + 'px';
    
    // Randomize position on the screen
    const posX = Math.floor(Math.random() * window.innerWidth);
    const posY = Math.floor(Math.random() * (document.documentElement.scrollHeight));
    
    rot.style.left = posX + 'px';
    rot.style.top = posY + 'px';
    
    document.body.appendChild(rot);
  }

function injectCookie() {
  const img = document.createElement('img');
  img.className = 'data-rot-cookie';
  
  // Randomly select a cookie from the array
  const randomImage = cookieImages[Math.floor(Math.random() * cookieImages.length)];
  
  // You MUST use getURL to translate the local path to a Chrome extension path
  img.src = chrome.runtime.getURL(randomImage);
  
  // Randomize size (between 60px and 200px)
  const size = Math.floor(Math.random() * 140) + 60; 
  img.style.width = size + 'px';
  img.style.height = 'auto'; // Maintains the image's aspect ratio
  
  // Randomize position across the entire scrollable document
  const posX = Math.floor(Math.random() * window.innerWidth);
  const posY = Math.floor(Math.random() * document.documentElement.scrollHeight);
  
  img.style.left = (posX - (size / 2)) + 'px';
  img.style.top = (posY - (size / 2)) + 'px';
  
  // Apply a random rotation for maximum chaos
  const rotation = Math.floor(Math.random() * 360);
  img.style.transform = `rotate(${rotation}deg)`;
  
  document.body.appendChild(img);
}

function injectCookie() {
  const img = document.createElement('img');
  img.className = 'data-rot-cookie';
  
  // Randomly select a cookie from the array
  const randomImage = cookieImages[Math.floor(Math.random() * cookieImages.length)];
  
  img.src = chrome.runtime.getURL(randomImage);
  
  // Randomize size (between 60px and 200px)
  const size = Math.floor(Math.random() * 140) + 60; 
  img.style.width = size + 'px';
  img.style.height = 'auto'; 
  
  // Randomize position across the entire scrollable document
  const posX = Math.floor(Math.random() * window.innerWidth);
  const posY = Math.floor(Math.random() * document.documentElement.scrollHeight);
  
  img.style.left = (posX - (size / 2)) + 'px';
  img.style.top = (posY - (size / 2)) + 'px';
  
  // Apply a random rotation for maximum chaos
  const rotation = Math.floor(Math.random() * 360);
  img.style.transform = `rotate(${rotation}deg)`;
  
  document.body.appendChild(img);
}