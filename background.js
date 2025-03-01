//background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "searchLyrics") {
      const query = request.query; // e.g. "bbno$ - it boy lyrics"
      const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
  
      fetch(url)
        .then(response => response.text())
        .then(html => {
          let lyrics = "";
  
          // Pattern 1: Look for div with jsname="U8S5sf" and class containing "ujudUb"
          const regex1 = /<div\s+jsname="U8S5sf"\s+class="[^"]*\bujudUb\b[^"]*">([\s\S]*?)<\/div>/g;
          let matches = [];
          let match;
          while ((match = regex1.exec(html)) !== null) {
            matches.push(match[1]);
          }
          if (matches.length > 0) {
            lyrics = matches.map(segment => {
              let text = segment.replace(/<br[^>]*>/g, "\n");
              text = text.replace(/<[^>]*>/g, '').trim();
              return text;
            }).join("\n\n");
          } else {
            // Pattern 2: Look for a div with data-attrid="kc:/music/recording_cluster:lyrics"
            const regex2 = /<div[^>]+data-attrid="kc:\/music\/recording_cluster:lyrics"[^>]*>([\s\S]*?)<\/div>/g;
            matches = [];
            while ((match = regex2.exec(html)) !== null) {
              matches.push(match[1]);
            }
            if (matches.length > 0) {
              lyrics = matches.map(segment => {
                let text = segment.replace(/<br[^>]*>/g, "\n");
                text = text.replace(/<[^>]*>/g, '').trim();
                return text;
              }).join("\n\n");
            }
          }
  
          if (!lyrics) {
            lyrics = "Lyrics not found.";
          }
          sendResponse({ lyrics });
        })
        .catch(error => {
          sendResponse({ lyrics: "Error fetching lyrics: " + error });
        });
      return true;
    }
  });
  