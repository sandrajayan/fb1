window.onload = function() {

    var id = "https://rightnow.herokuapp.com/";
    var socket = io();
    var messages = [];
    var socket = io.connect(id);
    //console.log(id);
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    //var name = document.getElementById("name");



    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function() {
        var text = field.value;
        socket.emit('send', { message: text});

    };

}
$(document).ready(function() {
	$("#field").keyup(function(e) {
		if(e.keyCode == 13) {
			sendMessage();
		}
	});
});
