(function($){
	function resize() {
		var height = $(window).height() - $('#header').height() - 1;
		    width = $('.content').width();
				ov = $('.outline-view'),
				ed = $('#editor'),
				toolbar = $('.toolbar'),
				divider = $('.content-divider'),
				content = $('.content'),
				controls = $('#controls');
				edc = $('#editor-container');
		
		$('#DocumentTitles').css({
			height: height - toolbar.height() - 1 + 'px'
		});

		ov.css({
			height: height + 'px'
		});

		toolbar.css({
			width: ov.width() + 'px'
		});

		content.css({
			height: height + 'px',
			width: $('body').width() - ov.width() - divider.width() - 1 + 'px'
		});

		divider.css({
			height: height + 'px'
		});

		edc.css({
			height: height - controls.outerHeight() + 'px'
		});

		ed.css({
			width: content.width() + 'px',
			height: edc.height() - controls.outerHeight() - 6 + 'px'
		}).focus();


		$('#controls').css({
			width: content.width() + 'px'
		});
	}

	$(window).resize(resize);
	$(window).focus(resize);
	resize();
})(jQuery);
