let isMusic = false;
let resultMsg = "No music tag found for this video.";

// Select all JSON‑LD scripts
const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');

ldJsonScripts.forEach(script => {
  try {
    const data = JSON.parse(script.textContent);
    
    // You might get an array or a single object; handle both cases:
    const videos = Array.isArray(data) ? data : [data];
    
    videos.forEach(videoData => {
      if (videoData["@type"] === "VideoObject" && videoData.genre) {
        // Check if genre is "Music" (case-insensitive)
        if (videoData.genre.toLowerCase() === "music") {
          isMusic = true;
        }
      }
    });
  } catch (e) {
    console.error("Error parsing JSON‑LD:", e);
  }
});

if (isMusic) {
  resultMsg = "This video is tagged as Music!";
}

// For example, log the result or send it to your popup:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runCheck") {
      const result = checkForMusic();
      sendResponse({ result });
    }
  });