// content.js

// Returns a search query (video title + " lyrics") if the video is a music video.
function checkForMusic() {
    let isMusic = false;
    let videoTitle = "";
    
    // Method 1: Check JSON‑LD data for a music genre.
    const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
    ldJsonScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        const videos = Array.isArray(data) ? data : [data];
        videos.forEach(videoData => {
          if (videoData["@type"] === "VideoObject" && videoData.genre) {
            if (videoData.genre.toLowerCase() === "music") {
              isMusic = true;
              videoTitle = videoData.name || "";
            }
          }
        });
      } catch (e) {
        console.error("Error parsing JSON‑LD:", e);
      }
    });
    
    // Method 2: If not detected by JSON‑LD, check for the Music header.
    if (!isMusic) {
      // Look for the header element indicating a music video.
      const headerElem = document.querySelector('yt-formatted-string#title.style-scope.ytd-rich-list-header-renderer');
      if (headerElem && headerElem.textContent.trim().toLowerCase() === "music") {
        isMusic = true;
        // Attempt to get the video title from the DOM.
        // Adjust the selector as needed for your YouTube layout.
        const titleElem = document.querySelector('h1.title, h1.ytd-video-primary-info-renderer');
        if (titleElem) {
          videoTitle = titleElem.textContent || "";
        }
      }
    }
    
    // If no music flag or no title was found, exit.
    if (!isMusic || !videoTitle) {
      console.log("Not a music video or no title found.");
      return null;
    }
    
    // Clean the video title by removing anything in parentheses.
    let cleanedTitle = videoTitle.replace(/\s*\([^)]*\)/g, "").trim();
    console.log("Music video detected, title:", cleanedTitle);
    
    // If there's no dash in the title, try to prepend the channel name.
    if (cleanedTitle.indexOf('-') === -1) {
      let channelName = "";
      const channelElem = document.querySelector('ytd-channel-name a');
      if (channelElem) {
        channelName = channelElem.textContent.trim();
      }
      if (channelName) {
        return channelName + " - " + cleanedTitle + " lyrics";
      } else {
        return cleanedTitle + " lyrics";
      }
    } else {
      return cleanedTitle + " lyrics";
    }
  }
  
  
  
  // Creates (or recreates) a draggable overlay at the top left that displays the given lyrics.
