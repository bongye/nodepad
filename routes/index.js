
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.documents = require('./documents.js');
exports.sessions = require('./sessions.js');
exports.users = require('./users.js');
