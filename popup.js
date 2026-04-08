// Get the radio buttons
const radios = document.querySelectorAll('input[name="mode"]');
const powerSwitch = document.getElementById("power-switch");

// Load the currently saved mode when you open the popup
chrome.storage.local.get(["rotMode", "isActive"], (result) => {
  if (result.rotMode) {
    document.querySelector(`input[value="${result.rotMode}"]`).checked = true;
  }
  // Default to true if not set yet
  powerSwitch.checked = result.isActive !== false;
});

// Save the new mode whenever you click a different option
radios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const selectedMode = e.target.value;
    chrome.storage.local.set({ rotMode: selectedMode });
  });
});

// Save power switch changes
powerSwitch.addEventListener("change", (e) => {
  chrome.storage.local.set({ isActive: e.target.checked });
});
