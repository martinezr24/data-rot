// A starter list of known tracker keywords
const trackerKeywords = [
  "doubleclick.net",
  "google-analytics.com",
  "facebook.com/tr",
  "adnxs.com",
  "quantserve.com",
  "scorecardresearch.com",
  "amazon-adsystem.com",
];

let isActive = true;

// Keep track of the power switch state
chrome.storage.local.get(["isActive"], (result) => {
  if (result.isActive !== undefined) isActive = result.isActive;
});
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isActive) isActive = changes.isActive.newValue;
});

// Listen for all outgoing network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!isActive) return;

    const url = details.url;

    // Find the specific tracker keyword that matches the URL
    const matchedTracker = trackerKeywords.find((keyword) =>
      url.includes(keyword),
    );

    // Check if the URL contains any of our tracker keywords
    const isTracker = trackerKeywords.some((keyword) => url.includes(keyword));

    if (matchedTracker && details.tabId !== -1) {
      // EXPOSING THE DATA: Parse the URL query strings
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      // Build a readable string of the exact variables they are stealing
      let payloadData = "";
      let paramCount = 0;
      for (let [key, value] of params) {
        // Truncate massively long values so it fits on screen
        let shortVal =
          value.length > 50 ? value.substring(0, 50) + "..." : value;
        payloadData += `> ${key}: ${shortVal}\n`;
        paramCount++;
      }

      // If there are no obvious URL parameters, just show the destination path
      if (paramCount === 0) {
        payloadData = `> TARGET: ${urlObj.pathname}`;
      }

      // Send the specific tracker name to the content script
      chrome.tabs
        .sendMessage(details.tabId, {
          type: "TRACKER_DETECTED",
          trackerName: matchedTracker,
          payload: payloadData,
        })
        .catch(() => {});
    }
  },
  { urls: ["<all_urls>"] },
);
