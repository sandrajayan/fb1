module.exports = function( app, io, msg){

	app.get('/', function(req, res){

		// Render views/home.html
		res.render('page');
	});
  var data=msg;
  //var msg="hi";
  var chat = io.on('connection', function (socket) {
    socket.emit('message', { message: data });
    //socket.emit('message', msg);
    //socket.on('send', function (data) {
    //    socket.emit('message', data);
    //});
  });
}
