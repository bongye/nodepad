exports.helpers = {
	appName: 'Nodepad',
	version: '0.1',

	nameAndVersion: function(name, version){
		return name + ' v' + version;
	}
};

function FlashMessage(type, messages){
	this.type = type;
	this.messages = typeof messages === 'string' ? [messages] : messages;
}

FlashMessage.prototype = {
	toHTML: function(){
		return "<div class='flash modal hide fade'>" +
		"<div class='modal-header'>" +
		"<h3 class='alert-heading'>Error!</h3>" +
		"</div>" +
		"<div class='modal-body'>" +
		"<p>" + this.messages.join(',') + "</p>" +
		"</div>" +
		"<div class='modal-footer'>" +
		"<a href='#' class='btn' data-dismiss='modal'>Close</a>" +
		"</div>" +
		"</div>";
	}
};

exports.dynamicHelpers = {
	flashMessages: function(req, res){
		var html = '';
		['error', 'info'].forEach(function(type){
			var messages = req.flash(type);
			if(messages.length > 0) {
				html += new FlashMessage(type, messages).toHTML();
			}
		});
		return html;
	}
};
