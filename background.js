// A starter list of known tracker keywords
const trackerKeywords = [
  // --- THE GIANTS (Ads & Analytics) ---
  "doubleclick.net",
  "google-analytics.com",
  "facebook.com/tr",
  "adnxs.com",
  "quantserve.com",
  "scorecardresearch.com",
  "amazon-adsystem.com",

  // --- REAL-TIME BIDDING & BROKERS ---
  "criteo.com",
  "rubiconproject.com",
  "pubmatic.com",
  "openx.net",
  "casalemedia.com",

  // --- CONTENT RECOMMENDATION (Clickbait Grids) ---
  "outbrain.com",
  "taboola.com",

  // --- HEATMAPPING & SESSION RECORDERS (The Creepiest) ---
  "hotjar.com",
  "clarity.ms",
  "mouseflow.com",
  "fullstory.com",

  // --- SOCIAL MEDIA PIXELS ---
  "sc-static.net", // Snapchat Pixel
  "analytics.tiktok.com", // TikTok Pixel
  "linkedin.com/px", // LinkedIn Insight
  "pinterest.com/ct", // Pinterest Tag

  // --- TELEMETRY & APP PERFORMANCE ---
  "sentry.io",
  "newrelic.com",
  "datadoghq.com",
];

const dataTranslator = {
  // --- THE BASICS ---
  turl: "Page You Are Currently Reading",
  loc: "Exact Page Location",
  url: "Target URL",
  sid: "Surveillance Network Index",

  // --- PRIVACY & CONSENT ---
  gdpr: "EU Privacy Protection Active (0 = NO)",
  gdpr_consent: "Did you consent to this?",
  us_privacy: "US Privacy Act / CCPA Consent String",
  gdprl: "European Privacy Law Override Status",
  gpp: "Global Privacy Platform Consent String",

  // --- HARDWARE & DEVICE FINGERPRINTING ---
  uach: "Device Fingerprint (OS, Chip, Browser)",
  u_w: "Physical Monitor Width",
  u_h: "Physical Monitor Height",
  biw: "Browser Window Inner Width",
  bih: "Browser Window Inner Height",
  u_cd: "Screen Color Depth",
  u_tz: "Your Timezone Offset (Minutes)",
  sr: "Your Screen Resolution",
  ul: "Your System Language",

  // --- LIVE BEHAVIOR TRACKING ---
  scr_y: "Your Exact Vertical Scroll Depth (Pixels)",
  scr_x: "Your Exact Horizontal Scroll Position",
  u_his: "Length of Your Browser History",
  label: "Specific Tracked Behavior/Action",
  evet: "Event Tracking Trigger",

  // --- IDENTITY & COHORTS ---
  cookie: "Unique Tracking Cookie ID",
  ppid: "Your Unique Profile ID",
  crt: "Your Demographic Cohort Bucket",
  cid: "Unique Device Identifier",
  cust_params: "Custom Audience Targeting Parameters",

  // --- AUCTION & COMMERCE TRACKING ---
  bidrequestid: "Real-Time Auction ID for Your Attention",
  advertiserid: "Brand/Company Buying Your Data",
  campaignid: "Ad Campaign Actively Tracking You",
  creativeid: "Specific Media Injected Onto Your Screen",
  clickdestnurl: "Target Destination (Where They Want You)",
  schain: "Ad Supply Chain (Who is getting paid for your data)",
  mediatype: "Format of the Surveillance Media",
  is3p: "Third-Party Tracking Active",
  slots: "Inventory of Ad Spaces on Your Screen",
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

    // --- NEW: THE THIRD-PARTY FILTER ---
    // If Chrome can't identify who initiated the request, skip it to be safe
    if (!details.initiator) return;

    const targetUrl = new URL(details.url);
    const initiatorUrl = new URL(details.initiator);

    // Strip "www." so we can compare the raw base domains perfectly
    const targetDomain = targetUrl.hostname.replace("www.", "");
    const initiatorDomain = initiatorUrl.hostname.replace("www.", "");

    // If the target domain and initiator domain are the same, it's First-Party.
    // Example: sallysbakingaddiction.com is talking to api.sallysbakingaddiction.com
    if (
      targetDomain.includes(initiatorDomain) ||
      initiatorDomain.includes(targetDomain)
    ) {
      return; // Ignore it. It's a functional first-party request, not surveillance.
    }
    // -----------------------------------

    const url = details.url;

    // Find the specific tracker keyword that matches the URL
    const matchedTracker = trackerKeywords.find((keyword) =>
      url.includes(keyword),
    );

    if (matchedTracker && details.tabId !== -1) {
      // EXPOSING THE DATA: Parse the URL query strings
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      let humanReadable = "";
      let rawTelemetry = "";
      let paramCount = 0;

      for (let [key, value] of params) {
        let cleanValue =
          value.trim() === "" ? "[ BLANK / NOT PROVIDED ]" : value;

        let shortVal =
          cleanValue.length > 50
            ? cleanValue.substring(0, 50) + "..."
            : cleanValue;
        let lowerKey = key.toLowerCase();

        if (lowerKey === "us_privacy") {
          const upCaseVal = cleanValue.toUpperCase();
          if (upCaseVal === "1YYY") {
            shortVal = `${cleanValue} -> [ ALERT: USER EXPLICITLY OPTED OUT, BUT EXTRACTION CONTINUED ]`;
          } else if (upCaseVal === "1YNN" || upCaseVal === "1YNY") {
            shortVal = `${cleanValue} -> [ TRACKER CLAIMS USER CONSENTED TO DATA SALE ]`;
          } else if (upCaseVal.includes("-")) {
            shortVal = `${cleanValue} -> [ PRIVACY LAWS NOT APPLIED TO THIS TARGET ]`;
          } else {
            shortVal = `${cleanValue} -> [ RAW PRIVACY STRING ]`;
          }
        }

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
        payloadData += `--- RAW DATA ---\n${rawTelemetry}`;
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
