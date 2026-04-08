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

const dataTranslator = {
  turl: "Page You Are Currently Reading",
  sid: "Surveillance Network Index",
  gdpr: "EU Privacy Protection Active (0 = NO)",
  gdpr_consent: "Did you consent to this?",
  tagtype: "Media Type Watching You",
  c2: "Your Browser Window Width",
  c3: "Your Browser Window Height",
  ppid: "Your Unique Profile ID",
  crt: "Your Demographic Cohort Bucket",
  cid: "Unique Device Identifier",
  sr: "Your Screen Resolution",
  ul: "Your System Language",
  dt: "Page Title",
  v: "Tracker Version",
};

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

      let humanReadable = "";
      let rawTelemetry = "";
      let paramCount = 0;

      for (let [key, value] of params) {
        let shortVal =
          value.length > 50 ? value.substring(0, 50) + "..." : value;
        let lowerKey = key.toLowerCase();

        // Check if we have a plain-English translation for this data point
        if (dataTranslator[lowerKey]) {
          humanReadable += `[!] ${dataTranslator[lowerKey]}:\n    ${shortVal}\n`;
        } else {
          rawTelemetry += `> ${key}: ${shortVal}\n`;
        }
        paramCount++;
      }

      // Construct the final payload to send to the screen
      let payloadData = "";
      if (humanReadable.length > 0) {
        payloadData += `--- TRANSLATED EXTRACTS ---\n${humanReadable}\n`;
      }
      if (rawTelemetry.length > 0) {
        payloadData += `--- OBFUSCATED RAW DATA ---\n${rawTelemetry}`;
      }

      if (paramCount === 0) {
        payloadData = `> TARGET: ${urlObj.pathname}`;
      }

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
