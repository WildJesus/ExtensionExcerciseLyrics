// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const autoToggle = document.getElementById('autoToggle');
    const searchButton = document.getElementById('searchButton');
  
    // Function to send a message to the active tab to display lyrics.
    function displayLyrics() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "displayLyrics" }, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error from content script:", chrome.runtime.lastError.message);
          } else if (response && response.error) {
            console.error("Content script error:", response.error);
          } else {
            console.log("Lyrics overlay triggered.");
          }
        });
      });
    }
  
    // Load the stored autoDisplay setting from storage.
    chrome.storage.local.get(['autoDisplay'], function(result) {
      console.log("Stored autoDisplay:", result.autoDisplay);
      // If not set, default to false.
      autoToggle.checked = result.autoDisplay === true;
      if (autoToggle.checked) {
        displayLyrics();
      }
    });
  
    // When the toggle changes, save the new setting and (if enabled) display lyrics.
    autoToggle.addEventListener('change', function() {
      chrome.storage.local.set({ autoDisplay: autoToggle.checked }, function() {
        console.log('Auto display setting saved:', autoToggle.checked);
      });
      if (autoToggle.checked) {
        displayLyrics();
      }
    });
  
    // Also, display lyrics when the button is pressed.
    searchButton.addEventListener('click', function() {
      displayLyrics();
    });
  });
  