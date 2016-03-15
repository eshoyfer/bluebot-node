// Commands

/*
COMMAND
--> Command (name)
--> Description
--> Help/Manual
--> Implementation
*/

require('./static.js')();
console.log(BOTNAME);
module.exports = function() {

	this.COMMANDS = {}; 
	this.PERSISTENCE = [];

	function Command(command, description, help, implementation) {
		this.command = command;
		this.description = description; 
		this.help = help;
		this.implementation = implementation;

		this.getCommand = function() {
			return this.command;
		}

		this.getDescription = function() {
			return this.description;
		}

		this.getHelp = function() {
			return this.help;
		}

		this.run = function(api, params, message) {
			if (ON || (this.command === "on") || (this.command === "off") || (this.command === "help") || (this.command === "status")) {
				return implementation(this, api, params, message);
			} else {
				api.sendMessage(BOTNAME + " is currently disabled.", message.threadID);
				api.sendMessage("To toggle, say '" + PREFIX + " [on/off]'.", message.threadID);
			}
			
		}

		// Override
		this.toString = function() {
			return this.command;
		}

		this.getSummary = function() {
			return "[" + this.command + "] "+ this.description; 
		}

		this.isPersistening = function() {
			return (PERSISTENCE.indexOf(this.command) >= 0);
		}

		this.persistToggle = function(api, toggle, message) {
			if (toggle === "on") {
				// Persistence turned on
				var alreadyOn = false;
				for(var i = 0; i < PERSISTENCE.length; i++) {
					if(PERSISTENCE[i] === this.command) {
						alreadyOn = true;
					}
				}

				if (!alreadyOn) {
					PERSISTENCE.push(this.command);
					api.sendMessage(this.command + " turned on.", message.threadID);
				} else {
					api.sendMessage(this.command + " already on.", message.threadID);
				}

			} else if (toggle === "off") {
				// Persistence turned off
				var alreadyOff = true;

				for(var i = 0; i < PERSISTENCE.length; i++) {
					if (PERSISTENCE[i] === this.command) {
						alreadyOff = false;
						PERSISTENCE.splice(i, 1);
						i--;
						api.sendMessage(this.command + " turned off.", message.threadID);
					}
				}

				if (alreadyOff) {
					api.sendMessage(this.command + " already off.", message.threadID);
				}
			} else {
				api.sendMessage("Command not recognized. " + this.help, message.threadID);
			}		
		}

		COMMANDS[command] = this;

	}

	this.on = new Command("on",
		"Turns the bot on",
		"No additional options available. See also: 'off'", 
		function(parent, api, params, message) {
			if (ON) {
				api.sendMessage(BOTNAME + " is already on.", message.threadID);
				return;
			}

			ON = true;

	    	api.sendMessage(BOTNAME + " ENABLED for " + message.threadName + " by " + message.senderName, message.threadID);
	    	api.sendMessage("For help and a list of commands, type '" + PREFIX + " help'.", message.threadID);
	    	api.sendMessage("To turn " + BOTNAME + " off, type '" + PREFIX + " off'.", message.threadID);
	});

	this.off = new Command("off",
		"Turns the bot off",
		"No additional options available. See also: 'on'",
		function(parent, api, params, message) {
			if (!ON) {
				api.sendMessage(BOTNAME + " is already off.", message.threadID);
				return;
			}

			ON = false;
			PERSISTENCE = []; // Wipes persistent commands

	    	api.sendMessage(BOTNAME + " DISABLED for " + message.threadName + " by " + message.senderName, message.threadID);
	    	api.sendMessage("For help and a list of commands, type '" + PREFIX + " help'.", message.threadID);
	    	api.sendMessage("To turn " + BOTNAME + " on, type '" + PREFIX + " on'.", message.threadID);	
		}
	);

	this.help = new Command("help",
		"Provides help & a list of available commands",
		"No additional options available.",
		function(parent, api, params, message) {
			if (params) {
				if (params.length > 1) {
					var requested = COMMANDS[params[1]];
					var response = requested.getCommand() + ": " + requested.getDescription() + "; " + requested.getHelp();
					api.sendMessage(response, message.threadID);
				} else {
					api.sendMessage("Current list of commands: " + Object.keys(COMMANDS), message.threadID);
					api.sendMessage("Type '" + PREFIX + " help [command]' for more detailed information.", message.threadID);
				}
			}
		}
	);

	this.roll = new Command("roll",
		"Rolls a random integer from 1 to 100 inclusive",
		"No additional options available.",
		function(parent, api, params, message) {
			var roll = (Math.floor(Math.random() * 100) + 1);
			api.sendMessage(message.senderName + " rolled " + roll, message.threadID);
			if (roll == 100) {
				api.sendMessage("H-H-HOLY SHIT!", message.threadID);		
			}
		}
	);

	this.echo = new Command("echo",
		"Parrots all chat messages until turned off",
		"Usage: echo [on/off]",
		function (parent, api, params, message) {

			// Modification check

			if (params && params[0] === parent.command) {
				if (params.length > 1) {
					parent.persistToggle(api, params[1], message);
				} else {
					api.sendMessage(parent.help, message.threadID);
				}
			}

			// Persistence check

			else if (parent.isPersistening()) {
				api.sendMessage(message.body, message.threadID);
			}
		}
	);

	this.status = new Command("status",
		"Informs you of the current status of " + BOTNAME,
		"No additional options available.",
		function(parent, api, params, message) {
			var onlineStatus = ON ? "online" : "offline";
			var persistentCommands = PERSISTENCE.join("; ");
			if (persistentCommands === "") persistentCommands = "<none>";
			var statusMessage = BOTNAME + " is currently " + onlineStatus + ". Active commands: " + persistentCommands  + ".";
			api.sendMessage(statusMessage, message.threadID);
		}
	);

};

