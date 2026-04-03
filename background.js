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

// Listen for all outgoing network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;

    // Find the specific tracker keyword that matches the URL
    const matchedTracker = trackerKeywords.find((keyword) =>
      url.includes(keyword),
    );

    // Check if the URL contains any of our tracker keywords
    const isTracker = trackerKeywords.some((keyword) => url.includes(keyword));

    if (matchedTracker && details.tabId !== -1) {
      // Send the specific tracker name to the content script
      chrome.tabs
        .sendMessage(details.tabId, {
          type: "TRACKER_DETECTED",
          trackerName: matchedTracker,
        })
        .catch(() => {
          // Ignore!
        });
    }
  },
  { urls: ["<all_urls>"] },
);
