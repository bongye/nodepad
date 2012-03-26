(function($){
	$.fn.itemID = function(){
		try {
			var items = $(this).attr('id').split('-');
			return items[items.length - 1];
		} catch (exception) {
			return null;
		}
	};

	$.fn.itemTitle = function(){
		try {
			var title = $(this).text();
			return title;
		} catch (exception) {
			return null;
		}
	};

	$.put = function(url, data, success){
		data._method = 'PUT';
		$.post(url, data, success, 'json');
	};

	$('#delete-document').on('click', function(e){
		e.preventDefault();
		if(confirm('Are you sure you want to delete that document?')){
			var element = $(this),
					form = $('<form></form>');

			form
			.attr({
				method: 'POST',
				action: '/documents/' + $('#document-list .selected').itemID()
			})
			.hide()
			.append('<input type="hidden" />')
			.find('input')
			.attr({
				'name': '_method',
				'value': 'delete'
			})
			.end()
			.submit();
		}
	});

	$('#logout').on('click', function(e){
		e.preventDefault();
		if(confirm('Really wanna logout?')){
			var element = $(this);
			var form = $('<form></form>');

			form
			.attr({
				method:'POST',
				action: element.attr('href')
			})
			.hide()
			.append('<input type="hidden" />')
			.find('input')
			.attr({
				name: '_method',
				value: 'delete'
			})
			.end()
			.submit();
		}
	});

	function resize() {
		var height = $(window).height() - $('#header').height() - 1;
		    width = $('.content').width();
				ov = $('.outline-view'),
				ed = $('#editor'),
				toolbar = $('.toolbar'),
				divider = $('.content-divider'),
				content = $('.content'),
				controls = $('#controls');
		
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

		ed.css({
			width: content.width() - 4 + 'px',
			height: height - controls.height() - 5 + 'px'
		}).focus();

		$('#controls').css({
			width: content.width() + 'px'
		});
	}

	$('#document-list li a').on('click', function(e){
		var li = $(this);

		$.get(this.href + '.json', function(data){
			$('#document-list .selected').removeClass('selected');
			li.addClass('selected');
			$('#editor').val(data.data);
			$('#editor').focus();
		});

		e.preventDefault();
	});

	if($('#document-list .selected').length == 0){
		$('#document-list li a').first().trigger('click');
	}

	$('#save-button').click(function(){
		var id = $('#document-list .selected').itemID();
		var title = $('#document-list .selected').itemTitle();
		var params = {
					d: {
						data: $('#editor').val(),
						id: id,
						title: title
					}
				};
		$.put('/documents/' + id + '.json', params, function(data){
		});
	});

	$('#html-button').click(function(){
		var container = $('#html-container');
		if(container.is(':visible')){
			container.html('').hide();
			$('#html-button').removeClass('active');
		} else {
			$('#save-button').trigger('click');
			$('#html-button').addClass('active');
			var id = $('#document-list .selected').itemID();
			$.get('/documents/' + id + '.html', function(data){
				container.html(data).show();
			});
		}
	});

	$(window).resize(resize);
	$(window).focus(resize);
	resize();

	function hideFlashMessages(){
		$(this).fadeOut();
	}

	setTimeout(function(){
		$('.flash').each(hideFlashMessages);
	}, 5000);
	$('.flash').click(hideFlashMessages);
})(jQuery);
