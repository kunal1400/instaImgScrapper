// content.js
var nuOfTimesScrollReachedAtEnd = 0;
var instanceOfCounter = null;
var response = [];
var intervalForAutoScroll = 5000;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
    	let url = window.location.href;

    	// If channel is not present in url then we are assuming that user is on posts page and saving images
    	if(url.indexOf("channel") === -1) {
    		var instagramImages = saveInstagramData("article div.Nnq7C div.v1Nh3");
    		if(instagramImages && instagramImages.length > 0) {
	    		var param = {collection : instagramImages};
	  			chrome.runtime.sendMessage(param);
	    	}
    	}
    	else {
    		var instagramDomForVideos = saveInstagramVideo("div.Nnq7C a._bz0w");    		
    		if(instagramDomForVideos) {
    			var index = 0;
    			var videosArray = [];
    			var fetchNext = function() {
    				if(index < instagramDomForVideos.length) {
    					let data = instagramDomForVideos[index];
    					// window.open(url.link, '_blank');
    					index++;
    					GetInstagramVideo(data.link)
    					.then(function(url) {
    						videosArray.push(url)							
    						fetchNext();
    					})
    					.catch(function(error) {
    						console.log(error, "this is the error")
    					})
    				}
    				else {
						if(videosArray.length > 0) {
							chrome.runtime.sendMessage({
								videos : videosArray
							});
						}
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
	return fetch(url, {
		method: 'get'
	})	
	.then(response => {		
		return response.text()
	})
	.then(text => {
		var parser = new DOMParser();
		var doc = parser.parseFromString(text, 'text/html');
		return doc.head;
	})
	.then(head => {
		let instagramVideoUrl = getInstagramVideoUrl(head);
		return instagramVideoUrl;
	})
	.catch(function(err) {
		console.log(err)
		return err;
	});	
}

function getInstagramVideoUrl(node) {
  var video_url = "";
  var video_dom = node.querySelector("meta[property='og:video:secure_url']");
  if (video_dom) {
    	video_url = video_dom.getAttribute("content");
  }  
  if (!ValidURL(video_url)) {
    	video_dom = node.querySelector("meta[property='og:video']");
    	if (video_dom) {
        	video_url = video_dom.getAttribute("content");
    	}
  }
  return video_url;
}

function ValidURL(value){
    return /^(https?):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}
