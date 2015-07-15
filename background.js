function getScript(path, callback) {
	var url = chrome.extension.getURL(path);
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status==200) {
			console.log('loaded ' + path);
			callback(xmlhttp.responseText);
		}
	};
	xmlhttp.open("GET",url,false);
	xmlhttp.send();
}

function getScripts(scripts, callback) {
	var numLoaded = 0;
	var source = "";
	for(var i = 0; i < scripts.length; i++) {
		getScript(scripts[i], function(code) {
			source += code;
			numLoaded++;
			if(numLoaded == scripts.length)
				callback(source);
		});
	}
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
	switch(request.name) {
		case 'getsource':
			var scripts = [
				'jquery.js',
				'jqueryui.js',
				'masonry.js',
				'redditplus.userscript.js'
			];
			getScripts(scripts, function(source) {
				sendResponse('(function() { ' + source + '})()');
			});
			break;
	}
});

