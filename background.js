// localStorage.clear(); // for debugging

// instantiate default settings
var settings = new Store("settings", {
  "strip_elements": "div, span, small, aside, section, article, header, time, address",
  "delete_elements": "script, noscript, canvas, embed, object, param, svg, source, form, nav, iframe, footer, hgroup",
  "enable_readability": true,
  "readability_api_key": ""
});

// create easy vars to use in the magic below
var stripped_elements = settings.get("strip_elements").split(', ');
var deleted_elements = settings.get("delete_elements").split(', ');

function callTab(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
}
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  callTab();
});

// check the message from content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "result_exists") {
      // parse incoming html for markdown
      // request.content
      var markdown = toMarkdown(request.content, {
        // filter out stuff
        converters: [{
          // grab the settings
          filter: stripped_elements,
          replacement: function (innerHTML) { return innerHTML }
        }, {
          // don't include these in the final markdown
          filter: deleted_elements,
          replacement: function () { return '' }
        }]
      });
      // create a ghost input to hold the fresh markdown
      const textarea = document.createElement('textarea');
      textarea.style.position = 'fixed';
      textarea.style.opacity = 0;
      // put da markdown in da box
      textarea.value = markdown;
      // put da box on the page
      document.body.appendChild(textarea);
      // select the newly appended text
      textarea.select();
      // copy it
      document.execCommand('Copy');
      // cover the tracks
      document.body.removeChild(textarea);
    } else {
      alert("Oops! No content received.");
    }
  }
);