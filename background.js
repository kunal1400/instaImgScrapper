// background.js

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  console.log(tab, "tab")
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

chrome.runtime.onMessage.addListener(
	function(arg, sender, sendResponse) {

		// If collection is present then store image
		if(arg.collection) {
			var args = arg.collection;
			for (i in args) {
				var img_url = args[i].image;
				try{
					saveas = img_url.replace(/[^a-zA-Z0-9]/g,'-');
				}
				catch (problem){
				}
				// For more details please refer: https://developer.chrome.com/extensions/downloads#method-download
				chrome.downloads.download({
					url: img_url				
				});
			}
		}

		// If videos is present then store image
		if(arg.collection) {

		}
});

function sendResponse(){
}

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
// 	if (tabId && changeInfo && tab && tab.url) {
// 		const u = new URL(tab.url)
// 		// const tag = u.searchParams.get('tag')
// 		const domain = tab.url.split('/')[2]
// 		if(domain === "www.instagram.com") {
// 			chrome.browserAction.setIcon({path: 'images/icon1.png'});
// 		} else {
// 			chrome.browserAction.setIcon({path: 'images/icon.png'});
// 		}
// 	}
// })

// chrome.tabs.onActivated.addListener((tabId, changeInfo, tab) => {
// 	if (tabId && changeInfo && tab && tab.url) {
// 		const u = new URL(tab.url)
// 		// const tag = u.searchParams.get('tag')
// 		const domain = tab.url.split('/')[2]
// 		if(domain === "www.instagram.com") {
// 			chrome.browserAction.setIcon({path: 'images/icon1.png'});
// 		} else {
// 			chrome.browserAction.setIcon({path: 'images/icon.png'});			
// 		}
// 	}
// })

