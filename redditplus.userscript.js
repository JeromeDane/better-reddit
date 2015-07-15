// ==UserScript==
// @name           Better Reddit
// @description    Layout enhancements for Reddit using a card and content-first layout
// @author         Jerome Dane (http://jeromedane.com)
// @include        http://www.reddit.com/*
// @include        https://www.reddit.com/*
// @include        http://reddit.com/*
// @include        https://reddit.com/*
// @version        1.1.0
// ==/UserScript==

(function($) {

	var config = {
		gutter: 10,
		theme: 'dark'
	};
	
	var msnry = new Masonry(document.querySelector('#siteTable'), {
		itemSelector: '.thing',
		gutter: config.gutter
	});
	
	
	function s(text) {
		text = text || '';
		return $('.listing-page #siteTable ' + text + ', .search-page #siteTable ' + text);
	}
	
	function applyLayout() {
		// hide annoying domain link that's always ("self") or whatever
		//s('> .thing .title .domain').parent().hide();
		// hide clearleft divs to allow for inline block display  
		s('> .clearleft').remove();
		s('> .thing > .clearleft').remove();
		s('> .thing .expando').remove();
		
		s('> .thing').css({
			height: 'auto'
		});
		s('> .thing a.title').css({
			display: 'block',
			padding: '10px',
			'margin-right': '45px'
		});
		
		$('.redditplus-post-body').css({
			margin: '0 10px',
			color: '#aaa',
			'max-height': '500px',
			'overflow': 'auto'
		});
		
		$('.redditplus-post-image img').css({
			width: '100%'
		});
		$('.redditplus-post-image').css({
			'max-height': '400px',
			overflow: 'hidden'
		});
	}
	function applyTheme() {
		if(config.theme && config.theme != 'none') {
			$('head').append('<link rel="stylesheet" href="' + chrome.extension.getURL('themes') + '/' + config.theme + '.css?d=' + (new Date()).getTime() + '" type="text/css" />')
		}
		
		// fix sidebar margin
		$('#siteTable').css('margin-right', $('div.side').width() + 10);
	}
	
	function getColumnWidth() {
		var windowWidth = $(window).width() - $('div.side').width();
		console.log(s().width(), $('div.side').width(), windowWidth);
		var numColumns = 3;
		if(s().width() <= 1620)
			numColumns = 3;
		if(s().width() <= 1300)
			numColumns = 2;
	
		var finalWidth = (windowWidth - (numColumns * config.gutter) - 30 ) / numColumns;
		return finalWidth;
	}
	
	function getImageUrlFromItemResult(html, $item) {
	
		if(html) {
			// basic image
			var matches = html.match(/https?:\/\/.+?\.(png|jpg|gif)/);
			if(matches)
				return matches[0];
				
			// imgur gallery
			matches = html.match(/https?:\/\/(www.)?imgur.com\/(a|gallery)\//);
			if(matches)
				return false;
				
			// imgur
			matches = html.match(/https?:\/\/((www|i).)?imgur.com\/(\w+)\b/);
			if(matches) {
				return 'http://i.imgur.com/' + matches[3] + '.png';
				
			}
				
			// youtube
			matches = html.match(/https?:\/\/(www.)?youtube.com\/watch\?v=(\w+)\b/);
			if(matches)
				return 'http://img.youtube.com/vi/' + matches[2] + '/0.jpg';
				
				// https://www.youtube.com/watch?v=YH9rEjS2O0w&feature=youtu.be
			
		}
		
		return false;
		return 'http://i.imgur.com/CBWvvlj.png';
	}
	
	function getItemContents($item, callback) {
		var url = $('a.comments', $item).attr('href');
		$.get(url, function(result) {
			callback(result);
		});
	}
	
	function processItem($item, result) {
		var $result = $(result);
		
		$item.css({
			width: getColumnWidth() + 'px',
		/*
			margin: '0',
			'margin-bottom':config.gutter + 'px',
		*/
			position: 'absolute'
		});
		
		if(!result) return;
		
		// body
		var postBodyHtml = $result.find('.link .usertext-body').html();
		if(postBodyHtml) {
			$item.append('<div class="redditplus-post-body">' + postBodyHtml + '</div>');
		}
		
		// title
		$item.prepend($('a.title', $item));
		
		// hide button
		var hideButton = $('.state-button.hide-button', $item);
		var hideLink = $('a', hideButton);
		$item.prepend(hideButton);
		hideButton.css({
			position:'absolute',
			top:0,
			right: 0,
		});
		var defaultHideCss = {
			padding: '10px',
			background: '#000',
			border: '1px solid #aaa',
			display: 'block',
			color: '#fff'
		};
		hideLink.css(defaultHideCss);
		hideLink.mouseover(function() {
			hideLink.css({
				background: '#ccc',
				border: '1px solid #000',
				color: '#000'
			});
		});
		hideLink.mouseout(function() {
			hideLink.css(defaultHideCss);
		});
		hideLink.hide();
		$item.mouseover(function() {
			hideLink.show();
		});
		$item.mouseout(function() {
			hideLink.hide();
		});
		
		var href = $('a.title', $item).attr('href');
		
		// inject item image from post content
		var imageUrl = getImageUrlFromItemResult(postBodyHtml, $item);
		if(imageUrl) {
			$item.prepend('<div class="redditplus-post-image"><a href="' + href + '" target="_blank"><img src="' + imageUrl + '"/></a></div>');
		} else {
			// inject image from title
			imageUrl = getImageUrlFromItemResult(getImageUrlFromItemResult(href), $item);
			if(imageUrl) {
				$item.prepend('<div class="redditplus-post-image"><a href="' + href + '" target="_blank"><img src="' + imageUrl + '"/></a></div>');
			}
			
		}
		
		$('.hide-button', $item).click(function() {
			setTimeout(function() {
				msnry.layout();
			}, 500);
		});
		
		applyLayout();	
		
		resize();
		
	}
	
	function processItems() {
		s('> .thing').each(function() {
			var $item = $(this);
			if(!$item.attr('class').match(/redditplus/)) {
				$item.addClass('redditplus');
				getItemContents($item, function(result) {
					processItem($item, result);
				});
			} else {
				processItem($item);
			}
		});
		
	}
	
	function resize() {
		
		s('.nav-buttons').css({
			position:'absolute',
			top:(s('> .thing').last().position().top + s('> .thing').last().height() + 40) + 'px',
			right:0,
			'padding':'0 40px 40px 0',
			'text-align':'right'
		});
		
		processItems();
		
		msnry.layout();
		
	}

	function init() {
		applyTheme();
		resize();
		$(window).resize(resize);
	}
	
	init();
	
})(jQuery);

