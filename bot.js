// APIs & Packages
var login = require("facebook-chat-api");
require('./static.js')();
require('./commands.js')();


// Change this later to be a list of references to 
// function objects. Override toString() to
// represent command title, not source code. 
// Parse command list that way.

// Message spaceout function
// Used to enforce order
function spaceout(api, messages, delay) {
	for(i = 0; i < messages.length; i++){
		(function(message) {
			setTimeout((function() {
				api.sendMessage(message, THREAD_ID);
			}), delay*i);
		}(messages[i]))
	}
};

// Login and listen
login({email: EMAIL, password: PASSWORD}, function callback(err, api) {
	// Error handling
    if(err) return console.error(err);

    intro = [BOTNAME + ", at your service.", "To turn me on, type '" + PREFIX + " on'", "For help, type '" + PREFIX + " help.'"]

    spaceout(api, intro, 500);

    // Basic message responder
    var stopListening = api.listen(function(error, message) {

    	// Message received from host group chat
    	if(message['threadID'] === THREAD_ID) {
    		console.log(message);


    		// Detect & parse commands
    		var params;

    		// Bot called by PREFIX, command issued
    		if(message.body.startsWith(PREFIX)) {
    			params = message.body.split(" ").slice(1); // split by spaces, ignore PREFIX
    		} else {
    			params = null;
    		}

    		// If no command issued, params = null

    		// If command issued, try to execute it
    		if(params) {
    			var command = params[0];
    			if(COMMANDS[command]) {
    				var commandObj = COMMANDS[command];
    				console.log(message);
    				commandObj.run(api, params, message);
    			} else {
    				api.sendMessage('Command "' + command + '" not recognized. ', message.threadID);
    				api.sendMessage("For help and a list of commands, type '" + PREFIX + " help'.", message.threadID);
    			}
    		} 

    		// If no command issued, perform:
    		// Persistence checks & activity
			else {

				// Persistence by message (implement time later)
	    		for (num in PERSISTENCE) {
	    			enabled = PERSISTENCE[num];
	    			COMMANDS[enabled].run(api, params, message);
	    			console.log("CHECKED");
	    		}
			}
    }});
});