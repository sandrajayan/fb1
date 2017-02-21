// This file handles the configuration of the app.
// It is required by app.js

var express = require('express');

module.exports = function(app, io){

	// Set .html as the default template extension
	//app.set('view engine', 'html');
  app.set('views', __dirname + '/tpl');
  app.set('view engine', "pug");
	// Initialize the ejs template engine
	//app.engine('html', require('ejs').renderFile);
  app.engine('pug', require('pug').__express);

	// Tell express where it can find the templates
	//app.set('views', __dirname + '/views');

	// Make the files in the public folder available to the world
	app.use(express.static(__dirname + '/public'));


  //app.set('view engine', "pug");
  //app.engine('pug', require('pug').__express);


};
