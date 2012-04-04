(function($){
	var Document, Documents, DocumentRow, DocumentList, DocumentControls, ListToolBar, AppView, SearchView;

	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	Document = Backbone.Model.extend({
		Collection: Documents,
		url: function(){
			return this.urlWithFormat('json');
		},
		urlWithFormat: function(format){
			return this.get('id') ? '/documents/' + this.get('id') + '.' + format : '/documents.json';
		},
		display: function(){
			this.fetch({
				success: function(model, response){
					$('#editor-container input.title').val(model.get('title'));
					$('#editor').val(model.get('data'));
				}
			});
		}
	});
	
	Documents = new Backbone.Collection();
	Documents.url = '/documents/titles.json';
	Documents.model = Document;
	Documents.comparator = function(d){
		return d.get('title') && d.get('title').toLowerCase();
	};

	DocumentRow = Backbone.View.extend({
		tagName: 'li',
		events: {
			'click a': 'open'
		},
		template: _.template($('#document-row-template').html()),
		initialize: function(){
			_.bindAll(this, 'render');
		},
		open: function(){
			$('#document-list .selected').removeClass('selected');
			this.$el.addClass('selected');
			this.model.display();
			appView.documentList.selectedDocument = this.model;
		},
		render: function(){
			this.$el.html(this.template({
				id: this.model.id,
				title: this.model.get('title')
			}));
			return this;
		}
	});

	DocumentList = Backbone.View.extend({
		el: $('#document-list'),
		Collection: Documents,
		initialize: function(){
			_.bindAll(this, 'render', 'addDocument', 'showAll', 'create');
			this.Collection.on('reset', this.render);
		},
		addDocument: function(d){
			var index = Documents.indexOf(d) + 1;
			d.rowView = new DocumentRow({model: d});
			var el = this.$el.find('li:nth-child(' + index + ')');
			if(el.length){
				el.after(d.rowView.render().el);
			} else {
				this.$el.append(d.rowView.render().el);
			}
		},
		resort: function(){
			Documents.sort({
				silent: true
			});
		},
		create: function(title, data){
			this.selectedDocument.set({
				title: title,
				data: data
			});
			this.selectedDocument.save();
			this.selectedDocument.rowView.render();
			this.resort();
		},
		render: function(documents){
			var documentList = this;
			documents.each(function(d){
				documentList.addDocument(d);
			});

			if(!this.selectedDocument){
				this.openFirst();
			}
		},
		openFirst: function(){
			if(Documents.length){
				Documents.first().rowView.open();
			}
		},
		showAll: function(e){
			e.preventDefault();
			this.$el.html('');
			Documents.fetch({
				success: this.openFirst
			});
			appView.searcView.reset();
		}
	});

	DocumentControls = Backbone.View.extend({
		el: $('#controls'),
		events: {
			'click #save-button': 'save',
			'click #html-button': 'showHTML'
		},
		initialize: function(model){
			_.bindAll(this, 'save', 'showHTML');
		},
		save: function(e){
			e.preventDefault();

			var title = $('input.title').val();
			var data = $('#editor').val();

			if(!appView.documentList.selectedDocument){
				Documents.create({
					title: title,
					data: data
				}, {
					success: function(model){
						Documents.fetch();
					}
				});
			} else {
				appView.documentList.create(title, data);
			}
		},
		showHTML: function(e){
			e.preventDefault();

			var model = appView.documentList.selectedDocument;
			if(!model) return;

			var html = model.urlWithFormat('html');
			$.get(html, function(data){
				$('#html-container').html(data);
				$('#html-container').dialog({
					title: model.get('title'),
					autoOpen: true,
					modal: true,
					width: $(window).width() * 0.95,
					height: $(window).height() * 0.90
				});
			});
		}
	});

	ListToolBar = Backbone.View.extend({
		el: $('#left .toolbar'),
		events: {
			'click #create-document': 'add',
			'click #delete-document': 'remove'
		},
		initialize: function(model){
			_.bindAll(this, 'add', 'remove');
		},
		add: function(e){
			e.preventDefault();
			var d = new Document({
				title: 'Untitled Document',
				data: ''
			});
			d.save({}, {
				success: function(){
					Documents.add(d);
					appView.documentList.addDocument(d);
					d.rowView.open();
					$('#editor-container input.title').focus();
				}
			});
		},
		remove: function(e){
			e.preventDefault();
			var model = appView.documentList.selectedDocument;
			if(!model) return;
			if(confirm('Are you sure you want to delete that document?')){
				model.rowView.remove();
				model.destroy();
				Documents.remove(model);
				appView.documentList.selectedDocument = null;
				$('#editor-container input.title').val('');
				$('#editor').val('');
				$('#document-list li:visible:first a').trigger('click');
			}
		}
	});

	SearchView = Backbone.View.extend({
		el: $('#header .search'),
		events: {
			'submit': 'submit'
		},
		initialize: function(){
			_.bindAll(this, 'search', 'reset');
		},
		submit: function(e){
			e.preventDefault();
			this.search($('input[name="s"]').val());
		},
		reset: function(){
			this.$el.find("input[name='s']").val('Search');
		},
		search: function(value){
			$.post('/search.json', {
				s: value
			}, function(result){
				appView.documentList.el.html("<li><a id='show-all' href='#'>Show all</a></li>");
				if(results.length === 0){
					alert('No results found');
				} else {
					for (var i=0; i<results.length; i++){
						var d = new Document(results[i]);
						appView.documentList.addDocument(d);
					}
				}
			}, 'json');
		}
	});

	AppView = Backbone.View.extend({
		initialize: function(){
			this.documentList = new DocumentList();
			this.searchView = new SearchView();
			this.toolbar = new ListToolBar();
			this.documentControls = new DocumentControls();
		}
	});

	var appView = new AppView();
	window.Documents = Documents;
	window.appView = appView;

	$('#logout').click(function(e){
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
})(jQuery);
