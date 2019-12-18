// content.js
var nuOfTimesScrollReachedAtEnd = 0;
var instanceOfCounter = null;
var response = [];
var intervalForAutoScroll = 5000;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {    
    	var instagramImages = saveInstagramData();
    	console.log(instagramImages, "instagramImages")
    	if(instagramImages.length > 0) {
    		var param = {collection : instagramImages};
  			chrome.runtime.sendMessage(param);
    	}
    } else {
    	alert("This extenstion is only for instagram")
    }
  }
);


var startScrolling = () => {
	// Running the code every second	
	var sbHeight = window.innerHeight * (window.innerHeight / document.body.offsetHeight);
	var scrollPos = (document.body.scrollHeight - window.scrollY) - sbHeight
	window.scrollTo(0, document.body.scrollHeight)
	if(scrollPos === 0) {
		saveInstagramData()
		nuOfTimesScrollReachedAtEnd++;		
		// console.log("Scroll reached now push the content inside our middleware")
		if(nuOfTimesScrollReachedAtEnd > 50) {
			clearInterval(instanceOfCounter);
		}
	}
}

// // Using localstorage for storing data
// function saveInstagramDataInLocalStorage() {
// 	if (typeof(Storage) !== "undefined") {
//     	let array = document.querySelectorAll("article div.Nnq7C div.v1Nh3")
// 		let response = []
// 		for (var i = 0; i < array.length; i++) {
// 			let node = array[i]
// 			if(!node.classList.contains("extracted")) {
// 				let image = node.getElementsByTagName("img")[0].src;
// 				let link = node.getElementsByTagName("a")[0].href;
// 				let obj = {image, link}
// 				response.push(obj)
// 				node.classList.add("extracted")
// 			    if(i == array.length -1) {
// 			      // return response
// 			      console.log(response, "Items stored in localStorage")
// 			      window.localStorage.setItem('intagramExtractedContent', JSON.stringify(response));
// 			    }
// 			}
// 		}
// 	} else {
// 	    // No web storage Support.
// 	    alert("No web storage Support")
// 	}		
// }

// Not Using localstorage for storing data
const saveInstagramData = () => {	
	let array = document.querySelectorAll("article div.Nnq7C div.v1Nh3")	
	for (var i = 0; i < array.length; i++) {
		let node = array[i]
		if(!node.classList.contains("extracted")) {
			let image = node.getElementsByTagName("img")[0].src;
			let link = node.getElementsByTagName("a")[0].href;
			let obj = {image, link}
			// downloadResource(image)
			response.push(obj)
			node.classList.add("extracted")
		    if(i == array.length -1) {
		      return response
		      console.log(response, "Extracted Items")
		    }
		}
	}
}

const getInstagramUserName = () => {
	let url = window.location.href;
	let array = url.split("/")
	if(array[3]) {
		return array[3]
	} else {
		return "InstagramImageScrapper"
	}
	// console.log(window.location.href)
}

// A generic onclick callback function.
const downloadResource = (url, tab) => {
	let folderName = getInstagramUserName()
	var filename = url.substring(url.lastIndexOf('/')+1);
	console.log(chrome.downloads, url, filename, "downloaddddd")
	if (chrome.downloads) {
		chrome.downloads.download({ url: url, filename: filename, saveAs: false });
	} 
	else {
		var a = document.createElement('a');
		a.href = url;
		a.download = filename;
		chrome.tabs.create( { 'url' : _anchorDownloader( url, filename ), 'active' : false  } );
	}
}

function _anchorDownloader(url, filename) {
	var timeout = 500;
	return 'javascript:\'<!doctype html><html>'+
		'<head></head>' +
		'<script>' +
			'function initDownload() {'+
				'var el = document.getElementById("anchor");'+
				'el.click();' +
				'setTimeout(function() { window.close(); }, ' + timeout + ');' +
			'}'+
		'</script>' +
		'<body onload="initDownload()">' +
			'<a id="anchor" href="' + url + '" download="'+ filename + '"></a>'+
		'</body>' +
	'</html>\'';
};
