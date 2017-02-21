//'use strict';
var express = require('express')
var bodyParser = require('body-parser')
//const config = require('config')
//const crypto = require('crypto')
var request = require('request')
var graph = require('fbgraph');
var app = express();
var sender_id='';

//app.use(bodyParser.json({ verify: verifyRequestSignature }))
app.use(bodyParser.json())
//test
/*app.get('/', function(req, res) {
    res.render("page");
})*/
// verify token
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'token_fb') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);

  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
})



//Sending a text message
function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAJa5MZBCPRYBAC5qCB5a0G82KwaelWbX8y0hpsg6wncs9IAyscMd49BgCfmm7oZAgHZCMKZAGFZBI7CnB1leAP8SLz4ULKxcxUy1huaavvnjPa3BTN9SmP8wtX06emjTCAeZBjFutdbskSrdxvjs8SbhUS6O1ujteD5ZBJrDCP4AZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

//recieve message
/*app.post('/webhook/', function(req,res){
  messaging_events=req.body.entry[0].messaging;
  for(i=0;i<messaging_events.length;i++){
    event=req.body.entry[0].messaging[i];
    sender=event.sender.id;
    if(event.message && event.message.text){
      text=event.message.text;

      console.log(text);
    }
  }
  res.sendStatus(200);
});
*/

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          sender_id = event.sender.id;
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});


/*function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
}*/
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  //sender_id=senderID;
  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        //sendTextMessage(senderID, messageText);
        receivedMessageonSocket(senderID,messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
    //getuserdetails();
    //receivedMessageonSocket(senderID,messageText);
    //msg=messageText;
    //socket.emit('message', { message: msg });
}

/*function getuserdetails(){
  var msgdata = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  request({
    uri: 'https://graph.facebook.com/v2.6/senderID',
    qs: { access_token: 'EAAJa5MZBCPRYBAC5qCB5a0G82KwaelWbX8y0hpsg6wncs9IAyscMd49BgCfmm7oZAgHZCMKZAGFZBI7CnB1leAP8SLz4ULKxcxUy1huaavvnjPa3BTN9SmP8wtX06emjTCAeZBjFutdbskSrdxvjs8SbhUS6O1ujteD5ZBJrDCP4AZDZD' },

    method: 'GET',

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });

}*/

var io = require('socket.io').listen(app.listen(process.env.PORT || 8080));
//port listening
//app.listen(process.env.PORT || 8080)
//var io = require('socket.io').listen(app.listen(process.env.PORT || 8080));
//var io = require('socket.io').app.listen(process.env.PORT || 8080)
//require('./config')(app, io);
//require('./routes')(app, io, msg);
app.set('views', __dirname + '/tpl');
app.set('view engine', "pug");
app.engine('pug', require('pug').__express);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){

  // Render views/home.html
  res.render('page');
});

var chat = io.on('connection', function (socket) {
  socket.on('send', function (data) {
      //console.log(data['message']);
      //console.log(sender_id);
      //showMessage(msg);
      socket.emit('message', data);
      //senderID=1433744926688107;
      sendTextMessage(sender_id, data['message']);
  });

});

function receivedMessageonSocket(senderID,messageText){
  var username='';
  var params = { fields: "first_name,last_name",
    access_token: "EAAJa5MZBCPRYBAC5qCB5a0G82KwaelWbX8y0hpsg6wncs9IAyscMd49BgCfmm7oZAgHZCMKZAGFZBI7CnB1leAP8SLz4ULKxcxUy1huaavvnjPa3BTN9SmP8wtX06emjTCAeZBjFutdbskSrdxvjs8SbhUS6O1ujteD5ZBJrDCP4AZDZD"
  };
  graph.get("https://graph.facebook.com/v2.6/"+senderID+"", params, function(req, res) {

    username=res['first_name']+' '+res['last_name']; // { picture: 'http://profile.ak.fbcdn.net/'... }
  });
  var chat = io.on('connection', function (socket) {
    //console.log(sender_id);
    socket.emit('message', { message: messageText, username: username  });
    //socket.emit('message', msg);
  });
}
