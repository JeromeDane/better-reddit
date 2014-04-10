/**
 * The purpose of this file is to load and inject the actual user script for Reddit+.
 * It is done this way both to isolate the userscript code from the extension, and to
 * make development easier by making it so that I don't have to reload the extension
 * entirely every time I make a change.
 */
chrome.extension.sendRequest({name: 'getsource', location:document.location.toString()}, function(source) {
	(function() {
		eval(source);
	})();
});