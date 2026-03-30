// Get the radio buttons
const radios = document.querySelectorAll('input[name="mode"]');

// Load the currently saved mode when you open the popup
chrome.storage.local.get(['rotMode'], (result) => {
  if (result.rotMode) {
    document.querySelector(`input[value="${result.rotMode}"]`).checked = true;
  }
});

// Save the new mode whenever you click a different option
radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const selectedMode = e.target.value;
    chrome.storage.local.set({ rotMode: selectedMode });
  });
});