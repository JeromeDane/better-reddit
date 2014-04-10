chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	switch(request.name) {
		case 'getsource':
			var url = chrome.extension.getURL('redditplus.userscript.js');
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status==200) {
					sendResponse(xmlhttp.responseText);
				}
			};
			xmlhttp.open("GET",url,true);
			xmlhttp.send();
			break;
	}
});

