document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('clickMe').addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "runCheck" }, function(response) {
          console.log(response.result);
          // Update your popup UI as needed.
          document.getElementById('result').textContent = response.result;
        });
      });
    });
  });
  