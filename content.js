// content.js
var nuOfTimesScrollReachedAtEnd = 0;
var instanceOfCounter = null;
var response = [];
var intervalForAutoScroll = 5000;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
    	let url = window.location.href;

    	// If channel is not present in url then save images
    	if(url.indexOf("channel") === -1) {
    		var instagramImages = saveInstagramData("article div.Nnq7C div.v1Nh3");
    		if(instagramImages.length > 0) {
	    		var param = {collection : instagramImages};
	  			chrome.runtime.sendMessage(param);
	    	}
    	}
    	else {
    		var instagramVideos = saveInstagramVideo("div.Nnq7C a._bz0w");
    		console.log(instagramVideos, "instagramVideos")
    		
    		// if(instagramVideos.length > 0) {	    		
	  			// chrome.runtime.sendMessage({
	  			// 	videos : instagramVideos
	  			// });
	    	// }

    		if(instagramVideos) {
    			var index = 0;
    			var fetchNext = function() {
    				if(index < instagramVideos.length) {
    					let data = instagramVideos[index];
    					console.log(data, index)
    					// window.open(url.link, '_blank');
    					index++;
    					GetInstagramVideo(data.link)
    					fetchNext();
    				}
    				else {
    					console.log("loop ended")
    				}
    			}
    			fetchNext();
    		}

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
		saveInstagramData("article div.Nnq7C div.v1Nh3")
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

// Not Using localstorage for storing data i.e "article div.Nnq7C div.v1Nh3"
const saveInstagramData = (selector) => {	
	let array = document.querySelectorAll(selector)	
	for (var i = 0; i < array.length; i++) {
		let node = array[i]
		if(!node.classList.contains("extracted")) {
			let image = node.getElementsByTagName("img");
			let link = node.getElementsByTagName("a");
			
			// If image src is present
			if(image) {
				image = node.getElementsByTagName("img")[0].src;
			}

			// If anchor link is present
			if(link) {
				link = node.getElementsByTagName("a")[0].href;
			}

			// storing image in link in object
			let obj = {image, link}

			// downloadResource(image)
			response.push(obj)
			node.classList.add("extracted")
		    if(i == array.length -1) {
		      return response
		    }
		}
	}
}

// Not Using localstorage for storing data i.e "article div.Nnq7C div.v1Nh3"
const saveInstagramVideo = (selector) => {	
	let array = document.querySelectorAll(selector)	
	for (var i = 0; i < array.length; i++) {
		let node = array[i]
		if(!node.classList.contains("extracted")) {			
			// If image src is present
			if(node) {
				link = node.href;
			}

			// storing image in link in object
			let obj = {link}
			
			response.push(obj)
			node.classList.add("extracted")
		    if(i == array.length -1) {
		      return response
		    }
		}
	}
}

const splitUrl = () => {
	let url = window.location.href;
	return url.split("/")
	if(array[3]) {
		return array[3]
	} else {
		return;
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


const GetInstagramVideo = (url) => {
	fetch(url, {
		mode: 'no-cors',
		method: 'get'
	})	
	.then(response => {
		console.log(response, response.type, "data after ajax")
	})
	.catch(function(err) {
		console.log(err) // this won't trigger because there is no actual error
	});
	// var data = null;

	// var xhr = new XMLHttpRequest();
	// xhr.withCredentials = true;

	// xhr.addEventListener("readystatechange", function () {
	// 	if (this.readyState === 4) {
	// 		console.log(this.responseText);
	// 	}
	// });

	// xhr.open("GET", url);
	// xhr.setRequestHeader("cache-control", "no-cache");
	// xhr.setRequestHeader("Postman-Token", "91288084-8bab-459f-9a28-56ef74fd8005");

	// xhr.send(data);
	

	  // var video_dom = document.querySelector("meta[property='og:video:secure_url']");
	  // var video_url = "";
	  // if (video_dom) {
	  //     video_url = video_dom.getAttribute("content");
	  // }  
	  // if (!ValidURL(video_url)) {
	  //     video_dom = document.querySelector("meta[property='og:video']");
	  //     if (video_dom) {
	  //         video_url = video_dom.getAttribute("content");
	  //     }
	  // }
	  // return video_url;
}
