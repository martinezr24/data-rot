# Data Rot
### *Visualizing the Surveillance Tax of the Modern Web*

**Data Rot** is a digital art piece and Chrome extension designed to make the invisible extraction of user data physical, obstructive, and unavoidable. 

In the modern browsing experience, "free" content is paid for with a silent tax: our privacy. While we read a recipe or news article, dozens of third-party trackers are going on in the background, harvesting behavioral data. We have been trained to ignore this extraction because it is invisible. 

**Data Rot ends that invisibility.**

---

## The Concept: "The Entropy of Tracking"
Every time a background tracker is detected, the extension "infects" the webpage. It injects a visual block—a black redaction square—directly onto the page. 

* **The more you are watched, the less you can see.** * **The longer you stay on a heavily surveilled site, the more the content "rots" under the weight of its own surveillance.**
* **The final state is total obfuscation:** a webpage rendered unreadable by the very scripts designed to monetize your attention.

---

## Technical Execution
Built as a lightweight Chrome Extension (**Manifest V3**), the project utilizes:

* **Background Service Workers:** Intercepts live network requests using the `chrome.webRequest` API and matches them against a dictionary of known tracking domains (e.g., DoubleClick, AdThrive, Slickstream).
* **DOM Injection:** When a match is found, a message is passed to a content script that dynamically generates and positions "Rot Blocks" using absolute CSS positioning and randomized scaling.
* **Developer Mode Deployment:** Bypasses the Chrome Web Store to allow for aggressive script injection and real-time manipulation during live performance.

---

## Installation & Setup
1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top right corner.
4. Click **Load Unpacked** and select the `data-rot` project folder.
5. **CRITICAL:** Disable existing ad-blockers (e.g., uBlock Origin, AdBlock) for the target site. If the trackers are blocked by another extension, the "Rot" cannot trigger.

## The Performance
For the final critique, the artist will attempt to perform a mundane task—such as reading a recipe or news article—while the screen actively degrades in real-time. This forces the audience to witness the literal, cumulative cost of "free" data.

---
*Created for [Your Class Name], Yale University, 2026.*