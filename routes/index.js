var fs = require('fs');

module.exports = function(app){
	fs.readdirSync(__dirname).forEach(function(file){
		if (file.indexOf('.swp') > 0) return;
		if (file == 'index.js') return;
		var name = file.substr(0, file.indexOf('.'));
		require('./' + name)(app);
	});
};
