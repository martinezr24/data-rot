console.log("Data Rot is active and watching...");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACKER_DETECTED") {
    console.warn("SURVEILLANCE DETECTED. INITIATING ROT.");
  }
});