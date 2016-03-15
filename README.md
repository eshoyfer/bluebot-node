# bluebot-node
**bluebot-node** is a lightweight, server-side, IRC-style chat bot for Facebook group chats written in *Node.js*. It uses the *Node.js* [facebook-chat-api](https://www.npmjs.com/package/facebook-chat-api).

#### Installation

Ensure that you have the required dependencies installed, namely *Node.js* and facebook-chat-api. You can install the later with npm using `npm install facebook-chat-api`. 

The bot is configured by editing the `static.js` file. Configure like so:
```javascript
	// Login credentials
	this.EMAIL = /* valid Facebook log-in email address */
	this.PASSWORD = /* valid Facebook log-in password */

	// Settings

	this.THREAD_ID = /* valid Facebook thread ID */
	this.PREFIX = /* valid bot prefix, used to trigger commands e.g. @Botname */
	this.BOTNAME = /* valid bot name, e.g. Botname */

	this.ON = false; /* leave set to false */
```
`THREAD_ID` refers to the Thread ID of the group chat the bot will be active in. You can find it by accessing the group chat on Facebook and looking at the URL: 

![Thread ID](http://i.imgur.com/5ChAQVi.png)

The `facebook-chat-api` can be used to log into Facebook with an `AppState` loaded from a file in `bot.js` if desired. Refer to the appropriate section of the  `facebook-chat-api` [documentation](https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#login).

#### Usage

The bot is designed for the end-user to customize and add functionality as needed. It comes with a basic suite of commands: `on`, `off`, `help`, `echo`, `roll`, and `status`. These cover the fundamental requirements for the operation of the bot. A simple framework for writing your own commands is provided; simply instantiate a new object using the `Command` constructor. Store the object as an instance variable to `module.exports` in `commands.js`. Example:

```javascript
/* inside commands.js */

module.exports = function() {

    /* inside module.exports */

    /* construct this.roll with Command constructor */
    /* Command constructor format: new Command(String name, String description,  String help, Function implementation) */

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
}
```

The `roll` command automatically becomes accessible during chat use, activating with chat message `@Botname roll` (assuming `PREFIX` = `@Botname`) and appearing in the list generated by `@Botname help`. 

Persistence functionality is available by appending  to the `this.PERSISTENCE` array in `commands.js`. "Persistence" in this case refers to the binary (on/off) state of a command that must interact with each message sent to the chat, regardless of bot call by prefix.

An example of such a function is included as `echo`. Persistence of echo is activated with `@Botname echo on` and disabled with `@Botname echo off`. Once enabled, `echo` will parrot all following chat messages until turned off.

Refer to the implementation of the `Command` class in `command.js` to see the full range of functionality available.

Note that bot activity occurs in `bot.js` while commands are created in `commands.js`. This separation of logic makes it convenient for the end user to add functionality without understanding the nuances of the `bot.js` implementation. Of course, `bot.js` may comfortably be tweaked if this is desired.