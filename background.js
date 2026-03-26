// A starter list of known tracker keywords
const trackerKeywords = [
    "doubleclick.net",
    "google-analytics.com",
    "facebook.com/tr",
    "adnxs.com",
    "quantserve.com",
    "scorecardresearch.com",
    "amazon-adsystem.com"
  ];
  
  // Listen for all outgoing network requests
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const url = details.url;
      
      // Check if the URL contains any of our tracker keywords
      const isTracker = trackerKeywords.some(keyword => url.includes(keyword));
  
      if (isTracker) {
        console.log("Tracker detected: ", url);
  
        // Send a message to the content script in the active tab to trigger the "Rot"
        chrome.tabs.sendMessage(details.tabId, { type: "TRACKER_DETECTED" });
      }
    },
    { urls: ["<all_urls>"] }
  );