// Utility function to change the font size of the lyrics text by delta (in pixels)
function changeFontSize(delta) {
    const lyricsText = document.querySelector('#lyrics-container .lyrics-text');
    if (lyricsText) {
      // If no font size is explicitly set, get computed size (default to 16px if not available)
      let currentSize = parseFloat(window.getComputedStyle(lyricsText).fontSize) || 16;
      let newSize = currentSize + delta;
      lyricsText.style.fontSize = newSize + "px";
    }
  }
  
  // Creates (or recreates) a draggable overlay at the top left that displays the given lyrics.
  // The 'query' parameter is used to set the header text.
  function displayLyricsOverlay(lyrics, query) {
    // Remove any existing overlay.
    const existingOverlay = document.getElementById('lyrics-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Overlay container (non-interactive; the inner container will be interactive).
    const overlay = document.createElement('div');
    overlay.id = 'lyrics-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10000';
    
    // The actual lyrics container, fixed in the top-left.
    const container = document.createElement('div');
    container.id = 'lyrics-container';
    container.style.pointerEvents = 'auto';
    container.style.position = 'fixed';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.color = 'white';
    container.style.padding = '20px';
    container.style.borderRadius = '8px';
    container.style.maxWidth = '80%';
    container.style.maxHeight = '75%';  // 1.5× taller than before
    container.style.overflowY = 'auto';
    
    // Create the header container (used also as the drag handle).
// Create the header container (used as the drag handle) with two rows.
const header = document.createElement('div');
header.id = 'lyrics-header';
header.style.position = 'relative';
header.style.cursor = 'move';
header.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
header.style.padding = '5px';
header.style.borderBottom = '1px solid #fff';
header.style.display = 'flex';
header.style.flexDirection = 'column';
header.style.alignItems = 'start';

// First row: title only.
const headerTitle = document.createElement('div');
headerTitle.textContent = "Lyrics for: " + query;
headerTitle.style.width = '100%';
headerTitle.style.textAlign = 'center';
headerTitle.style.fontWeight = 'bold';

// Second row: button container.
const btnContainer = document.createElement('div');
btnContainer.style.display = 'flex';
btnContainer.style.justifyContent = 'start';
btnContainer.style.gap = '5px';
btnContainer.style.marginTop = '5px';

// Create the refresh button.
const refreshButton = document.createElement('button');
refreshButton.id = 'lyrics-refresh';
refreshButton.textContent = '⟳';
refreshButton.title = "Refresh lyrics";
refreshButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
refreshButton.style.color = 'white';
refreshButton.style.border = 'none';
refreshButton.style.borderRadius = '4px';
refreshButton.style.cursor = 'pointer';
refreshButton.style.width = '24px';
refreshButton.style.height = '24px';
refreshButton.addEventListener('click', function(e) {
  e.stopPropagation();
  updateLyrics();
});

// Create the increment font size button.
const incButton = document.createElement('button');
incButton.id = 'lyrics-font-inc';
incButton.textContent = 'A+';
incButton.title = "Increase font size";
incButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
incButton.style.color = 'white';
incButton.style.border = 'none';
incButton.style.borderRadius = '4px';
incButton.style.cursor = 'pointer';
incButton.style.width = '24px';
incButton.style.height = '24px';
incButton.addEventListener('click', function(e) {
  e.stopPropagation();
  changeFontSize(1);
});

// Create the decrement font size button.
const decButton = document.createElement('button');
decButton.id = 'lyrics-font-dec';
decButton.textContent = 'A–';
decButton.title = "Decrease font size";
decButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
decButton.style.color = 'white';
decButton.style.border = 'none';
decButton.style.borderRadius = '4px';
decButton.style.cursor = 'pointer';
decButton.style.width = '24px';
decButton.style.height = '24px';
decButton.addEventListener('click', function(e) {
  e.stopPropagation();
  changeFontSize(-1);
});

// Create the close button.
const closeButton = document.createElement('button');
closeButton.id = 'lyrics-close';
closeButton.textContent = 'X';
closeButton.title = "Close lyrics";
closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '50%';
closeButton.style.cursor = 'pointer';
closeButton.style.width = '24px';
closeButton.style.height = '24px';
closeButton.addEventListener('click', function (e) {
  e.stopPropagation();
  overlay.remove();
});

// Append the buttons to the button container.
btnContainer.appendChild(refreshButton);
btnContainer.appendChild(incButton);
btnContainer.appendChild(decButton);
btnContainer.appendChild(closeButton);

// Append title and buttons container to the header.
header.appendChild(headerTitle);
header.appendChild(btnContainer);

    
    // Lyrics text container – we add a class for easy updating.
    const lyricsText = document.createElement('div');
    lyricsText.className = 'lyrics-text';
    lyricsText.style.whiteSpace = 'pre-wrap';
    lyricsText.style.marginTop = '10px';
    lyricsText.textContent = lyrics;
    
    container.appendChild(header);
    container.appendChild(lyricsText);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Make the container draggable using the header.
    makeDraggable(container, header);
  }
  
  
  // Utility function to make an element draggable by a handle.
  function makeDraggable(element, handle) {
    let offsetX = 0;
    let offsetY = 0;
    handle.addEventListener('mousedown', function (e) {
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      e.preventDefault();
    });
    function mouseMoveHandler(e) {
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
    }
    function mouseUpHandler() {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    }
  }
  
  // Updates the lyrics overlay by showing "loading..." and then fetching new lyrics.
  function updateLyrics() {
    const searchQuery = checkForMusic();
    if (!searchQuery) {
      // If not a music video, remove any existing overlay.
      const overlay = document.getElementById('lyrics-overlay');
      if (overlay) overlay.remove();
      return;
    }
    // Show overlay with a "loading..." message.
    displayLyricsOverlay("loading...", searchQuery);
  console.log("Searching for lyrics using query:", searchQuery);
  chrome.runtime.sendMessage({ action: "searchLyrics", query: searchQuery }, function (response) {
    if (response && response.lyrics) {
      // Update the lyrics in the existing overlay.
      const container = document.getElementById('lyrics-container');
      if (container) {
        const lyricsText = container.querySelector('.lyrics-text');
        if (lyricsText) {
          lyricsText.textContent = response.lyrics;
        }
      } else {
        // If the overlay was removed, recreate it.
        displayLyricsOverlay(response.lyrics, searchQuery);
      }
    } else {
      // No lyrics found; update overlay with a message.
      displayLyricsOverlay("Lyrics not found.", searchQuery);
    }
  });
}
  
  
  // Listen for messages from the popup to trigger an update.
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "displayLyrics") {
      updateLyrics();
      sendResponse({ success: true });
      return true;
    }
  });
  
  // Detect URL changes (YouTube is a SPA) and update lyrics when a new video loads.
  let lastSearchQuery = null;
  let urlChanged = false;
  let lastUrl = window.location.href;
  setInterval(() => {
    // Detect URL change (since YouTube is a SPA)
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      urlChanged = true;
      console.log("URL change detected; waiting for new title to load...");
    }
    // If a URL change was detected, poll for a new search query.
    if (urlChanged) {
      const newQuery = checkForMusic();
      // If newQuery is non-null and different than our last stored query,
      // it means the new video’s metadata is loaded.
      if (newQuery && newQuery !== lastSearchQuery) {
        lastSearchQuery = newQuery;
        urlChanged = false;
        console.log("New video title loaded. Updating lyrics using query:", newQuery);
        updateLyrics();
      }
    }
  }, 1000);
  // On page load, check auto display setting and update lyrics if enabled.
chrome.storage.local.get(['autoDisplay'], function(result) {
    if (result.autoDisplay === true) {
      console.log("Auto display is enabled. Updating lyrics on page load.");
      updateLyrics();
    }
  });
  function attachTimeUpdateListener() {
    const videoElem = document.querySelector("video");
    if (!videoElem) {
      console.log("Video element not found, trying again in 1 second.");
      setTimeout(attachTimeUpdateListener, 1000);
      return;
    }
    console.log("Video element found, attaching timeupdate listener.");
    let rechecked = false;
    videoElem.addEventListener("timeupdate", function() {
      if (!rechecked && videoElem.currentTime >= 2) {
        rechecked = true;
        console.log("Video reached 2 seconds, updating lyrics.");
        updateLyrics();
      }
    });
    // Reset rechecked if the video ends.
    videoElem.addEventListener("ended", function() {
      rechecked = false;
    });
  }
  attachTimeUpdateListener();
  
  