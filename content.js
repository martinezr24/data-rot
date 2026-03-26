console.log("Data Rot is active and watching...");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACKER_DETECTED") {
    injectRot();
  }
});

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