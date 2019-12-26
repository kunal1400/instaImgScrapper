// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

chrome.runtime.onMessage.addListener(
	function(arg, sender, sendResponse) {
		
		console.log(arg, "this are arg")

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
		if(arg.videos) {
			var args = arg.videos;
			for (i in args) {				
				chrome.downloads.download({
					url: args[i]				
				});
			}
		}
});